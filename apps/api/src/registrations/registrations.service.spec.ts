import { RegistrationsService } from './registrations.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('RegistrationsService', () => {
  let service: RegistrationsService;
  let mockRegRepo: any;
  let mockRegItemRepo: any;
  let mockEventRepo: any;
  let mockTicketTypeRepo: any;
  let mockWaitlistRepo: any;
  let mockDataSource: any;
  let mockSseService: any;
  let mockQueryRunner: any;

  const mockEvent = {
    id: 1,
    title: 'TechConf 2026',
    capacity: 100,
    status: 'active',
    ticketTypes: [
      { id: 1, name: 'General', price: 50, capacity: 100, perOrderLimit: 5 },
    ],
  };

  const mockRegistration = {
    id: 1,
    status: 'confirmed',
    totalPrice: 100,
    userId: 1,
    eventId: 1,
    createdAt: new Date(),
    items: [
      { id: 1, quantity: 2, unitPrice: 50, ticketType: { id: 1, name: 'General' } },
    ],
    event: mockEvent,
  };

  const createDto = {
    eventId: 1,
    items: [{ ticketTypeId: 1, quantity: 2 }],
  };

  beforeEach(() => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    mockRegRepo = { find: jest.fn(), findOne: jest.fn(), count: jest.fn() };
    mockRegItemRepo = {};
    mockEventRepo = {};
    mockTicketTypeRepo = {};
    mockWaitlistRepo = {};

    mockSseService = {
      emitCapacityUpdate: jest.fn(),
      emitEventFull: jest.fn(),
      emitWaitlistPromoted: jest.fn(),
    };

    service = new RegistrationsService(
      mockRegRepo,
      mockRegItemRepo,
      mockEventRepo,
      mockTicketTypeRepo,
      mockWaitlistRepo,
      mockDataSource,
      mockSseService,
    );
  });

  describe('create', () => {
    it('should register user successfully in transaction', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockEvent)      // event lookup
        .mockResolvedValueOnce(null)            // existing registration check
        .mockResolvedValueOnce({ id: 1, name: 'General', price: 50, capacity: 100, perOrderLimit: 5 }) // ticket type validation
        .mockResolvedValueOnce({ id: 1, name: 'General', price: 50, capacity: 100, perOrderLimit: 5 }); // ticket type creation
      mockQueryRunner.manager.count.mockResolvedValue(50); // 50 confirmed, 50 remaining
      mockQueryRunner.manager.create.mockReturnValue(mockRegistration);
      mockQueryRunner.manager.save.mockResolvedValue(mockRegistration);
      mockRegRepo.findOne.mockResolvedValue(mockRegistration);

      const result = await service.create(1, createDto);

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockSseService.emitCapacityUpdate).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          eventId: 1,
          confirmed: 52,
          remaining: 48,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);

      await expect(service.create(1, createDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if event is not active', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockEvent,
        status: 'cancelled',
      });

      await expect(service.create(1, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if user already registered', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockEvent)       // event
        .mockResolvedValueOnce(mockRegistration); // existing reg

      await expect(service.create(1, createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if quantity exceeds per-order limit', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockEvent)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockEvent.ticketTypes[0]);

      await expect(
        service.create(1, {
          eventId: 1,
          items: [{ ticketTypeId: 1, quantity: 10 }], // limit is 5
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if not enough capacity', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockEvent)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockEvent.ticketTypes[0]);
      mockQueryRunner.manager.count.mockResolvedValue(99); // 1 remaining, requested 2

      try {
        await service.create(1, createDto);
        fail('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.response.capacityAvailable).toBe(1);
        expect(error.response.requested).toBe(2);
      }
    });

    it('should rollback and release on error', async () => {
      mockQueryRunner.manager.findOne.mockRejectedValueOnce(
        new Error('DB error'),
      );

      await expect(service.create(1, createDto)).rejects.toThrow('DB error');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel registration and promote waitlist', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce({ ...mockRegistration, status: 'confirmed' })
        .mockResolvedValueOnce({
          id: 10,
          userId: 2,
          status: 'waiting',
          position: 1,
        });
      mockRegRepo.count.mockResolvedValue(48);

      const result = await service.cancel(1, 1);

      expect(result.message).toContain('cancelled');
      expect(result.promoted).toBe(true);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockSseService.emitCapacityUpdate).toHaveBeenCalled();
      expect(mockSseService.emitWaitlistPromoted).toHaveBeenCalled();
    });

    it('should throw NotFoundException if registration not found', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);

      await expect(service.cancel(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not the owner', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockRegistration,
        userId: 2,
      });

      await expect(service.cancel(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if already cancelled', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockRegistration,
        status: 'cancelled',
      });

      await expect(service.cancel(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findMyRegistrations', () => {
    it('should return registrations with sanitized event data', async () => {
      mockRegRepo.find.mockResolvedValue([mockRegistration]);

      const result = await service.findMyRegistrations(1);

      expect(result).toHaveLength(1);
      expect(result[0].event).toBeDefined();
      expect(result[0].event.title).toBe('TechConf 2026');
    });
  });

  describe('findOne', () => {
    it('should return registration when found and owned by user', async () => {
      mockRegRepo.findOne.mockResolvedValue(mockRegistration);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockRegistration);
    });

    it('should throw ForbiddenException if not owned by user', async () => {
      mockRegRepo.findOne.mockResolvedValue(mockRegistration);

      await expect(service.findOne(1, 2)).rejects.toThrow(ForbiddenException);
    });
  });
});
