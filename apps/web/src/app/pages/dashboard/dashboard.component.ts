import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import type { EventModel } from '../../models/event.model';
import type { Registration } from '../../models/registration.model';
import { EventStatusBadgeComponent } from '../../shared/components/event-status-badge/event-status-badge.component';
import { CapacityBarComponent } from '../../shared/components/capacity-bar/capacity-bar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingButtonComponent } from '../../shared/components/loading-button/loading-button.component';

type TabType = 'my-events' | 'my-registrations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, EventStatusBadgeComponent, CapacityBarComponent, EmptyStateComponent, LoadingButtonComponent],
  template: `
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-1">Manage your events and registrations</p>
        </div>
        <a routerLink="/events/new" class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
          </svg>
          Create Event
        </a>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-neutral-200 dark:border-neutral-800">
        @for (tab of tabs; track tab.key) {
          <button
            (click)="activeTab.set(tab.key)"
            class="px-5 py-3 text-sm font-medium border-b-2 transition-colors"
            [class]="activeTab() === tab.key
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- My Events Tab -->
      @if (activeTab() === 'my-events') {
        @if (loadingEvents()) {
          <div class="space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="animate-pulse rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
                <div class="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-3"></div>
                <div class="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-2"></div>
                <div class="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
              </div>
            }
          </div>
        } @else if (myEvents().length === 0) {
          <app-empty-state
            title="No events yet"
            message="Create your first event and start connecting with attendees."
            actionLabel="Create Event"
            (onAction)="goToCreateEvent()"
          />
        } @else {
          <div class="space-y-4">
            @for (event of myEvents(); track event.id) {
              <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 space-y-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{{ event.title }}</h3>
                      @if (event.status) {
                        <app-event-status-badge [status]="event.status" />
                      }
                    </div>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">
                      {{ formatDate(event.date) }} &middot; {{ event.location }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 ml-4">
                    <a [routerLink]="['/events', event.id, 'attendees']" class="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" title="View Attendees">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .844.844 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z"/></svg>
                    </a>
                    <a [routerLink]="['/events', event.id, 'edit']" class="p-2 rounded-lg text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" title="Edit Event">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z"/><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z"/></svg>
                    </a>
                  </div>
                </div>
                @if (event.ticketTypes) {
                  <div class="flex items-center gap-6 text-sm">
                    <span class="text-neutral-500 dark:text-neutral-400">
                      Registrations: <strong class="text-neutral-800 dark:text-neutral-200">{{ event.registrationCount || 0 }}</strong>
                    </span>
                    <span class="text-neutral-500 dark:text-neutral-400">
                      Capacity: <strong class="text-neutral-800 dark:text-neutral-200">{{ event.maxCapacity }}</strong>
                    </span>
                  </div>
                  <app-capacity-bar [available]="(event.maxCapacity - (event.registrationCount || 0))" [total]="event.maxCapacity" />
                }
              </div>
            }
          </div>
        }
      }

      <!-- My Registrations Tab -->
      @if (activeTab() === 'my-registrations') {
        @if (loadingRegistrations()) {
          <div class="space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="animate-pulse rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
                <div class="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-3"></div>
                <div class="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
              </div>
            }
          </div>
        } @else if (myRegistrations().length === 0) {
          <app-empty-state
            title="No registrations yet"
            message="Browse events and register for ones you're interested in."
            actionLabel="Browse Events"
            (onAction)="goToExplore()"
          />
        } @else {
          <div class="space-y-4">
            @for (reg of myRegistrations(); track reg.id) {
              <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <a [routerLink]="['/events', reg.eventId]" class="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {{ reg.event?.title || 'Event' }}
                    </a>
                    <div class="flex items-center gap-3 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>{{ reg.name }}</span>
                      <span>{{ reg.email }}</span>
                    </div>
                    <div class="flex items-center gap-3 mt-2 text-sm">
                      <span class="text-neutral-500 dark:text-neutral-400">
                        {{ reg.tickets?.length || 0 }} ticket type(s)
                      </span>
                      <span class="font-medium text-primary-600 dark:text-primary-400">{{ '$' + (reg.totalAmount?.toFixed(2) || '0.00') }}</span>
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(reg.status)"
                      >
                        {{ reg.status }}
                      </span>
                    </div>
                  </div>
                  @if (reg.status === 'confirmed') {
                    <app-loading-button
                      [variant]="'danger'"
                      [type]="'button'"
                      [loading]="cancellingId() === reg.id"
                      loadingText="Cancelling..."
                      (onClick)="cancelRegistration(reg.id)"
                    >
                      Cancel
                    </app-loading-button>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class DashboardPageComponent {
  private readonly eventService = inject(EventService);
  private readonly registrationService = inject(RegistrationService);

  protected activeTab = signal<TabType>('my-events');
  protected myEvents = signal<EventModel[]>([]);
  protected myRegistrations = signal<Registration[]>([]);
  protected loadingEvents = signal(true);
  protected loadingRegistrations = signal(true);
  protected cancellingId = signal<string | null>(null);

  protected tabs = [
    { key: 'my-events' as TabType, label: 'My Events' },
    { key: 'my-registrations' as TabType, label: 'My Registrations' },
  ];

  constructor() {
    this.loadEvents();
    this.loadRegistrations();
  }

  private async loadEvents(): Promise<void> {
    this.loadingEvents.set(true);
    try {
      const events = await this.eventService.getMy();
      this.myEvents.set(events);
    } catch {
      this.myEvents.set([]);
    } finally {
      this.loadingEvents.set(false);
    }
  }

  private async loadRegistrations(): Promise<void> {
    this.loadingRegistrations.set(true);
    try {
      const regs = await this.registrationService.getMy();
      this.myRegistrations.set(regs);
    } catch {
      this.myRegistrations.set([]);
    } finally {
      this.loadingRegistrations.set(false);
    }
  }

  protected async cancelRegistration(id: string): Promise<void> {
    this.cancellingId.set(id);
    try {
      await this.registrationService.cancel(id);
      await this.loadRegistrations();
    } catch {
      // error handled silently
    } finally {
      this.cancellingId.set(null);
    }
  }

  protected getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      confirmed: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
      waitlisted: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
      cancelled: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300',
      attended: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    };
    return classes[status] || 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  protected goToCreateEvent(): void {
    window.location.href = '/events/new';
  }

  protected goToExplore(): void {
    window.location.href = '/events';
  }
}
