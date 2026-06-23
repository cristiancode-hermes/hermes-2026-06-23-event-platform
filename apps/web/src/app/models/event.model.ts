export interface EventModel {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  category: EventCategory;
  imageUrl?: string;
  maxCapacity: number;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  owner?: { id: string; name: string; email: string };
  ticketTypes?: TicketType[];
  registrationCount?: number;
  waitlistCount?: number;
  status?: EventStatus;
}

export type EventCategory =
  | 'conference'
  | 'workshop'
  | 'meetup'
  | 'social'
  | 'concert'
  | 'sports'
  | 'other';

export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'cancelled';

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  capacity: number;
  available: number;
  perOrderLimit: number;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  category: EventCategory;
  imageUrl?: string;
  maxCapacity: number;
  ticketTypes: Omit<TicketType, 'id' | 'available'>[];
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}
