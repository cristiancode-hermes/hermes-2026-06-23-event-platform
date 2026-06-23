import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { EventModel, CreateEventRequest, UpdateEventRequest } from '../models/event.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = 'http://localhost:3000/api';

  getAll(params?: { search?: string; filter?: string }): Promise<EventModel[]> {
    const query = new URLSearchParams();
    if (params?.['search']) query.set('search', params['search']);
    if (params?.['filter']) query.set('filter', params['filter']);
    const qs = query.toString();
    const url = `${this.apiUrl}/events${qs ? '?' + qs : ''}`;
    return firstValueFrom(this.http.get<EventModel[]>(url));
  }

  getById(id: string): Promise<EventModel> {
    return firstValueFrom(this.http.get<EventModel>(`${this.apiUrl}/events/${id}`));
  }

  getMy(): Promise<EventModel[]> {
    return firstValueFrom(
      this.http.get<EventModel[]>(`${this.apiUrl}/events/my`, {
        headers: this.auth.getHeaders(),
      })
    );
  }

  create(data: CreateEventRequest): Promise<EventModel> {
    return firstValueFrom(
      this.http.post<EventModel>(`${this.apiUrl}/events`, data, {
        headers: this.auth.getHeaders(),
      })
    );
  }

  update(id: string, data: UpdateEventRequest): Promise<EventModel> {
    return firstValueFrom(
      this.http.put<EventModel>(`${this.apiUrl}/events/${id}`, data, {
        headers: this.auth.getHeaders(),
      })
    );
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/events/${id}`, {
        headers: this.auth.getHeaders(),
      })
    );
  }

  getAttendees(id: string): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/events/${id}/attendees`, {
        headers: this.auth.getHeaders(),
      })
    );
  }

  getWaitlist(id: string): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/events/${id}/waitlist`, {
        headers: this.auth.getHeaders(),
      })
    );
  }
}
