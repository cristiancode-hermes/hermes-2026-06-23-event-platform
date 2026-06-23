import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-capacity-bar',
  standalone: true,
  template: `
    <div class="flex flex-col gap-1">
      <div class="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>{{ available() }} / {{ total() }} available</span>
        <span>{{ percentageText() }}</span>
      </div>
      <div class="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          [class]="barColor()"
          [style.width.%]="percentage()"
        ></div>
      </div>
    </div>
  `,
})
export class CapacityBarComponent {
  readonly available = input.required<number>();
  readonly total = input.required<number>();

  protected percentage = computed(() => {
    if (this.total() === 0) return 0;
    return Math.round((this.available() / this.total()) * 100);
  });

  protected percentageText = computed(() => `${this.percentage()}%`);

  protected barColor = computed(() => {
    const pct = this.percentage();
    if (pct > 50) return 'bg-success-500';
    if (pct > 20) return 'bg-warning-500';
    return 'bg-danger-500';
  });
}
