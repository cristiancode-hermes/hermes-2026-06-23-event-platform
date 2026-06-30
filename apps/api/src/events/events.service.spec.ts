import { EventsService } from './events.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('EventsService', () => {
  let eventsService: EventsService;
  let mockEventRepo: any;
  let mockTicketTypeRepo: any;

  const mockEvent = {
    id: 1,
    title: 'TechConf 2026',
    slug: 'techconf-2026',
    description: 'A tech conference',
    date: new Date('2026-07-15'),
    endDate: new Date('2026-07-16'),
    location: 'Madrid',
    category: 'conference',
    imageUrl: null,
    capacity: 500,
    status: 'active',
    userId: 1,
    organizer: { id: 1, name: 'Organizer', email: 'org@test.com' },
    ticketTypes: [
      { id: 1, name: 'General', price: 50, capacity: 300, eventId: 1 },
    ],
    registrations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let qbBuilder: any;

  beforeEach(() => {
    qbBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockEvent], 1]),
    };
    mockEventRepo = {
      createQueryBuilder: jest.fn(() => qbBuilder),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          find: jest.fn().mockResolvedValue([]),
        }),
      },
    };
    mockTicketTypeRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };
    eventsService = new EventsService(mockEventRepo, mockTicketTypeRepo);
  });

  describe('findAll', () => {
    it('should return paginated events with default params', async () => {
      const result = await eventsService.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should apply search filter when provided', async () => {
      await eventsService.findAll({ search: 'tech' });

      expect(qbBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('title LIKE'),
        expect.objectContaining({ search: expect.stringContaining('tech') }),
      );
    });

    it('should apply category filter when provided', async () => {
      await eventsService.findAll({ category: 'workshop' });

      expect(qbBuilder.andWhere).toHaveBeenCalledWith(
        'event.category = :category',
        { category: 'workshop' },
      );
    });

    it('should apply date range filters when provided', async () => {
      await eventsService.findAll({
        dateFrom: '2026-01-01',
        dateTo: '2026-12-31',
      });

      expect(qbBuilder.andWhere).toHaveBeenCalledWith(
        'event.date >= :dateFrom',
        expect.any(Object),
      );
      expect(qbBuilder.andWhere).toHaveBeenCalledWith(
        'event.date <= :dateTo',
        expect.any(Object),
      );
    });
  });

  describe('findOne', () => {
    it('should return event when found', async () => {
      mockEventRepo.findOne.mockResolvedValue(mockEvent);

      const result = await eventsService.findOne(1);

      expect(result).toEqual(mockEvent);
      expect(mockEventRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { ticketTypes: true, organizer: true },
      });
    });

    it('should throw NotFoundException when event not found', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(eventsService.findOne(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return event by slug', async () => {
      mockEventRepo.findOne.mockResolvedValue(mockEvent);

      const result = await eventsService.findBySlug('techconf-2026');

      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException when slug not found', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(
        eventsService.findBySlug('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMyEvents', () => {
    it('should return events owned by user', async () => {
      mockEventRepo.find.mockResolvedValue([mockEvent]);

      const result = await eventsService.findMyEvents(1);

      expect(result).toHaveLength(1);
      expect(mockEventRepo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: { ticketTypes: true },
        order: { date: 'DESC' },
      });
    });
  });

  describe('create', () => {
    const createDto = {
      title: 'New Event',
      description: 'Description',
      date: '2026-08-01',
      location: 'Barcelona',
      category: 'workshop',
      capacity: 200,
      ticketTypes: [{ name: 'Standard', price: 25, capacity: 200 }],
    };

    it('should create event with slug from title', async () => {
      mockEventRepo.create.mockReturnValue({ ...mockEvent, id: 2, title: 'New Event' });
      mockEventRepo.save.mockResolvedValue({ ...mockEvent, id: 2, title: 'New Event' });
      mockEventRepo.findOne.mockResolvedValue({ ...mockEvent, id: 2, title: 'New Event' });

      const result = await eventsService.create(1, createDto);

      expect(mockEventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Event',
          slug: 'new-event',
          userId: 1,
          status: 'active',
        }),
      );
      expect(result).toBeDefined();
    });

    it('should create ticket types when provided', async () => {
      mockEventRepo.create.mockReturnValue(mockEvent);
      mockEventRepo.save.mockResolvedValue(mockEvent);
      mockEventRepo.findOne.mockResolvedValue(mockEvent);

      await eventsService.create(1, createDto);

      expect(mockTicketTypeRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ eventId: 1 }),
      );
      expect(mockTicketTypeRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update event title', async () => {
      mockEventRepo.findOne.mockResolvedValue({ ...mockEvent });
      mockEventRepo.save.mockResolvedValue({ ...mockEvent, title: 'Updated' });

      const result = await eventsService.update(1, 1, { title: 'Updated' });

      expect(mockEventRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated' }),
      );
    });

    it('should throw ForbiddenException if not the owner', async () => {
      mockEventRepo.findOne.mockResolvedValue({ ...mockEvent, userId: 2 });

      await expect(
        eventsService.update(1, 1, { title: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(
        eventsService.update(1, 999, { title: 'Ghost' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should cancel event when it has active registrations', async () => {
      mockEventRepo.findOne.mockResolvedValue({
        ...mockEvent,
        registrations: [{ status: 'confirmed' }],
      });
      mockEventRepo.save.mockResolvedValue({ ...mockEvent, status: 'cancelled' });

      const result = await eventsService.remove(1, 1);

      expect(result.message).toContain('cancelled');
      expect(mockEventRepo.save).toHaveBeenCalled();
      expect(mockEventRepo.remove).not.toHaveBeenCalled();
    });

    it('should fully delete event when no active registrations', async () => {
      mockEventRepo.findOne.mockResolvedValue({
        ...mockEvent,
        registrations: [],
      });

      const result = await eventsService.remove(1, 1);

      expect(result.message).toContain('deleted');
      expect(mockEventRepo.remove).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not the owner', async () => {
      mockEventRepo.findOne.mockResolvedValue({ ...mockEvent, userId: 2 });

      await expect(eventsService.remove(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
