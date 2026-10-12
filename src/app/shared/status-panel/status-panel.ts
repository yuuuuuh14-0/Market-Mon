import { Component, Input } from '@angular/core';

export type StatusPanelState = 'loading' | 'error';

@Component({
  selector: 'app-status-panel',
  templateUrl: './status-panel.html',
  styleUrl: './status-panel.less',
  standalone: false,
})
export class StatusPanel {
  @Input() state: StatusPanelState = 'loading';
  @Input() title = '불러오는 중이에요';
  @Input() message = '잠시만 기다려 주세요.';
}
