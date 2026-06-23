import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  private readonly tokenSignal = signal<string | null>(localStorage.getItem('auth_token'));
  private readonly userSignal = signal<User | null>(this.loadUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.tokenSignal() !== null);

  private loadUser(): User | null {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
    return null;
  }

  async login(credentials: LoginRequest): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
    );
    this.setSession(res);
    return res.user;
  }

  async register(data: RegisterRequest): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data)
    );
    this.setSession(res);
    return res.user;
  }

  async getProfile(): Promise<User> {
    const res = await firstValueFrom(
      this.http.get<User>(`${this.apiUrl}/auth/profile`, {
        headers: this.getHeaders(),
      })
    );
    this.userSignal.set(res);
    localStorage.setItem('auth_user', JSON.stringify(res));
    return res;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await firstValueFrom(
      this.http.put<User>(`${this.apiUrl}/auth/profile`, data, {
        headers: this.getHeaders(),
      })
    );
    this.userSignal.set(res);
    localStorage.setItem('auth_user', JSON.stringify(res));
    return res;
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  getHeaders(): Record<string, string> {
    const token = this.tokenSignal();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
    this.tokenSignal.set(res.token);
    this.userSignal.set(res.user);
  }
}
