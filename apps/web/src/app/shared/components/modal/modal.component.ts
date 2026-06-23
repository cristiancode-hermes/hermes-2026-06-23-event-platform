import { Component, input, output, effect, inject } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="onBackdropClick()">
        <div class="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm" (click)="onBackdropClick()"></div>
        <div
          class="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-modal max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in"
          (click)="$event.stopPropagation()"
        >
          @if (showClose()) {
            <button
              (click)="onClose.emit()"
              class="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          }
          <div class="p-6">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly isOpen = input(false);
  readonly showClose = input(true);
  readonly closeOnBackdrop = input(true);
  readonly onClose = output<void>();

  protected onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.onClose.emit();
    }
  }
}
