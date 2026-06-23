import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Event } from './event.entity';
import { RegistrationItem } from './registration-item.entity';

@Entity()
export class TicketType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'real', default: 0 })
  price: number;

  @Column()
  capacity: number;

  @Column({ default: 5 })
  perOrderLimit: number;

  @ManyToOne(() => Event, event => event.ticketTypes)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => RegistrationItem, ri => ri.ticketType)
  registrationItems: RegistrationItem[];
}
