import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-pulse-soft">
      <div class="h-48 bg-neutral-200 dark:bg-neutral-700"></div>
      <div class="p-4 space-y-3">
        <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
        <div class="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
        <div class="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
        <div class="flex justify-between items-center pt-2">
          <div class="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
          <div class="h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full w-16"></div>
        </div>
      </div>
    </div>
  `,
})
export class SkeletonCardComponent {}
