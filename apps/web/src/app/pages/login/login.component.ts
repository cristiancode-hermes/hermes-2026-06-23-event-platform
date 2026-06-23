import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { LoadingButtonComponent } from '../../shared/components/loading-button/loading-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, FormFieldComponent, LoadingButtonComponent],
  template: `
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-100">Welcome back</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Sign in to manage your events</p>
      </div>

      @if (errorMessage()) {
        <div class="flex items-center gap-2 p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 text-sm text-danger-700 dark:text-danger-300 border border-danger-200 dark:border-danger-800">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 flex-shrink-0">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
          </svg>
          {{ errorMessage() }}
        </div>
      }

      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <app-form-field label="Email" [required]="true" [error]="emailError()">
          <input
            [(ngModel)]="email"
            name="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-colors"
          />
        </app-form-field>

        <app-form-field label="Password" [required]="true" [error]="passwordError()">
          <input
            [(ngModel)]="password"
            name="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
            class="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-colors"
          />
        </app-form-field>

        <app-loading-button
          [loading]="loading()"
          loadingText="Signing in..."
          type="submit"
          class="w-full"
        >
          Sign In
        </app-loading-button>
      </form>

      <p class="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Don't have an account?
        <a routerLink="/register" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">Create one</a>
      </p>

      <a routerLink="/events" class="flex items-center justify-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
        </svg>
        Browse events as guest
      </a>
    </div>
  `,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected loading = signal(false);
  protected errorMessage = signal('');
  protected emailError = signal('');
  protected passwordError = signal('');

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');
    this.emailError.set('');
    this.passwordError.set('');

    if (!this.email) {
      this.emailError.set('Email is required');
      return;
    }
    if (!this.password) {
      this.passwordError.set('Password is required');
      return;
    }

    this.loading.set(true);
    try {
      await this.auth.login({ email: this.email, password: this.password });
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage.set(err?.error?.message || err?.message || 'Invalid email or password');
    } finally {
      this.loading.set(false);
    }
  }
}
