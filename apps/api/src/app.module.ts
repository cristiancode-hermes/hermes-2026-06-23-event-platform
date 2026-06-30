import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SseModule } from './sse/sse.module';
import { SeedModule } from './seed/seed.module';
import { JwtAuthGuard } from './auth/auth.guard';
import {
  User,
  Event,
  TicketType,
  Registration,
  RegistrationItem,
  WaitlistEntry,
} from './common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DATABASE_URL', 'data/events.db'),
        entities: [
          User,
          Event,
          TicketType,
          Registration,
          RegistrationItem,
          WaitlistEntry,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    EventsModule,
    RegistrationsModule,
    WaitlistModule,
    DashboardModule,
    SseModule,
    SeedModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
