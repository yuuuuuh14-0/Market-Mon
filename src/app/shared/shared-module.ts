import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StatusPanel } from './status-panel/status-panel';

@NgModule({
  declarations: [StatusPanel],
  imports: [CommonModule],
  exports: [StatusPanel],
})
export class SharedModule {}
