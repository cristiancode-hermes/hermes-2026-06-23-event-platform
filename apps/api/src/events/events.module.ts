import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import {
  Event,
  TicketType,
  Registration,
  RegistrationItem,
  WaitlistEntry,
} from '../common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      TicketType,
      Registration,
      RegistrationItem,
      WaitlistEntry,
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
