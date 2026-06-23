import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { TicketType } from './ticket-type.entity';
import { Registration } from './registration.entity';
import { WaitlistEntry } from './waitlist-entry.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ unique: true, length: 250 })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ nullable: true, type: 'datetime' })
  endDate: Date;

  @Column({ length: 300 })
  location: string;

  @Column({ nullable: true, length: 50 })
  category: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column()
  capacity: number;

  @Column({ default: 'active' })
  status: string;

  @ManyToOne(() => User, user => user.events)
  @JoinColumn({ name: 'userId' })
  organizer: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TicketType, tt => tt.event, { cascade: true })
  ticketTypes: TicketType[];

  @OneToMany(() => Registration, reg => reg.event)
  registrations: Registration[];

  @OneToMany(() => WaitlistEntry, wl => wl.event)
  waitlistEntries: WaitlistEntry[];
}
