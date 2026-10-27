import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import {
  collection, collectionGroup, doc, Firestore, getDoc, getDocs, query, runTransaction,
  serverTimestamp, setDoc, where, writeBatch,
} from 'firebase/firestore';
import { FIRESTORE } from './firebase-firestore';

export type SchoolGrade = '유치원' | '초1' | '초2' | '초3' | '초4' | '초5' | '초6' | '중1' | '중2' | '중3' | '고1' | '고2' | '고3' | '기타';
export interface Classroom { id: string; schoolName: string; className: string; grade: string; ownerUid: string; active: boolean; welcomeMon: number | null; joinCodeGeneration?: string; }
export interface JoinRequest { uid: string; displayName: string; status: 'pending' | 'rejected'; requestedAt?: unknown; }
export interface ClassroomMember { uid: string; displayName: string; role: string; }

interface JoinCodePreview {
  classId: string;
  generation: string;
  expiresAt: number;
  schoolName: string;
  grade: string;
  className: string;
}

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randomCode(length = 8): string {
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('');
}

@Injectable({ providedIn: 'root' })
export class ClassroomService {
  private readonly db = inject(FIRESTORE);
  private readonly router = inject(Router);

  async create(user: User, schoolName: string, grade: string, className: string): Promise<string> {
    const cleanSchool = schoolName.trim();
    const cleanGrade = grade.trim();
    const cleanClass = className.trim();
    if (!cleanSchool || !cleanGrade || !cleanClass) throw new Error('학교명, 학년, 학급명을 입력해 주세요.');
    if (cleanSchool.length > 100 || cleanGrade.length > 100 || cleanClass.length > 80) throw new Error('입력한 학급 정보가 너무 길어요.');
    const classRef = doc(collection(this.db, 'classes'));
    const batch = writeBatch(this.db);
    batch.set(classRef, { schoolName: cleanSchool, grade: cleanGrade, className: cleanClass, ownerUid: user.uid, active: true, membershipRevision: 0, welcomeMon: null, joinCodeGeneration: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    batch.set(doc(classRef, 'members', user.uid), { uid: user.uid, displayName: user.displayName || '교사', role: 'owner', joinedAt: serverTimestamp() });
    await batch.commit();
    return classRef.id;
  }

  async issueJoinCode(user: User, classId: string): Promise<string> {
    const code = randomCode();
    const generation = crypto.randomUUID();
    const classRef = doc(this.db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    if (!classSnap.exists() || !await this.isTeacher(classId, user.uid)) throw new Error('학급 교사만 코드를 발급할 수 있어요.');
    const batch = writeBatch(this.db);
    batch.set(classRef, { joinCodeGeneration: generation, updatedAt: serverTimestamp() }, { merge: true });
    const data = classSnap.data();
    batch.set(doc(this.db, 'joinCodes', code), { classId, generation, expiresAt: Date.now() + 60 * 60 * 1000, schoolName: data['schoolName'], grade: data['grade'], className: data['className'], createdAt: serverTimestamp() });
    await batch.commit();
    return code;
  }

  async getClass(classId: string): Promise<Classroom | null> {
    const snap = await getDoc(doc(this.db, 'classes', classId));
    return snap.exists() ? { id: snap.id, ...snap.data() } as Classroom : null;
  }

  async listMyClasses(uid: string): Promise<Classroom[]> {
    const memberships = await getDocs(query(collectionGroup(this.db, 'members'), where('uid', '==', uid)));
    const ids = memberships.docs.map((item) => item.ref.parent.parent?.id).filter((value): value is string => Boolean(value));
    const rooms = await Promise.all(ids.map((id) => this.getClass(id)));
    return rooms.filter((room): room is Classroom => room !== null);
  }

  async requestJoin(user: User, code: string): Promise<Classroom> {
    const codeSnap = await getDoc(doc(this.db, 'joinCodes', code.trim().toUpperCase()));
    if (!codeSnap.exists() || Number(codeSnap.data()['expiresAt']) < Date.now()) throw new Error('코드가 만료되었거나 올바르지 않아요.');
    const preview = codeSnap.data() as JoinCodePreview;
    const classId = preview.classId;
    const classRef = doc(this.db, 'classes', classId);
    const memberRef = doc(classRef, 'members', user.uid);
    if ((await getDoc(memberRef)).exists()) throw new Error('이미 이 학급의 구성원이에요.');
    const requestRef = doc(classRef, 'joinRequests', user.uid);
    await setDoc(requestRef, { uid: user.uid, displayName: user.displayName || '학생', status: 'pending', joinCode: code.trim().toUpperCase(), requestedAt: serverTimestamp() });
    return { id: classId, schoolName: preview.schoolName, grade: preview.grade, className: preview.className } as Classroom;
  }

  async lookupCode(code: string): Promise<Classroom> {
    const codeSnap = await getDoc(doc(this.db, 'joinCodes', code.trim().toUpperCase()));
    if (!codeSnap.exists() || Number(codeSnap.data()['expiresAt']) < Date.now()) throw new Error('코드가 만료되었거나 올바르지 않아요.');
    const preview = codeSnap.data() as JoinCodePreview;
    return { id: preview.classId, schoolName: preview.schoolName, grade: preview.grade, className: preview.className } as Classroom;
  }

  async loadRequests(classId: string): Promise<JoinRequest[]> {
    const result = await getDocs(query(collection(this.db, 'classes', classId, 'joinRequests'), where('status', '==', 'pending')));
    return result.docs.map((item) => ({ ...item.data() } as JoinRequest));
  }

  async getStudentState(classId: string, uid: string): Promise<{ status: 'pending' | 'rejected' | 'approved' | null }> {
    const classRef = doc(this.db, 'classes', classId);
    const [member, request] = await Promise.all([getDoc(doc(classRef, 'members', uid)), getDoc(doc(classRef, 'joinRequests', uid))]);
    if (member.exists() && member.data()['role'] === 'student') return { status: 'approved' };
    return { status: request.exists() && ['pending', 'rejected'].includes(String(request.data()['status'])) ? request.data()['status'] as 'pending' | 'rejected' : null };
  }

  async loadStudents(classId: string): Promise<ClassroomMember[]> {
    const result = await getDocs(query(collection(this.db, 'classes', classId, 'members'), where('role', '==', 'student')));
    return result.docs.map((item) => ({ ...item.data() } as ClassroomMember));
  }

  async removeStudent(classId: string, uid: string): Promise<void> {
    const classRef = doc(this.db, 'classes', classId);
    await runTransaction(this.db, async (tx) => {
      const memberRef = doc(classRef, 'members', uid);
      const walletRef = doc(classRef, 'wallets', uid);
      const requestRef = doc(classRef, 'joinRequests', uid);
      const memberSnap = await tx.get(memberRef);
      if (!memberSnap.exists() || memberSnap.data()['role'] !== 'student') throw new Error('학생 정보를 찾을 수 없어요.');
      const classSnap = await tx.get(classRef);
      if (!classSnap.exists()) throw new Error('학급을 찾을 수 없어요.');
      tx.update(classRef, { membershipRevision: Number(classSnap.data()['membershipRevision'] || 0) + 1, updatedAt: serverTimestamp() });
      tx.delete(memberRef); tx.delete(walletRef); tx.delete(requestRef);
    });
  }

  async setClassActive(user: User, classId: string, active: boolean): Promise<void> {
    const ref = doc(this.db, 'classes', classId);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()['ownerUid'] !== user.uid) throw new Error('생성 교사만 학급 상태를 바꿀 수 있어요.');
    await setDoc(ref, { active, updatedAt: serverTimestamp() }, { merge: true });
  }

  async decideRequest(classId: string, uid: string, approve: boolean): Promise<void> {
    const classRef = doc(this.db, 'classes', classId);
    const requestRef = doc(classRef, 'joinRequests', uid);
    const memberRef = doc(classRef, 'members', uid);
    const walletRef = doc(classRef, 'wallets', uid);
    await runTransaction(this.db, async (tx) => {
      const [classSnap, requestSnap, memberSnap, walletSnap] = await Promise.all([tx.get(classRef), tx.get(requestRef), tx.get(memberRef), tx.get(walletRef)]);
      if (!classSnap.exists() || !requestSnap.exists() || requestSnap.data()['status'] !== 'pending') throw new Error('요청 상태가 바뀌었어요. 새로고침해 주세요.');
      if (!approve) { tx.update(requestRef, { status: 'rejected', decidedAt: serverTimestamp() }); return; }
      if (memberSnap.exists()) {
        if (memberSnap.data()['role'] !== 'student') throw new Error('이미 다른 역할로 참여 중인 계정이에요.');
        tx.update(requestRef, { status: 'approved', decidedAt: serverTimestamp() });
        return;
      }
      const data = classSnap.data();
      const welcome = data['welcomeMon'] == null ? 0 : Number(data['welcomeMon']);
      tx.update(classRef, { membershipRevision: Number(data['membershipRevision'] || 0) + 1, updatedAt: serverTimestamp() });
      tx.set(memberRef, { uid, displayName: requestSnap.data()['displayName'], role: 'student', welcomeMonGranted: welcome, joinedAt: serverTimestamp() });
      tx.set(walletRef, { balance: (walletSnap.exists() ? Number(walletSnap.data()['balance'] || 0) : 0) + welcome, updatedAt: serverTimestamp() });
      tx.update(requestRef, { status: 'approved', decidedAt: serverTimestamp() });
    });
  }

  async setWelcomeMon(classId: string, amount: number): Promise<void> {
    if (!Number.isInteger(amount) || amount < 0) throw new Error('Mon은 0 이상의 정수로 입력해 주세요.');
    const classRef = doc(this.db, 'classes', classId);
    for (let attempt = 0; attempt < 3; attempt++) {
      const initialClass = await getDoc(classRef);
      if (!initialClass.exists()) throw new Error('학급을 찾을 수 없어요.');
      const revision = Number(initialClass.data()['membershipRevision'] || 0);
      const memberSnaps = await getDocs(collection(this.db, 'classes', classId, 'members'));
      const studentIds = memberSnaps.docs.filter((item) => item.data()['role'] === 'student').map((item) => item.id);
      try {
        await runTransaction(this.db, async (tx) => {
          const classSnap = await tx.get(classRef);
          if (!classSnap.exists()) throw new Error('학급을 찾을 수 없어요.');
          if (Number(classSnap.data()['membershipRevision'] || 0) !== revision) throw new Error('MEMBERSHIP_CHANGED');
          const changes: Array<{ memberRef: ReturnType<typeof doc>; walletRef: ReturnType<typeof doc>; balance: number }> = [];
          for (const uid of studentIds) {
            const memberRef = doc(this.db, 'classes', classId, 'members', uid);
            const walletRef = doc(this.db, 'classes', classId, 'wallets', uid);
            const member = await tx.get(memberRef);
            const wallet = await tx.get(walletRef);
            if (!member.exists() || member.data()['role'] !== 'student') throw new Error('MEMBERSHIP_CHANGED');
            const oldGrant = Number(member.data()['welcomeMonGranted'] || 0);
            const newBalance = (wallet.exists() ? Number(wallet.data()['balance'] || 0) : 0) + amount - oldGrant;
            if (newBalance < 0) throw new Error('변경 후 잔액이 음수가 되는 학생이 있어요. 금액을 바꾸지 않았습니다.');
            changes.push({ memberRef, walletRef, balance: newBalance });
          }
          for (const item of changes) {
            tx.set(item.walletRef, { balance: item.balance, updatedAt: serverTimestamp() }, { merge: true });
            tx.update(item.memberRef, { welcomeMonGranted: amount });
          }
          tx.update(classRef, { welcomeMon: amount, updatedAt: serverTimestamp() });
        });
        return;
      } catch (error) {
        if (!(error instanceof Error) || error.message !== 'MEMBERSHIP_CHANGED' || attempt === 2) throw error;
      }
    }
  }

  async createInvite(user: User, classId: string, email: string): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new Error('초대할 Google 이메일을 확인해 주세요.');
    const memberSnap = await getDoc(doc(this.db, 'classes', classId, 'members', user.uid));
    if (!memberSnap.exists() || memberSnap.data()['role'] !== 'owner') throw new Error('생성 교사만 공동 교사를 초대할 수 있어요.');
    const inviteRef = doc(collection(this.db, 'teacherInvites'));
    await setDoc(inviteRef, { classId, targetEmail: normalizedEmail, createdBy: user.uid, status: 'pending', expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, createdAt: serverTimestamp() });
    return inviteRef.id;
  }

  async acceptInvite(user: User, inviteId: string): Promise<void> {
    const inviteRef = doc(this.db, 'teacherInvites', inviteId);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists()) throw new Error('초대 링크를 찾을 수 없어요.');
    const invite = inviteSnap.data();
    if (!user.email || user.email.toLowerCase() !== String(invite['targetEmail']).toLowerCase()) throw new Error('초대된 Google 계정으로 로그인해 주세요.');
    if (invite['status'] !== 'pending' || Number(invite['expiresAt']) < Date.now()) throw new Error('초대 링크가 만료되었거나 이미 사용되었어요.');
    const memberRef = doc(this.db, 'classes', String(invite['classId']), 'members', user.uid);
    const batch = writeBatch(this.db);
    batch.set(memberRef, { uid: user.uid, displayName: user.displayName || '교사', role: 'teacher', inviteId, joinedAt: serverTimestamp() });
    batch.update(inviteRef, { status: 'accepted', acceptedBy: user.uid, acceptedAt: serverTimestamp() });
    await batch.commit();
    await this.router.navigate(['/classroom', invite['classId']]);
  }

  async isTeacher(classId: string, uid: string): Promise<boolean> {
    const snap = await getDoc(doc(this.db, 'classes', classId, 'members', uid));
    return snap.exists() && ['owner', 'teacher'].includes(String(snap.data()['role']));
  }
}
