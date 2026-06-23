import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import type { EventModel, TicketType } from '../../models/event.model';
import type { CreateRegistrationRequest } from '../../models/registration.model';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { LoadingButtonComponent } from '../../shared/components/loading-button/loading-button.component';
import { CapacityBarComponent } from '../../shared/components/capacity-bar/capacity-bar.component';
import { PriceBadgeComponent } from '../../shared/components/price-badge/price-badge.component';

interface TicketSelection {
  ticketTypeId: string;
  ticketName: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
}

type WizardStep = 'info' | 'tickets' | 'confirm';
type WizardState = 'initial' | 'validating' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-registration-wizard',
  standalone: true,
  imports: [RouterLink, FormsModule, FormFieldComponent, LoadingButtonComponent, CapacityBarComponent, PriceBadgeComponent],
  template: `
    @if (wizardState() === 'success') {
      <div class="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <div class="w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-10 h-10 text-success-600 dark:text-success-400">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h1 class="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">Registration Successful!</h1>
        <p class="text-neutral-500 dark:text-neutral-400 mb-8">Your registration has been confirmed.</p>
        <div class="flex items-center justify-center gap-4">
          <a routerLink="/dashboard" class="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">Go to Dashboard</a>
          <a [routerLink]="['/events', eventId]" class="px-6 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">View Event</a>
        </div>
      </div>
    } @else {
      <div class="max-w-3xl mx-auto">
        <a [routerLink]="['/events', eventId]" class="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
          </svg>
          Back to event
        </a>

        <!-- Step Indicator -->
        <div class="flex items-center justify-center gap-4 mb-10">
          @for (step of steps; track step.key) {
            <div class="flex items-center gap-2">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                [class]="getStepClass(step.key)"
              >
                @if (stepCompleted(step.key)) {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                  </svg>
                } @else {
                  {{ step.number }}
                }
              </div>
              <span class="hidden sm:inline text-sm font-medium" [class]="currentStep() === step.key ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400'">{{ step.label }}</span>
              @if (!$last) {
                <div class="w-12 h-0.5 mx-2" [class]="stepCompleted(step.key) ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'"></div>
              }
            </div>
          }
        </div>

        @if (errorMessage()) {
          <div class="flex items-center gap-2 p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 text-sm text-danger-700 dark:text-danger-300 border border-danger-200 dark:border-danger-800 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 flex-shrink-0">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
            </svg>
            {{ errorMessage() }}
          </div>
        }

        <!-- Step 1: Personal Info -->
        @if (currentStep() === 'info') {
          <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 animate-fade-in">
            <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Personal Information</h2>
            <app-form-field label="Full Name" [required]="true" [error]="fieldErrors()['name']">
              <input [(ngModel)]="formData.name" name="name" type="text" required
                class="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-colors" />
            </app-form-field>
            <app-form-field label="Email" [required]="true" [error]="fieldErrors()['email']">
              <input [(ngModel)]="formData.email" name="email" type="email" required
                class="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-colors" />
            </app-form-field>
            <app-form-field label="Phone (optional)" [error]="fieldErrors()['phone']">
              <input [(ngModel)]="formData.phone" name="phone" type="tel"
                class="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-colors" />
            </app-form-field>
            <div class="flex justify-end pt-2">
              <button (click)="goToTickets()" class="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">Next: Select Tickets</button>
            </div>
          </div>
        }

        <!-- Step 2: Tickets -->
        @if (currentStep() === 'tickets') {
          <div class="space-y-4 animate-fade-in">
            <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Select Tickets</h2>
              @if (event()?.ticketTypes; as tickets) {
                <div class="space-y-4">
                  @for (ticket of tickets; track ticket.id) {
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <h3 class="font-medium text-neutral-900 dark:text-neutral-100">{{ ticket.name }}</h3>
                          <app-price-badge [price]="ticket.price" />
                        </div>
                        @if (ticket.description) {
                          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{{ ticket.description }}</p>
                        }
                        <app-capacity-bar [available]="ticket.available" [total]="ticket.capacity" />
                      </div>
                      <div class="flex items-center gap-3">
                        @if (getSelection(ticket.id); as sel) {
                          <button (click)="decrementTicket(ticket)" class="w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            [class.opacity-50]="sel.quantity <= 0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd"/></svg>
                          </button>
                          <span class="w-8 text-center font-medium text-neutral-900 dark:text-neutral-100">{{ sel.quantity }}</span>
                          <button (click)="incrementTicket(ticket)" class="w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            [class.opacity-50]="sel.quantity >= sel.maxQuantity || sel.quantity >= ticket.available">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/></svg>
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
            <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <div class="flex justify-between items-center mb-4">
                <span class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Total</span>
                <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ '$' + totalAmount().toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between pt-2">
                <button (click)="goToInfo()" class="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Back</button>
                <button (click)="goToConfirm()" class="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors" [disabled]="totalQuantity() === 0">Next: Review</button>
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Confirm -->
        @if (currentStep() === 'confirm') {
          <div class="space-y-4 animate-fade-in">
            <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
              <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Review & Confirm</h2>
              <div class="space-y-3">
                <div class="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span class="text-neutral-500 dark:text-neutral-400">Name</span>
                  <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ formData.name }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span class="text-neutral-500 dark:text-neutral-400">Email</span>
                  <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ formData.email }}</span>
                </div>
                @if (formData.phone) {
                  <div class="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span class="text-neutral-500 dark:text-neutral-400">Phone</span>
                    <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ formData.phone }}</span>
                  </div>
                }
                <div class="py-2">
                  <span class="text-neutral-500 dark:text-neutral-400 block mb-2">Tickets</span>
                  <div class="space-y-2">
                    @for (sel of selections(); track sel.ticketTypeId) {
                      @if (sel.quantity > 0) {
                        <div class="flex justify-between text-sm">
                          <span>{{ sel.ticketName }} x{{ sel.quantity }}</span>
                          <span class="font-medium">{{ '$' + (sel.unitPrice * sel.quantity).toFixed(2) }}</span>
                        </div>
                      }
                    }
                  </div>
                </div>
                <div class="flex justify-between py-3 border-t border-neutral-200 dark:border-neutral-700">
                  <span class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Total</span>
                  <span class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ '$' + totalAmount().toFixed(2) }}</span>
                </div>
              </div>

              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" [(ngModel)]="termsAccepted" name="terms"
                  class="mt-1 w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500" />
                <span class="text-sm text-neutral-600 dark:text-neutral-400">
                  I agree to the event terms and conditions, and I understand that tickets are non-refundable unless the event is cancelled.
                </span>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <button (click)="goToTickets()" class="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Back</button>
              <app-loading-button
                [loading]="wizardState() === 'submitting'"
                loadingText="Confirming..."
                [disabled]="!termsAccepted || totalQuantity() === 0"
                (onClick)="submitRegistration()"
              >
                Confirm Registration
              </app-loading-button>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class RegistrationWizardPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly registrationService = inject(RegistrationService);
  protected readonly auth = inject(AuthService);

  protected eventId = this.route.snapshot.paramMap.get('eventId')!;

  protected event = signal<EventModel | null>(null);
  protected currentStep = signal<WizardStep>('info');
  protected wizardState = signal<WizardState>('initial');
  protected errorMessage = signal('');
  protected fieldErrors = signal<Record<string, string>>({});
  protected termsAccepted = false;

  protected steps = [
    { key: 'info' as WizardStep, label: 'Info', number: 1 },
    { key: 'tickets' as WizardStep, label: 'Tickets', number: 2 },
    { key: 'confirm' as WizardStep, label: 'Confirm', number: 3 },
  ];

  protected formData = {
    name: '',
    email: '',
    phone: '',
  };

  protected selections = signal<TicketSelection[]>([]);

  protected totalQuantity = computed(() =>
    this.selections().reduce((sum, s) => sum + s.quantity, 0)
  );

  protected totalAmount = computed(() =>
    this.selections().reduce((sum, s) => sum + s.unitPrice * s.quantity, 0)
  );

  constructor() {
    this.loadEvent();
    const user = this.auth.user();
    if (user) {
      this.formData.name = user.name || '';
      this.formData.email = user.email || '';
      this.formData.phone = user.phone || '';
    }
  }

  private async loadEvent(): Promise<void> {
    try {
      const evt = await this.eventService.getById(this.eventId);
      this.event.set(evt);
      if (evt.ticketTypes) {
        this.selections.set(evt.ticketTypes.map(t => ({
          ticketTypeId: t.id,
          ticketName: t.name,
          unitPrice: t.price,
          quantity: 0,
          maxQuantity: Math.min(t.perOrderLimit, t.available),
        })));
      }
    } catch {
      this.router.navigate(['/not-found']);
    }
  }

  protected getSelection(ticketId: string): TicketSelection | undefined {
    return this.selections().find(s => s.ticketTypeId === ticketId);
  }

  protected incrementTicket(ticket: TicketType): void {
    this.selections.update(selections =>
      selections.map(s =>
        s.ticketTypeId === ticket.id && s.quantity < s.maxQuantity && s.quantity < ticket.available
          ? { ...s, quantity: s.quantity + 1 }
          : s
      )
    );
  }

  protected decrementTicket(ticket: TicketType): void {
    this.selections.update(selections =>
      selections.map(s =>
        s.ticketTypeId === ticket.id && s.quantity > 0
          ? { ...s, quantity: s.quantity - 1 }
          : s
      )
    );
  }

  protected getStepClass(step: WizardStep): string {
    const stepOrder = ['info', 'tickets', 'confirm'];
    const currentIdx = stepOrder.indexOf(this.currentStep());
    const stepIdx = stepOrder.indexOf(step);
    if (stepIdx < currentIdx) return 'bg-primary-500 text-white';
    if (stepIdx === currentIdx) return 'bg-primary-500 text-white ring-4 ring-primary-200 dark:ring-primary-800';
    return 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400';
  }

  protected stepCompleted(step: WizardStep): boolean {
    const stepOrder = ['info', 'tickets', 'confirm'];
    return stepOrder.indexOf(step) < stepOrder.indexOf(this.currentStep());
  }

  protected goToInfo(): void {
    this.currentStep.set('info');
    this.errorMessage.set('');
  }

  protected goToTickets(): void {
    this.fieldErrors.set({});
    let hasError = false;
    const errors: Record<string, string> = {};

    if (!this.formData.name) { errors['name'] = 'Name is required'; hasError = true; }
    if (!this.formData.email) { errors['email'] = 'Email is required'; hasError = true; }

    if (hasError) {
      this.fieldErrors.set(errors);
      return;
    }

    this.currentStep.set('tickets');
    this.errorMessage.set('');
  }

  protected goToConfirm(): void {
    if (this.totalQuantity() === 0) return;
    this.currentStep.set('confirm');
    this.errorMessage.set('');
  }

  protected async submitRegistration(): Promise<void> {
    if (!this.termsAccepted || this.totalQuantity() === 0) return;

    this.wizardState.set('submitting');
    this.errorMessage.set('');

    try {
      const tickets = this.selections()
        .filter(s => s.quantity > 0)
        .map(s => ({ ticketTypeId: s.ticketTypeId, quantity: s.quantity }));

      const request: CreateRegistrationRequest = {
        eventId: this.eventId,
        name: this.formData.name,
        email: this.formData.email,
        phone: this.formData.phone || undefined,
        tickets,
        termsAccepted: true,
      };

      await this.registrationService.create(request);
      this.wizardState.set('success');
    } catch (err: any) {
      this.wizardState.set('error');
      if (err?.status === 409) {
        this.errorMessage.set('Capacity conflict — some tickets are no longer available. Please go back and adjust your selection.');
      } else {
        this.errorMessage.set(err?.error?.message || err?.message || 'Registration failed');
      }
    }
  }
}
