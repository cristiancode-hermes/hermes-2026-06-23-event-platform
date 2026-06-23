import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Event, Registration, WaitlistEntry, User } from '../common';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Registration)
    private readonly regRepo: Repository<Registration>,
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepo: Repository<WaitlistEntry>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getStats(userId: number) {
    // My events stats
    const myEvents = await this.eventRepo.find({
      where: { userId },
      relations: { registrations: true },
    });

    const totalEvents = myEvents.length;
    const activeEvents = myEvents.filter((e) => e.status === 'active').length;
    const draftEvents = myEvents.filter((e) => e.status === 'draft').length;
    const totalRegistrations = myEvents.reduce(
      (sum, e) => sum + e.registrations.filter((r) => r.status === 'confirmed').length,
      0,
    );

    const upcoming = myEvents
      .filter((e) => e.status === 'active' && new Date(e.date) > new Date())
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        registrationsCount: e.registrations.filter((r) => r.status === 'confirmed').length,
      }));

    // My registrations stats
    const myRegs = await this.regRepo.find({
      where: { userId },
      relations: { event: true },
    });

    const totalMyRegistrations = myRegs.length;
    const upcomingRegs = myRegs.filter(
      (r) => r.status === 'confirmed' && r.event && new Date(r.event.date) > new Date(),
    ).length;
    const pastRegs = myRegs.filter(
      (r) => r.status === 'confirmed' && r.event && new Date(r.event.date) <= new Date(),
    ).length;

    // My waitlist
    const myWaitlisted = await this.waitlistRepo.count({
      where: { userId, status: 'waiting' },
    });

    return {
      myEvents: {
        total: totalEvents,
        active: activeEvents,
        draft: draftEvents,
        totalRegistrations,
        upcoming,
      },
      myRegistrations: {
        total: totalMyRegistrations,
        upcoming: upcomingRegs,
        past: pastRegs,
        waitlisted: myWaitlisted,
      },
    };
  }
}
