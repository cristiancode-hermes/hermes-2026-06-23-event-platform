import { Component, input, output } from '@angular/core';
import type { EventModel } from '../../../models/event.model';
import { PriceBadgeComponent } from '../price-badge/price-badge.component';
import { EventStatusBadgeComponent } from '../event-status-badge/event-status-badge.component';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [PriceBadgeComponent, EventStatusBadgeComponent],
  template: `
    <div
      (click)="onClick.emit()"
      class="group rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900 cursor-pointer hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 animate-fade-in"
    >
      <div class="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center relative overflow-hidden">
        @if (event().imageUrl) {
          <img [src]="event().imageUrl" [alt]="event().title" class="w-full h-full object-cover" loading="lazy" />
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-primary-300 dark:text-primary-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
          </svg>
        }
        @if (event().status && event().status !== 'upcoming') {
          <div class="absolute top-3 right-3">
            <app-event-status-badge [status]="event().status!" />
          </div>
        }
      </div>
      <div class="p-4">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">{{ event().title }}</h3>
          <app-price-badge [price]="getPrice()" />
        </div>
        <div class="space-y-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          <div class="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd"/>
            </svg>
            <span>{{ formatDate(event().date) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd"/>
            </svg>
            <span class="truncate">{{ event().location }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EventCardComponent {
  readonly event = input.required<EventModel>();
  readonly onClick = output<void>();

  protected getPrice(): number {
    const tickets = this.event().ticketTypes;
    if (!tickets || tickets.length === 0) return 0;
    const minPrice = Math.min(...tickets.map(t => t.price));
    return minPrice;
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
