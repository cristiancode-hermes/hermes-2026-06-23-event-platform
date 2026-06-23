import { Component, inject, signal, computed, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import type { EventModel } from '../../models/event.model';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

type FilterType = 'all' | 'today' | 'week' | 'month' | 'free';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [RouterLink, FormsModule, EventCardComponent, SkeletonCardComponent, EmptyStateComponent, ErrorStateComponent],
  template: `
    <div class="space-y-8">
      <!-- Hero -->
      <div class="text-center space-y-4 py-8">
        <h1 class="text-4xl sm:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100">
          Discover <span class="text-primary-600 dark:text-primary-400">amazing events</span>
        </h1>
        <p class="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
          Find and register for events that matter to you
        </p>
      </div>

      <!-- Search -->
      <div class="max-w-2xl mx-auto">
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
          </svg>
          <input
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            type="text"
            placeholder="Search events by name, location, or category..."
            class="w-full pl-11 pr-4 py-3.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base transition-colors shadow-sm"
          />
        </div>
      </div>

      <!-- Filter Pills -->
      <div class="flex flex-wrap items-center justify-center gap-2">
        @for (filter of filters; track filter.value) {
          <button
            (click)="setFilter(filter.value)"
            class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            [class]="activeFilter() === filter.value
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400'"
          >
            {{ filter.label }}
          </button>
        }
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (item of [1,2,3,4]; track item) {
            <app-skeleton-card />
          }
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <app-error-state
          title="Failed to load events"
          [message]="error()"
          (onRetry)="loadEvents()"
        />
      }

      <!-- Empty State -->
      @if (!loading() && !error() && events().length === 0) {
        <app-empty-state
          title="No events found"
          message="Try adjusting your search or filter to find more events."
        />
      }

      <!-- Events Grid -->
      @if (!loading() && !error() && events().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (event of events(); track event.id) {
            <app-event-card
              [event]="event"
              (onClick)="goToEvent(event.id)"
            />
          }
        </div>
      }
    </div>
  `,
})
export class ExplorePageComponent {
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected searchQuery = '';
  protected searchTerm = '';
  protected activeFilter = signal<FilterType>('all');
  protected events = signal<EventModel[]>([]);
  protected loading = signal(false);
  protected error = signal('');

  protected filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Free', value: 'free' },
  ];

  private searchTimer: any;

  constructor() {
    this.loadEvents();
  }

  protected onSearchChange(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.searchTerm = this.searchQuery;
      this.loadEvents();
    }, 300);
  }

  protected setFilter(filter: FilterType): void {
    this.activeFilter.set(filter);
    this.loadEvents();
  }

  protected async loadEvents(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const filter = this.activeFilter() === 'all' ? undefined : this.activeFilter();
      const events = await this.eventService.getAll({
        search: this.searchTerm || undefined,
        filter,
      });
      this.events.set(events);
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load events');
      this.events.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected goToEvent(id: string): void {
    this.router.navigate(['/events', id]);
  }
}
