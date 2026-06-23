import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface CapacityUpdate {
  eventId: number;
  capacity: number;
  confirmed: number;
  remaining: number;
}

export interface EventFullEvent {
  eventId: number;
  message: string;
}

export interface WaitlistPromotedEvent {
  eventId: number;
  message: string;
}

type SseEvent =
  | { type: 'capacity_update'; data: CapacityUpdate }
  | { type: 'event_full'; data: EventFullEvent }
  | { type: 'waitlist_promoted'; data: WaitlistPromotedEvent };

@Injectable()
export class SseService {
  private eventSubject = new Subject<SseEvent>();

  emitCapacityUpdate(eventId: number, data: CapacityUpdate) {
    this.eventSubject.next({ type: 'capacity_update', data });
  }

  emitEventFull(eventId: number, data: EventFullEvent) {
    this.eventSubject.next({ type: 'event_full', data });
  }

  emitWaitlistPromoted(eventId: number, data: WaitlistPromotedEvent) {
    this.eventSubject.next({ type: 'waitlist_promoted', data });
  }

  getEventStream(eventId: number): Observable<SseEvent> {
    return this.eventSubject.asObservable().pipe(
      filter(
        (event) =>
          (event.type === 'capacity_update' && event.data.eventId === eventId) ||
          (event.type === 'event_full' && event.data.eventId === eventId) ||
          (event.type === 'waitlist_promoted' && event.data.eventId === eventId),
      ),
    );
  }
}
