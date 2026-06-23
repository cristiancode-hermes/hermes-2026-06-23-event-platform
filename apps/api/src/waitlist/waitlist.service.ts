import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaitlistEntry, Event } from '../common';
import { JoinWaitlistDto } from './dto';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepo: Repository<WaitlistEntry>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  async join(userId: number, dto: JoinWaitlistDto) {
    const event = await this.eventRepo.findOne({ where: { id: dto.eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if already on waitlist
    const existing = await this.waitlistRepo.findOne({
      where: { userId, eventId: dto.eventId, status: 'waiting' },
    });
    if (existing) {
      throw new ConflictException('You are already on the waitlist for this event');
    }

    // Get next position using query builder
    const lastEntry = await this.waitlistRepo.findOne({
      where: { eventId: dto.eventId },
      order: { position: 'DESC' },
    });

    const entry = this.waitlistRepo.create({
      userId,
      eventId: dto.eventId,
      position: (lastEntry?.position ?? 0) + 1,
      status: 'waiting',
      user: { id: userId } as any,
      event: { id: dto.eventId } as any,
    });

    return this.waitlistRepo.save(entry);
  }

  async leave(userId: number, id: number) {
    const entry = await this.waitlistRepo.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenException('Not your waitlist entry');
    }

    await this.waitlistRepo.remove(entry);
    return { message: 'Left waitlist successfully' };
  }

  async myWaitlist(userId: number) {
    return this.waitlistRepo.find({
      where: { userId, status: 'waiting' },
      relations: { event: true },
      order: { position: 'ASC' },
    });
  }
}
