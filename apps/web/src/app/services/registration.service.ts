import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Registration, CreateRegistrationRequest } from '../models/registration.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = 'http://localhost:3000/api';

  create(data: CreateRegistrationRequest): Promise<Registration> {
    return firstValueFrom(
      this.http.post<Registration>(`${this.apiUrl}/registrations`, data, {
        headers: this.auth.getHeaders(),
      })
    );
  }

  getMy(): Promise<Registration[]> {
    return firstValueFrom(
      this.http.get<Registration[]>(`${this.apiUrl}/registrations/my`, {
        headers: this.auth.getHeaders(),
      })
    );
  }

  getById(id: string): Promise<Registration> {
    return firstValueFrom(
      this.http.get<Registration>(`${this.apiUrl}/registrations/${id}`, {
        headers: this.auth.getHeaders(),
      })
    );
  }

  cancel(id: string): Promise<Registration> {
    return firstValueFrom(
      this.http.put<Registration>(
        `${this.apiUrl}/registrations/${id}/cancel`,
        {},
        { headers: this.auth.getHeaders() }
      )
    );
  }
}
