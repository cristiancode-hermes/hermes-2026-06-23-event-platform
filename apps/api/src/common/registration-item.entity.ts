import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Registration } from './registration.entity';
import { TicketType } from './ticket-type.entity';

@Entity()
export class RegistrationItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ type: 'real' })
  unitPrice: number;

  @ManyToOne(() => Registration, registration => registration.items)
  @JoinColumn({ name: 'registrationId' })
  registration: Registration;

  @Column()
  registrationId: number;

  @ManyToOne(() => TicketType)
  @JoinColumn({ name: 'ticketTypeId' })
  ticketType: TicketType;

  @Column()
  ticketTypeId: number;
}
