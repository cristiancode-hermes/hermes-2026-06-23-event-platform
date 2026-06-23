import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import type { EventModel, TicketType } from '../../models/event.model';
import { EventStatusBadgeComponent } from '../../shared/components/event-status-badge/event-status-badge.component';
import { PriceBadgeComponent } from '../../shared/components/price-badge/price-badge.component';
import { CapacityBarComponent } from '../../shared/components/capacity-bar/capacity-bar.component';
import { LoadingButtonComponent } from '../../shared/components/loading-button/loading-button.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink, EventStatusBadgeComponent, PriceBadgeComponent, CapacityBarComponent, LoadingButtonComponent, ErrorStateComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Back Button -->
      <a routerLink="/events" class="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
        </svg>
        Back to events
      </a>

      <!-- Loading -->
      @if (loading()) {
        <div class="animate-pulse space-y-6">
          <div class="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-2xl"></div>
          <div class="space-y-3">
            <div class="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
          </div>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <app-error-state [message]="error()" (onRetry)="loadEvent()" />
      }

      <!-- Event Content -->
      @if (!loading() && !error() && event(); as evt) {
        <!-- Image -->
        <div class="h-64 sm:h-80 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center overflow-hidden relative">
          @if (evt.imageUrl) {
            <img [src]="evt.imageUrl" [alt]="evt.title" class="w-full h-full object-cover" />
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-24 h-24 text-primary-300 dark:text-primary-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
            </svg>
          }
          @if (evt.status) {
            <div class="absolute top-4 right-4">
              <app-event-status-badge [status]="evt.status" />
            </div>
          }
        </div>

        <!-- Info -->
        <div class="space-y-6">
          <div>
            <h1 class="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-100">{{ evt.title }}</h1>
            <div class="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              <div class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd"/>
                </svg>
                <span>{{ formatDate(evt.date) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                  <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd"/>
                </svg>
                <span>{{ evt.location }}</span>
              </div>
              <app-price-badge [price]="minPrice()" />
            </div>
          </div>

          <!-- Description -->
          @if (evt.description) {
            <div>
              <h2 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">About this event</h2>
              <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">{{ evt.description }}</p>
            </div>
          }

          <!-- Ticket Types -->
          @if (evt.ticketTypes && evt.ticketTypes.length > 0) {
            <div>
              <h2 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Tickets</h2>
              <div class="space-y-3">
                @for (ticket of evt.ticketTypes; track ticket.id) {
                  <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <div class="flex items-start justify-between mb-3">
                      <div>
                        <h3 class="font-medium text-neutral-900 dark:text-neutral-100">{{ ticket.name }}</h3>
                        @if (ticket.description) {
                          <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ ticket.description }}</p>
                        }
                      </div>
                      <div class="text-right">
                        <app-price-badge [price]="ticket.price" />
                        <div class="text-xs text-neutral-400 mt-1">Max {{ ticket.perOrderLimit }} per order</div>
                      </div>
                    </div>
                    @if (ticket.capacity > 0) {
                      <app-capacity-bar [available]="ticket.available" [total]="ticket.capacity" />
                    }
                    <div class="mt-3">
                      @if (ticket.available === 0) {
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300">
                          Full
                        </span>
                      } @else if (evt.status === 'past') {
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                          Event Ended
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300">
                          Available
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- CTA -->
          @if (evt.status !== 'past') {
            <div class="flex items-center gap-3 pt-4">
              @if (auth.isLoggedIn()) {
                @if (hasAvailableTickets()) {
                  <a [routerLink]="['/register', evt.id]" class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
                    </svg>
                    Register Now
                  </a>
                } @else {
                  <button class="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 text-white rounded-xl font-medium hover:bg-accent-700 transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                      <path d="M10.362 1.093a.75.75 0 00-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925zM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0018 14.25V6.443zm-8.75 12.25v-8.25l-7.25-4v7.807a.75.75 0 00.388.657l6.862 3.786z"/>
                    </svg>
                    Join Waitlist
                  </button>
                }
              } @else {
                <a routerLink="/login" class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm">
                  Sign in to Register
                </a>
              }
            </div>
          } @else {
            <div class="flex items-center gap-2 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
              </svg>
              This event has ended
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class EventDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  protected readonly auth = inject(AuthService);

  private readonly eventId = this.route.snapshot.paramMap.get('id')!;

  protected event = signal<EventModel | null>(null);
  protected loading = signal(true);
  protected error = signal('');

  protected minPrice = computed(() => {
    const evt = this.event();
    if (!evt?.ticketTypes || evt.ticketTypes.length === 0) return 0;
    return Math.min(...evt.ticketTypes.map(t => t.price));
  });

  protected hasAvailableTickets = computed(() => {
    const evt = this.event();
    if (!evt?.ticketTypes) return false;
    return evt.ticketTypes.some(t => t.available > 0);
  });

  constructor() {
    this.loadEvent();
  }

  protected async loadEvent(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const evt = await this.eventService.getById(this.eventId);
      this.event.set(evt);
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load event');
      if (err?.status === 404) {
        this.router.navigate(['/not-found']);
      }
    } finally {
      this.loading.set(false);
    }
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
