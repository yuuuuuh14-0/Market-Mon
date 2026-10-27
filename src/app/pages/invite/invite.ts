import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth';
import { ClassroomService } from '../../core/classroom';

@Component({ selector: 'app-invite-page', templateUrl: './invite.html', standalone: false, styleUrl: './invite.less' })
export class InvitePage {
  readonly auth = inject(AuthService); readonly message = signal(''); private readonly classrooms = inject(ClassroomService); readonly id = inject(ActivatedRoute).snapshot.paramMap.get('inviteId') || '';
  constructor() {}
  async accept(): Promise<void> { const user = this.auth.user(); if (!user) return; try { await this.classrooms.acceptInvite(user, this.id); } catch (e) { this.message.set(e instanceof Error ? e.message : '초대를 수락하지 못했어요.'); } }
}
