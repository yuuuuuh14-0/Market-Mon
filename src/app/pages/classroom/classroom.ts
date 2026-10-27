import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import QRCode from 'qrcode';
import { AuthService } from '../../core/auth';
import { Classroom, ClassroomMember, ClassroomService, JoinRequest } from '../../core/classroom';

@Component({ selector: 'app-classroom-page', templateUrl: './classroom.html', standalone: false, styleUrl: './classroom.less' })
export class ClassroomPage {
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly classrooms = inject(ClassroomService);
  readonly schoolName = signal(''); readonly className = signal(''); readonly grade = signal('초1');
  readonly otherGrade = signal('');
  readonly classroom = signal<Classroom | null>(null); readonly requests = signal<JoinRequest[]>([]);
  readonly students = signal<ClassroomMember[]>([]);
  readonly myClasses = signal<Classroom[]>([]);
  readonly code = signal(''); readonly codeExpiry = signal(0); readonly welcomeMon = signal('');
  readonly inviteEmail = signal(''); readonly inviteLink = signal(''); readonly qrImage = signal(''); readonly message = signal(''); readonly busy = signal(false);
  readonly grades = ['유치원', '초1', '초2', '초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3', '기타'];
  readonly classId = this.route.snapshot.paramMap.get('classId');
  constructor() { if (this.classId) void this.loadClass(); else void this.loadMyClasses(); }
  async loadMyClasses(): Promise<void> { const user = this.auth.user(); if (!user) return; try { this.myClasses.set(await this.classrooms.listMyClasses(user.uid)); } catch { this.message.set('참여 중인 학급을 불러오지 못했어요.'); } }
  async createClass(): Promise<void> {
    const user = this.auth.user(); if (!user) return;
    this.busy.set(true); this.message.set('');
    try { const selectedGrade = this.grade() === '기타' && this.otherGrade().trim() ? `기타: ${this.otherGrade().trim()}` : this.grade(); const id = await this.classrooms.create(user, this.schoolName(), selectedGrade, this.className()); await this.router.navigate(['/classroom', id]); }
    catch { this.message.set('학급을 만들지 못했어요. 입력 내용을 확인해 주세요.'); }
    finally { this.busy.set(false); }
  }
  async loadClass(): Promise<void> {
    if (!this.classId) return;
    this.classroom.set(null); this.requests.set([]); this.students.set([]);
    const user = this.auth.user();
    if (!user) return;
    try {
      if (!await this.classrooms.isTeacher(this.classId, user.uid)) throw new Error('학급 교사 계정인지 확인해 주세요.');
      const value = await this.classrooms.getClass(this.classId);
      if (!value) throw new Error('학급 정보를 찾을 수 없어요.');
      const [requests, students] = await Promise.all([this.classrooms.loadRequests(this.classId), this.classrooms.loadStudents(this.classId)]);
      this.classroom.set(value); this.requests.set(requests); this.students.set(students);
      if (value.welcomeMon != null) this.welcomeMon.set(String(value.welcomeMon));
    } catch (e) { this.classroom.set(null); this.requests.set([]); this.students.set([]); this.message.set(e instanceof Error ? e.message : '학급 정보를 불러오지 못했어요. 학급 교사 계정인지 확인해 주세요.'); }
  }
  async issueCode(): Promise<void> { const user = this.auth.user(); if (!user || !this.classId) return; try { const code = await this.classrooms.issueJoinCode(user, this.classId); const joinUrl = `${location.origin}/join?code=${code}`; const image = await QRCode.toDataURL(joinUrl, { width: 220, margin: 1 }); this.code.set(code); this.qrImage.set(image); this.codeExpiry.set(Date.now() + 3600000); } catch (e) { this.message.set(e instanceof Error ? e.message : '코드를 발급하지 못했어요.'); } }
  async saveWelcome(): Promise<void> { if (!this.classId) return; try { await this.classrooms.setWelcomeMon(this.classId, Number(this.welcomeMon())); this.message.set('환영 Mon 설정을 저장했어요. 기존 학생 잔액에도 반영했어요.'); await this.loadClass(); } catch (e) { this.message.set(e instanceof Error ? e.message : '저장하지 못했어요.'); } }
  async decide(uid: string, approve: boolean): Promise<void> { if (!this.classId) return; try { await this.classrooms.decideRequest(this.classId, uid, approve); await this.loadClass(); } catch (e) { this.message.set(e instanceof Error ? e.message : '요청을 처리하지 못했어요.'); } }
  async invite(): Promise<void> {
    const user = this.auth.user(); if (!user || !this.classId) return;
    try {
      const id = await this.classrooms.createInvite(user, this.classId, this.inviteEmail());
      const link = `${location.origin}/invite/${id}`; this.inviteLink.set(link);
      const copied = await this.copyToClipboard(link);
      this.message.set(copied ? '7일간 유효한 초대 링크를 만들고 복사했어요.' : '초대 링크를 만들었어요. 아래 링크를 선택해 복사해 주세요.');
    } catch (e) { this.message.set(e instanceof Error ? e.message : '초대 링크를 만들지 못했어요.'); }
  }
  async copyCode(field: HTMLInputElement): Promise<void> {
    const copied = await this.copyToClipboard(this.code());
    if (!copied) { field.focus(); field.select(); }
    this.message.set(copied ? '참여 코드를 복사했어요.' : '참여 코드를 선택했어요. 복사해 주세요.');
  }
  async copyInviteLink(field: HTMLInputElement): Promise<void> {
    const copied = await this.copyToClipboard(this.inviteLink());
    if (!copied) { field.focus(); field.select(); }
    this.message.set(copied ? '초대 링크를 복사했어요.' : '초대 링크를 선택했어요. 복사해 주세요.');
  }
  private async copyToClipboard(value: string): Promise<boolean> {
    try { if (!navigator.clipboard?.writeText) return false; await navigator.clipboard.writeText(value); return true; }
    catch { return false; }
  }
  async remove(uid: string, displayName: string): Promise<void> { if (!this.classId || !window.confirm(`${displayName} 학생의 이 학급 기록과 지갑을 삭제할까요?`)) return; try { await this.classrooms.removeStudent(this.classId, uid); this.message.set('학생의 이 학급 기록을 삭제했어요.'); await this.loadClass(); } catch (e) { this.message.set(e instanceof Error ? e.message : '학생 기록을 삭제하지 못했어요.'); } }
  async toggleClass(): Promise<void> { const user = this.auth.user(); const room = this.classroom(); if (!user || !room) return; try { await this.classrooms.setClassActive(user, room.id, !room.active); this.message.set(room.active ? '학급을 보관 상태로 바꿨어요.' : '학급을 다시 활성화했어요.'); await this.loadClass(); } catch (e) { this.message.set(e instanceof Error ? e.message : '학급 상태를 변경하지 못했어요.'); } }
}
