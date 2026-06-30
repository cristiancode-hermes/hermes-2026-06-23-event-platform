import { WaitlistService } from './waitlist.service';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

describe('WaitlistService', () => {
  let service: WaitlistService;
  let mockWaitlistRepo: any;
  let mockEventRepo: any;

  const mockEvent = { id: 1, title: 'Full Event', capacity: 50, status: 'active' };
  const mockEntry = {
    id: 1,
    userId: 1,
    eventId: 1,
    position: 1,
    status: 'waiting',
    user: { id: 1, name: 'Test User' },
    event: mockEvent,
  };
  const joinDto = { eventId: 1 };

  beforeEach(() => {
    mockWaitlistRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
    };
    mockEventRepo = { findOne: jest.fn() };

    service = new WaitlistService(mockWaitlistRepo, mockEventRepo);
  });

  describe('join', () => {
    it('should add user to waitlist with next position', async () => {
      mockEventRepo.findOne.mockResolvedValue(mockEvent);
      mockWaitlistRepo.findOne
        .mockResolvedValueOnce(null) // no existing entry
        .mockResolvedValueOnce(null); // no last entry (first)
      mockWaitlistRepo.create.mockReturnValue(mockEntry);
      mockWaitlistRepo.save.mockResolvedValue(mockEntry);

      const result = await service.join(1, joinDto);

      expect(mockWaitlistRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          eventId: 1,
          position: 1,
          status: 'waiting',
        }),
      );
      expect(result).toEqual(mockEntry);
    });

    it('should increment position when others are already waiting', async () => {
      mockEventRepo.findOne.mockResolvedValue(mockEvent);
      mockWaitlistRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ position: 5 });
      mockWaitlistRepo.create.mockReturnValue({ ...mockEntry, position: 6 });
      mockWaitlistRepo.save.mockResolvedValue({ ...mockEntry, position: 6 });

      const result = await service.join(2, joinDto);

      expect(mockWaitlistRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ position: 6 }),
      );
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(service.join(1, joinDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if already on waitlist', async () => {
      mockEventRepo.findOne.mockResolvedValue(mockEvent);
      mockWaitlistRepo.findOne.mockResolvedValueOnce(mockEntry);

      await expect(service.join(1, joinDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('leave', () => {
    it('should remove waitlist entry owned by user', async () => {
      mockWaitlistRepo.findOne.mockResolvedValue(mockEntry);

      const result = await service.leave(1, 1);

      expect(mockWaitlistRepo.remove).toHaveBeenCalledWith(mockEntry);
      expect(result.message).toContain('Left waitlist');
    });

    it('should throw NotFoundException if entry not found', async () => {
      mockWaitlistRepo.findOne.mockResolvedValue(null);

      await expect(service.leave(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not the owner', async () => {
      mockWaitlistRepo.findOne.mockResolvedValue({ ...mockEntry, userId: 2 });

      await expect(service.leave(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('myWaitlist', () => {
    it('should return user waitlist entries ordered by position', async () => {
      mockWaitlistRepo.find.mockResolvedValue([mockEntry]);

      const result = await service.myWaitlist(1);

      expect(result).toHaveLength(1);
      expect(mockWaitlistRepo.find).toHaveBeenCalledWith({
        where: { userId: 1, status: 'waiting' },
        relations: { event: true },
        order: { position: 'ASC' },
      });
    });
  });
});
