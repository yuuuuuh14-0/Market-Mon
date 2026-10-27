import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AccountProfileService } from '../../core/account-profile';
import { AuthService } from '../../core/auth';

@Component({ selector: 'app-start-page', templateUrl: './start.html', standalone: false, styleUrl: './start.less' })
export class StartPage {
  readonly auth = inject(AuthService); readonly profiles = inject(AccountProfileService); private readonly router = inject(Router);
  constructor() { void this.routeByMode(); }
  private async routeByMode(): Promise<void> {
    await this.auth.waitUntilReady();
    if (!this.auth.user()) { await this.router.navigate(['/login']); return; }
    while (this.profiles.isLoading()) await new Promise((resolve) => setTimeout(resolve, 25));
    const mode = this.profiles.profile()?.accountMode;
    if (mode === 'teacher') await this.router.navigate(['/classroom']);
    else if (mode === 'student') await this.router.navigate(['/join']);
  }
  async choose(mode: 'teacher' | 'student'): Promise<void> { await this.profiles.saveAccountMode(mode); await this.router.navigate([mode === 'teacher' ? '/classroom' : '/join']); }
}
