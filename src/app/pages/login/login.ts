import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.html',
  styleUrl: './login.less',
  standalone: false,
})
export class LoginPage {
  constructor(readonly auth: AuthService, private readonly route: ActivatedRoute) {}
  signIn(): void {
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
    if (returnTo?.startsWith('/') && !returnTo.startsWith('//') && returnTo !== '/login') sessionStorage.setItem('marketMonReturnTo', returnTo);
    void this.auth.signInWithGoogle();
  }
}
