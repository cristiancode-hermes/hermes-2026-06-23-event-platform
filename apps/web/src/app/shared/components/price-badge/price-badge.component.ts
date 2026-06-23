import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-price-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [class]="isFree() ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300' : 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300'"
    >
      {{ displayText() }}
    </span>
  `,
})
export class PriceBadgeComponent {
  readonly price = input.required<number>();

  protected isFree = computed(() => this.price() === 0);

  protected displayText = computed(() => {
    if (this.isFree()) return 'Free';
    return '$' + this.price().toFixed(0);
  });
}
