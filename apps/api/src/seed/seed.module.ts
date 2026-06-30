import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import {
  User,
  Event,
  TicketType,
  Registration,
  RegistrationItem,
  WaitlistEntry,
} from '../common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Event,
      TicketType,
      Registration,
      RegistrationItem,
      WaitlistEntry,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
