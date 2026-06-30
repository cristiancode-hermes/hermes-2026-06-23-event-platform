import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';
import { RegistrationItem } from './registration-item.entity';

@Entity()
export class Registration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'confirmed' })
  status: string;

  @Column({ type: 'real', default: 0 })
  totalPrice: number;

  @ManyToOne(() => User, (user) => user.registrations)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Event, (event) => event.registrations)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  cancelledAt: Date;

  @OneToMany(() => RegistrationItem, (ri) => ri.registration, { cascade: true })
  items: RegistrationItem[];
}
