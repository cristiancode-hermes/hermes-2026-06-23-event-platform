import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <div class="flex-1 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <a routerLink="/events" class="inline-flex items-center gap-2 text-2xl font-display font-bold text-primary-600 dark:text-primary-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM3 10.5a.75.75 0 01.75-.75h9.75a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5z"/>
              </svg>
              EventHub
            </a>
          </div>
          <div class="bg-white dark:bg-neutral-900 rounded-2xl shadow-card border border-neutral-200 dark:border-neutral-800 p-8">
            <router-outlet />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
