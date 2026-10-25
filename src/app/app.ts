import { Component, HostListener, inject, signal } from '@angular/core';
import { AuthService } from './core/auth';
import { AccountProfileService } from './core/account-profile';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.less',
})
export class App {
  readonly auth = inject(AuthService);
  readonly profiles = inject(AccountProfileService);
  readonly router = inject(Router);
  readonly currentYear = new Date().getFullYear();
  readonly scrollProgress = signal(0);

  @HostListener('window:scroll')
  updateScrollProgress(): void {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress.set(scrollableHeight > 0 ? Math.min(1, window.scrollY / scrollableHeight) : 0);
  }
}
