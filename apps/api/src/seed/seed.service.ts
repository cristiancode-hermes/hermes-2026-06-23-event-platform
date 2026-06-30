import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  User,
  Event,
  TicketType,
  Registration,
  RegistrationItem,
  WaitlistEntry,
} from '../common';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepo: Repository<TicketType>,
    @InjectRepository(Registration)
    private readonly regRepo: Repository<Registration>,
    @InjectRepository(RegistrationItem)
    private readonly regItemRepo: Repository<RegistrationItem>,
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepo: Repository<WaitlistEntry>,
  ) {}

  async seed() {
    // Check if data already exists (idempotent)
    const userCount = await this.userRepo.count();
    if (userCount > 0) {
      this.logger.log('Data already seeded, skipping...');
      return { message: 'Data already seeded' };
    }

    this.logger.log('Starting seed...');

    // 1. Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const organizer = this.userRepo.create({
      name: 'Organizer User',
      email: 'organizer@example.com',
      password: hashedPassword,
      bio: 'Event organizer and tech enthusiast',
    });
    const savedOrganizer = await this.userRepo.save(organizer);

    const attendee = this.userRepo.create({
      name: 'Attendee User',
      email: 'attendee@example.com',
      password: hashedPassword,
      bio: 'Love attending tech events',
    });
    const savedAttendee = await this.userRepo.save(attendee);

    this.logger.log('Users created');

    // 2. Create events
    const techConf = this.eventRepo.create({
      title: 'Tech Conference 2026',
      slug: 'tech-conference-2026',
      description:
        'The biggest tech conference of the year featuring keynotes from industry leaders, hands-on workshops, and networking opportunities.',
      date: new Date('2026-09-15T09:00:00Z'),
      endDate: new Date('2026-09-17T18:00:00Z'),
      location: 'Madrid, Spain',
      category: 'tech',
      imageUrl: 'https://example.com/techconf.jpg',
      capacity: 500,
      status: 'active',
      userId: savedOrganizer.id,
      organizer: { id: savedOrganizer.id },
    });
    const savedTechConf = await this.eventRepo.save(techConf);

    const designMeetup = this.eventRepo.create({
      title: 'Design Meetup',
      slug: 'design-meetup',
      description:
        'Monthly design meetup for UX/UI designers to share experiences and learn new techniques.',
      date: new Date('2026-07-20T16:00:00Z'),
      endDate: new Date('2026-07-20T20:00:00Z'),
      location: 'Barcelona, Spain',
      category: 'design',
      imageUrl: 'https://example.com/design.jpg',
      capacity: 50,
      status: 'active',
      userId: savedOrganizer.id,
      organizer: { id: savedOrganizer.id },
    });
    const savedDesignMeetup = await this.eventRepo.save(designMeetup);

    const ngWorkshop = this.eventRepo.create({
      title: 'Workshop Angular',
      slug: 'workshop-angular',
      description:
        'Intensive one-day workshop on Angular 19+ covering signals, standalone components, and new control flow.',
      date: new Date('2026-08-10T10:00:00Z'),
      endDate: new Date('2026-08-10T17:00:00Z'),
      location: 'Online',
      category: 'tech',
      imageUrl: 'https://example.com/angular.jpg',
      capacity: 30,
      status: 'active',
      userId: savedOrganizer.id,
      organizer: { id: savedOrganizer.id },
    });
    const savedNgWorkshop = await this.eventRepo.save(ngWorkshop);

    this.logger.log('Events created');

    // 3. Create ticket types
    const tickets = [
      // TechConf tickets
      {
        name: 'Early Bird',
        description: 'Full conference access at a discounted rate',
        price: 149.99,
        capacity: 100,
        perOrderLimit: 2,
        eventId: savedTechConf.id,
        event: { id: savedTechConf.id } as any,
      },
      {
        name: 'General Admission',
        description: 'Standard full conference access',
        price: 299.99,
        capacity: 300,
        perOrderLimit: 5,
        eventId: savedTechConf.id,
        event: { id: savedTechConf.id } as any,
      },
      {
        name: 'VIP',
        description:
          'VIP access with front-row seating and exclusive networking',
        price: 599.99,
        capacity: 100,
        perOrderLimit: 2,
        eventId: savedTechConf.id,
        event: { id: savedTechConf.id } as any,
      },
      // Design Meetup tickets
      {
        name: 'Standard',
        description: 'Regular admission',
        price: 10.0,
        capacity: 50,
        perOrderLimit: 3,
        eventId: savedDesignMeetup.id,
        event: { id: savedDesignMeetup.id } as any,
      },
      // Angular Workshop tickets
      {
        name: 'Workshop Access',
        description: 'Full workshop access with materials',
        price: 79.99,
        capacity: 30,
        perOrderLimit: 2,
        eventId: savedNgWorkshop.id,
        event: { id: savedNgWorkshop.id } as any,
      },
    ];

    const savedTickets = await this.ticketTypeRepo.save(
      tickets.map((t) => this.ticketTypeRepo.create(t)),
    );
    this.logger.log('Ticket types created');

    // 4. Create registrations
    const reg1 = this.regRepo.create({
      status: 'confirmed',
      totalPrice: 149.99,
      userId: savedAttendee.id,
      eventId: savedTechConf.id,
      user: { id: savedAttendee.id },
      event: { id: savedTechConf.id },
    });
    const savedReg1 = await this.regRepo.save(reg1);

    const reg2 = this.regRepo.create({
      status: 'confirmed',
      totalPrice: 599.99,
      userId: savedAttendee.id,
      eventId: savedTechConf.id,
      user: { id: savedAttendee.id },
      event: { id: savedTechConf.id },
    });
    const savedReg2 = await this.regRepo.save(reg2);

    const reg3 = this.regRepo.create({
      status: 'confirmed',
      totalPrice: 10.0,
      userId: savedAttendee.id,
      eventId: savedDesignMeetup.id,
      user: { id: savedAttendee.id },
      event: { id: savedDesignMeetup.id },
    });
    const savedReg3 = await this.regRepo.save(reg3);

    const reg4 = this.regRepo.create({
      status: 'confirmed',
      totalPrice: 79.99,
      userId: savedOrganizer.id,
      eventId: savedNgWorkshop.id,
      user: { id: savedOrganizer.id },
      event: { id: savedNgWorkshop.id },
    });
    const savedReg4 = await this.regRepo.save(reg4);

    const reg5 = this.regRepo.create({
      status: 'cancelled',
      totalPrice: 299.99,
      userId: savedAttendee.id,
      eventId: savedTechConf.id,
      user: { id: savedAttendee.id },
      event: { id: savedTechConf.id },
      cancelledAt: new Date(),
    });
    const savedReg5 = await this.regRepo.save(reg5);

    this.logger.log('Registrations created');

    // 5. Create registration items
    const items = [
      {
        quantity: 1,
        unitPrice: 149.99,
        registrationId: savedReg1.id,
        ticketTypeId: savedTickets[0].id,
        registration: { id: savedReg1.id } as any,
        ticketType: { id: savedTickets[0].id } as any,
      },
      {
        quantity: 1,
        unitPrice: 599.99,
        registrationId: savedReg2.id,
        ticketTypeId: savedTickets[2].id,
        registration: { id: savedReg2.id } as any,
        ticketType: { id: savedTickets[2].id } as any,
      },
      {
        quantity: 1,
        unitPrice: 10.0,
        registrationId: savedReg3.id,
        ticketTypeId: savedTickets[3].id,
        registration: { id: savedReg3.id } as any,
        ticketType: { id: savedTickets[3].id } as any,
      },
      {
        quantity: 1,
        unitPrice: 79.99,
        registrationId: savedReg4.id,
        ticketTypeId: savedTickets[4].id,
        registration: { id: savedReg4.id } as any,
        ticketType: { id: savedTickets[4].id } as any,
      },
      {
        quantity: 1,
        unitPrice: 299.99,
        registrationId: savedReg5.id,
        ticketTypeId: savedTickets[1].id,
        registration: { id: savedReg5.id } as any,
        ticketType: { id: savedTickets[1].id } as any,
      },
      {
        quantity: 2,
        unitPrice: 10.0,
        registrationId: savedReg3.id,
        ticketTypeId: savedTickets[3].id,
        registration: { id: savedReg3.id } as any,
        ticketType: { id: savedTickets[3].id } as any,
      },
      {
        quantity: 1,
        unitPrice: 79.99,
        registrationId: savedReg4.id,
        ticketTypeId: savedTickets[4].id,
        registration: { id: savedReg4.id } as any,
        ticketType: { id: savedTickets[4].id } as any,
      },
    ];

    await this.regItemRepo.save(items.map((i) => this.regItemRepo.create(i)));
    this.logger.log('Registration items created');

    // 6. Create waitlist entries
    const waitlist1 = this.waitlistRepo.create({
      position: 1,
      status: 'waiting',
      userId: savedAttendee.id,
      eventId: savedNgWorkshop.id,
      user: { id: savedAttendee.id },
      event: { id: savedNgWorkshop.id },
    });
    await this.waitlistRepo.save(waitlist1);

    const waitlist2 = this.waitlistRepo.create({
      position: 2,
      status: 'waiting',
      userId: savedOrganizer.id,
      eventId: savedNgWorkshop.id,
      user: { id: savedOrganizer.id },
      event: { id: savedNgWorkshop.id },
    });
    await this.waitlistRepo.save(waitlist2);

    this.logger.log('Waitlist entries created');

    this.logger.log('Seed completed successfully');
    return {
      message: 'Seed completed successfully',
      users: 2,
      events: 3,
      ticketTypes: 5,
      registrations: 5,
      registrationItems: 7,
      waitlistEntries: 2,
    };
  }
}
