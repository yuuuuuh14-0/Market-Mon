import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth';
import { Classroom, ClassroomService } from '../../core/classroom';

@Component({ selector: 'app-join-page', templateUrl: './join.html', standalone: false, styleUrl: './join.less' })
export class JoinPage {
  readonly auth = inject(AuthService); private readonly route = inject(ActivatedRoute); private readonly classrooms = inject(ClassroomService);
  readonly code = signal(''); readonly room = signal<Classroom | null>(null); readonly message = signal(''); readonly busy = signal(false);
  readonly joinStatus = signal<'pending' | 'rejected' | 'approved' | null>(null); readonly studentNumber = signal<number | null>(null);
  constructor() { const code = this.route.snapshot.queryParamMap.get('code'); if (code) { this.code.set(code); void this.lookup(); } }
  async lookup(): Promise<void> { try { this.message.set(''); const room = await this.classrooms.lookupCode(this.code()); this.room.set(room); const user = this.auth.user(); if (user) { const state = await this.classrooms.getStudentState(room.id, user.uid); this.joinStatus.set(state.status); this.studentNumber.set(state.studentNumber ?? null); } } catch (e) { this.room.set(null); this.joinStatus.set(null); this.message.set(e instanceof Error ? e.message : '학급 코드를 확인하지 못했어요.'); } }
  async request(): Promise<void> { const user = this.auth.user(); if (!user) return; this.busy.set(true); try { const room = await this.classrooms.requestJoin(user, this.code()); this.room.set(room); this.joinStatus.set('pending'); this.message.set('참여 요청을 보냈어요. 선생님의 승인을 기다려 주세요.'); } catch (e) { this.message.set(e instanceof Error ? e.message : '참여 요청을 보내지 못했어요.'); } finally { this.busy.set(false); } }
}
