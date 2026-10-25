import { Component, inject } from '@angular/core';
import { AuthService } from './core/auth';
import { AccountProfileService } from './core/account-profile';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.less',
})
export class App {
  readonly auth = inject(AuthService);
  readonly profiles = inject(AccountProfileService);
  readonly currentYear = new Date().getFullYear();
}
