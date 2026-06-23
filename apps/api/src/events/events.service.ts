import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event, TicketType, User } from '../common';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepo: Repository<TicketType>,
  ) {}

  async findAll(query: any) {
    const { page = 1, limit = 10, search, category, dateFrom, dateTo, location, sortBy = 'date', sortOrder = 'ASC' } = query;
    const qb = this.eventRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.ticketTypes', 'ticketTypes')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .where('event.status = :status', { status: 'active' });

    if (search) {
      qb.andWhere('(event.title LIKE :search OR event.description LIKE :search OR event.location LIKE :search)', { search: `%${search}%` });
    }
    if (category) {
      qb.andWhere('event.category = :category', { category });
    }
    if (dateFrom) {
      qb.andWhere('event.date >= :dateFrom', { dateFrom: new Date(dateFrom) });
    }
    if (dateTo) {
      qb.andWhere('event.date <= :dateTo', { dateTo: new Date(dateTo) });
    }
    if (location) {
      qb.andWhere('event.location LIKE :location', { location: `%${location}%` });
    }

    const sortMap: Record<string, string> = { date: 'event.date', title: 'event.title' };
    const sortColumn = sortMap[sortBy] || 'event.date';
    qb.orderBy(sortColumn, sortOrder);

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: { ticketTypes: true, organizer: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findBySlug(slug: string) {
    const event = await this.eventRepo.findOne({
      where: { slug },
      relations: { ticketTypes: true, organizer: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findMyEvents(userId: number) {
    return this.eventRepo.find({
      where: { userId },
      relations: { ticketTypes: true },
      order: { date: 'DESC' },
    });
  }

  async create(userId: number, dto: any) {
    const event = this.eventRepo.create({
      title: dto.title,
      slug: dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: dto.description,
      date: new Date(dto.date),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      location: dto.location,
      category: dto.category,
      imageUrl: dto.imageUrl,
      capacity: dto.capacity,
      status: 'active',
      userId,
      organizer: { id: userId } as any,
    });
    const saved = await this.eventRepo.save(event);

    if (dto.ticketTypes?.length) {
      const ticketTypes = dto.ticketTypes.map((tt: any) =>
        this.ticketTypeRepo.create({ ...tt, eventId: saved.id, event: { id: saved.id } as any }),
      );
      await this.ticketTypeRepo.save(ticketTypes);
    }

    return this.findOne(saved.id);
  }

  async update(userId: number, id: number, dto: any) {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new ForbiddenException('Not your event');

    if (dto.title !== undefined) event.title = dto.title;
    if (dto.slug !== undefined) event.slug = dto.slug;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.date !== undefined) event.date = new Date(dto.date);
    if (dto.endDate !== undefined) event.endDate = dto.endDate ? new Date(dto.endDate) : undefined as any;
    if (dto.location !== undefined) event.location = dto.location;
    if (dto.category !== undefined) event.category = dto.category;
    if (dto.imageUrl !== undefined) event.imageUrl = dto.imageUrl;
    if (dto.capacity !== undefined) event.capacity = dto.capacity;
    if (dto.status !== undefined) event.status = dto.status;

    const saved = await this.eventRepo.save(event);
    return this.findOne(saved.id);
  }

  async remove(userId: number, id: number) {
    const event = await this.eventRepo.findOne({ where: { id }, relations: { registrations: true } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new ForbiddenException('Not your event');
    const activeRegs = event.registrations?.filter(r => r.status === 'confirmed') || [];
    if (activeRegs.length > 0) {
      event.status = 'cancelled';
      await this.eventRepo.save(event);
      return { message: 'Event cancelled (has active registrations)' };
    }
    await this.eventRepo.remove(event);
    return { message: 'Event deleted' };
  }

  async getAttendees(eventId: number, userId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new ForbiddenException('Not your event');

    const { Registration } = require('../common');
    const regRepo = this.eventRepo.manager.getRepository(Registration);
    return regRepo.find({
      where: { eventId, status: 'confirmed' },
      relations: { user: true, items: { ticketType: true } },
      order: { createdAt: 'DESC' } as any,
    });
  }

  async getWaitlist(eventId: number, userId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new ForbiddenException('Not your event');

    const { WaitlistEntry } = require('../common');
    const wlRepo = this.eventRepo.manager.getRepository(WaitlistEntry);
    return wlRepo.find({
      where: { eventId, status: 'waiting' },
      relations: { user: true },
      order: { position: 'ASC' } as any,
    });
  }
}
