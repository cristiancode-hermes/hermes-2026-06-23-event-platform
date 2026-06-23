import { Component, input, output } from '@angular/core';
import { LoadingButtonComponent } from '../loading-button/loading-button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [LoadingButtonComponent],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm" (click)="onCancel.emit()"></div>
        <div class="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-modal max-w-md w-full animate-scale-in p-6">
          <div class="flex items-start gap-4">
            @if (type() === 'danger') {
              <div class="w-10 h-10 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-danger-600 dark:text-danger-400">
                  <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                </svg>
              </div>
            } @else {
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary-600 dark:text-primary-400">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/>
                </svg>
              </div>
            }
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{{ title() }}</h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ message() }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <app-loading-button
              [variant]="'ghost'"
              [type]="'button'"
              (onClick)="onCancel.emit()"
            >
              {{ cancelText() }}
            </app-loading-button>
            <app-loading-button
              [variant]="type() === 'danger' ? 'danger' : 'primary'"
              [loading]="loading()"
              [loadingText]="'Processing...'"
              (onClick)="onConfirm.emit()"
            >
              {{ confirmText() }}
            </app-loading-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly isOpen = input(false);
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly type = input<'primary' | 'danger'>('primary');
  readonly loading = input(false);
  readonly confirmText = input<string>('Confirm');
  readonly cancelText = input<string>('Cancel');
  readonly onConfirm = output<void>();
  readonly onCancel = output<void>();
}
