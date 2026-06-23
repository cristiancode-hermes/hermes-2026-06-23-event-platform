import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import type { Registration } from '../../models/registration.model';

@Component({
  selector: 'app-registration-success',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-2xl mx-auto text-center py-16 animate-fade-in">
      <div class="w-24 h-24 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-8 relative">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-12 h-12 text-success-600 dark:text-success-400">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
        </svg>
        <div class="absolute inset-0 rounded-full bg-success-500/10 animate-ping"></div>
      </div>

      <h1 class="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">Registration Confirmed!</h1>
      <p class="text-neutral-500 dark:text-neutral-400 mb-8">Thank you for registering. We've sent a confirmation to your email.</p>

      @if (registration(); as reg) {
        <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 text-left mb-8">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Registration Details</h2>
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span class="text-neutral-500 dark:text-neutral-400">Name</span>
              <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ reg.name }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span class="text-neutral-500 dark:text-neutral-400">Email</span>
              <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ reg.email }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span class="text-neutral-500 dark:text-neutral-400">Tickets</span>
              <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ reg.tickets?.length || 0 }} type(s)</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-neutral-500 dark:text-neutral-400">Total</span>
              <span class="font-bold text-primary-600 dark:text-primary-400">{{ '$' + (reg.totalAmount?.toFixed(2) || '0.00') }}</span>
            </div>
          </div>
        </div>
      }

      <div class="flex items-center justify-center gap-4">
        <a routerLink="/dashboard" class="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
          Go to Dashboard
        </a>
        <a routerLink="/events" class="px-6 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          Browse More Events
        </a>
      </div>
    </div>
  `,
})
export class RegistrationSuccessPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly registrationService = inject(RegistrationService);

  protected registration = signal<Registration | null>(null);

  constructor() {
    const regId = this.route.snapshot.queryParamMap.get('registrationId');
    if (regId) {
      this.registrationService.getById(regId).then(reg => {
        this.registration.set(reg);
      }).catch(() => {});
    }
  }
}
