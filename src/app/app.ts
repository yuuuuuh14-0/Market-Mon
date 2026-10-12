import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.less',
})
export class App {
  readonly currentYear = new Date().getFullYear();
}
