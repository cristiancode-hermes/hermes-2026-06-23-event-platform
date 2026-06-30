import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Event, Registration, WaitlistEntry, User } from '../common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Registration, WaitlistEntry, User]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
