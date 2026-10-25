import { Component } from '@angular/core';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-home-page',
  templateUrl: './home.html',
  styleUrl: './home.less',
  standalone: false,
})
export class HomePage {
  constructor(readonly auth: AuthService) {}
}
