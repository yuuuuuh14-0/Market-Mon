import { Component } from '@angular/core';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.html',
  styleUrl: './login.less',
  standalone: false,
})
export class LoginPage {
  constructor(readonly auth: AuthService) {}
}
