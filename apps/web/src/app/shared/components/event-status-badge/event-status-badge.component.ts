import { Component, input } from '@angular/core';
import type { EventStatus } from '../../../models/event.model';

@Component({
  selector: 'app-event-status-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [class]="statusClasses()"
    >
      {{ displayText() }}
    </span>
  `,
})
export class EventStatusBadgeComponent {
  readonly status = input.required<EventStatus>();

  protected statusClasses(): string {
    const classes: Record<EventStatus, string> = {
      upcoming: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
      ongoing: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
      past: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
      cancelled: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300',
    };
    return classes[this.status()] || classes['upcoming'];
  }

  protected displayText(): string {
    const labels: Record<EventStatus, string> = {
      upcoming: 'Upcoming',
      ongoing: 'Ongoing',
      past: 'Past',
      cancelled: 'Cancelled',
    };
    return labels[this.status()] || this.status();
  }
}
