import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      (click)="onClick.emit()"
      class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      [class]="variantClass()"
    >
      @if (loading()) {
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <span>{{ loadingText() }}</span>
      } @else {
        <ng-content />
      }
    </button>
  `,
})
export class LoadingButtonComponent {
  readonly type = input<'button' | 'submit'>('submit');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>('Processing...');
  readonly variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  readonly onClick = output<void>();

  protected variantClass(): string {
    const variants: Record<string, string> = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
      secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:ring-neutral-400 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600',
      danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 dark:bg-danger-500 dark:hover:bg-danger-600',
      ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-400 dark:text-neutral-400 dark:hover:bg-neutral-800',
    };
    return variants[this.variant()] || variants['primary'];
  }
}
