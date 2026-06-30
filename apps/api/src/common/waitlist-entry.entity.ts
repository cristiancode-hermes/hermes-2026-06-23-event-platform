import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';

@Entity()
export class WaitlistEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  position: number;

  @Column({ default: 'waiting' })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Event, (event) => event.waitlistEntries)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  promotedAt: Date;
}
