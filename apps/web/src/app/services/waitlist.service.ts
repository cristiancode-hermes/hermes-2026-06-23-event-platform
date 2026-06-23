import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = 'http://localhost:3000/api';

  join(eventId: string): Promise<any> {
    return firstValueFrom(
      this.http.post(
        `${this.apiUrl}/waitlist`,
        { eventId },
        { headers: this.auth.getHeaders() }
      )
    );
  }

  leave(eventId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/waitlist/${eventId}`, {
        headers: this.auth.getHeaders(),
      })
    );
  }

  getMy(): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/waitlist/my`, {
        headers: this.auth.getHeaders(),
      })
    );
  }
}
