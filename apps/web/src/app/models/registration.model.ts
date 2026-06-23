import type { EventModel } from './event.model';

export interface Registration {
  id: string;
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  tickets: RegistrationTicket[];
  totalAmount: number;
  status: RegistrationStatus;
  createdAt?: string;
  event?: EventModel;
}

export interface RegistrationTicket {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
}

export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled' | 'attended';

export interface CreateRegistrationRequest {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  tickets: { ticketTypeId: string; quantity: number }[];
  termsAccepted: boolean;
}
