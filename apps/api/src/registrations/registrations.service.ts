import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Registration,
  RegistrationItem,
  Event,
  TicketType,
  WaitlistEntry,
  User,
} from '../common';
import { CreateRegistrationDto } from './dto';
import { SseService } from '../sse/sse.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly regRepo: Repository<Registration>,
    @InjectRepository(RegistrationItem)
    private readonly regItemRepo: Repository<RegistrationItem>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepo: Repository<TicketType>,
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepo: Repository<WaitlistEntry>,
    private readonly dataSource: DataSource,
    private readonly sseService: SseService,
  ) {}

  async create(userId: number, dto: CreateRegistrationDto) {
    // Use a transaction for atomic capacity check
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = await queryRunner.manager.findOne(Event, {
        where: { id: dto.eventId },
        relations: { ticketTypes: true },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.status !== 'active') {
        throw new BadRequestException('Event is not active');
      }

      // Check if user is already registered
      const existingReg = await queryRunner.manager.findOne(Registration, {
        where: { userId, eventId: dto.eventId, status: 'confirmed' },
      });
      if (existingReg) {
        throw new ConflictException(
          'You are already registered for this event',
        );
      }

      // Calculate total quantity and price
      let totalQuantity = 0;
      let totalPrice = 0;

      for (const item of dto.items) {
        const ticketType = await queryRunner.manager.findOne(TicketType, {
          where: { id: item.ticketTypeId, eventId: dto.eventId },
        });

        if (!ticketType) {
          throw new NotFoundException(
            `Ticket type ${item.ticketTypeId} not found for this event`,
          );
        }

        if (item.quantity > ticketType.perOrderLimit) {
          throw new BadRequestException(
            `Quantity for "${ticketType.name}" exceeds per-order limit of ${ticketType.perOrderLimit}`,
          );
        }

        totalQuantity += item.quantity;
        totalPrice += item.quantity * ticketType.price;
      }

      // Check event capacity atomically
      const confirmedCount = await queryRunner.manager.count(Registration, {
        where: { eventId: dto.eventId, status: 'confirmed' },
      });

      const remainingCapacity = event.capacity - confirmedCount;
      if (totalQuantity > remainingCapacity) {
        const hasWaitlist = event.status === 'active';
        throw new ConflictException({
          message: 'Not enough capacity available',
          capacityAvailable: remainingCapacity,
          requested: totalQuantity,
          waitlistAvailable: hasWaitlist,
        });
      }

      // Create registration
      const registration = queryRunner.manager.create(Registration, {
        status: 'confirmed',
        totalPrice,
        userId,
        eventId: dto.eventId,
        user: { id: userId } as any,
        event: { id: dto.eventId } as any,
      });
      const savedReg = await queryRunner.manager.save(registration);

      // Create registration items
      for (const item of dto.items) {
        const ticketType = await queryRunner.manager.findOne(TicketType, {
          where: { id: item.ticketTypeId },
        });
        const regItem = queryRunner.manager.create(RegistrationItem, {
          quantity: item.quantity,
          unitPrice: ticketType!.price,
          registrationId: savedReg.id,
          ticketTypeId: item.ticketTypeId,
          registration: { id: savedReg.id } as any,
          ticketType: { id: item.ticketTypeId } as any,
        });
        await queryRunner.manager.save(regItem);
      }

      await queryRunner.commitTransaction();

      // Notify SSE after transaction
      const newConfirmedCount = confirmedCount + totalQuantity;
      this.sseService.emitCapacityUpdate(dto.eventId, {
        eventId: dto.eventId,
        capacity: event.capacity,
        confirmed: newConfirmedCount,
        remaining: event.capacity - newConfirmedCount,
      });

      if (newConfirmedCount >= event.capacity) {
        this.sseService.emitEventFull(dto.eventId, {
          eventId: dto.eventId,
          message: 'Event is now full',
        });
      }

      return this.findOne(savedReg.id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findMyRegistrations(userId: number) {
    const registrations = await this.regRepo.find({
      where: { userId },
      relations: {
        event: { ticketTypes: true },
        items: { ticketType: true },
      },
      order: { createdAt: 'DESC' },
    });

    return registrations.map((reg) => ({
      ...reg,
      event: reg.event
        ? {
            id: reg.event.id,
            title: reg.event.title,
            slug: reg.event.slug,
            date: reg.event.date,
            location: reg.event.location,
            category: reg.event.category,
            status: reg.event.status,
          }
        : null,
    }));
  }

  async findOne(id: number, userId: number) {
    const reg = await this.regRepo.findOne({
      where: { id },
      relations: {
        event: true,
        items: { ticketType: true },
        user: true,
      },
    });

    if (!reg) {
      throw new NotFoundException('Registration not found');
    }
    if (reg.userId !== userId) {
      throw new ForbiddenException('Not your registration');
    }

    return reg;
  }

  async cancel(userId: number, id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reg = await queryRunner.manager.findOne(Registration, {
        where: { id },
        relations: { items: true, event: true },
      });

      if (!reg) {
        throw new NotFoundException('Registration not found');
      }
      if (reg.userId !== userId) {
        throw new ForbiddenException('Not your registration');
      }
      if (reg.status === 'cancelled') {
        throw new BadRequestException('Registration already cancelled');
      }

      // Cancel registration
      reg.status = 'cancelled';
      reg.cancelledAt = new Date();
      await queryRunner.manager.save(reg);

      // Auto-promote first waitlist entry if exists
      const nextWaitlist = await queryRunner.manager.findOne(WaitlistEntry, {
        where: { eventId: reg.eventId, status: 'waiting' },
        order: { position: 'ASC' },
      });

      let promoted = false;
      if (nextWaitlist) {
        nextWaitlist.status = 'promoted';
        nextWaitlist.promotedAt = new Date();
        await queryRunner.manager.save(nextWaitlist);
        promoted = true;
      }

      await queryRunner.commitTransaction();

      // SSE updates
      const event = reg.event;
      const confirmedCount = await this.regRepo.count({
        where: { eventId: reg.eventId, status: 'confirmed' },
      });

      this.sseService.emitCapacityUpdate(reg.eventId, {
        eventId: reg.eventId,
        capacity: event.capacity,
        confirmed: confirmedCount,
        remaining: event.capacity - confirmedCount,
      });

      if (promoted) {
        this.sseService.emitWaitlistPromoted(reg.eventId, {
          eventId: reg.eventId,
          message: 'A waitlist entry has been promoted',
        });
      }

      return { message: 'Registration cancelled', promoted };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
