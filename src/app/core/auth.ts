import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  User,
  browserLocalPersistence,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { AccountProfileService } from './account-profile';
import { FIREBASE_AUTH } from './firebase-auth';

export type AuthStatus = 'loading' | 'signed-out' | 'signed-in';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly profiles = inject(AccountProfileService);
  private readonly persistenceReady = setPersistence(this.auth, browserLocalPersistence);
  private observerReady = false;
  private redirectReady = false;
  private resolveReady!: () => void;
  private readonly readyPromise = new Promise<void>((resolve) => {
    this.resolveReady = resolve;
  });

  readonly status = signal<AuthStatus>('loading');
  readonly user = signal<User | null>(null);
  readonly isBusy = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    onAuthStateChanged(
      this.auth,
      (user) => {
        this.applyUser(user);
        this.observerReady = true;
        this.resolveWhenReady();
      },
      () => {
        this.applyUser(null);
        this.error.set('로그인 상태를 확인하지 못했어요. 페이지를 새로고침해 주세요.');
        this.observerReady = true;
        this.resolveWhenReady();
      },
    );

    void getRedirectResult(this.auth)
      .then((result) => {
        if (result?.user) {
          this.applyUser(result.user);
        }
      })
      .catch((error: unknown) => this.error.set(this.getAuthErrorMessage(error)))
      .finally(() => {
        this.redirectReady = true;
        this.resolveWhenReady();
      });
  }

  async waitUntilReady(): Promise<void> {
    await this.readyPromise;
  }

  async signInWithGoogle(): Promise<void> {
    this.error.set(null);
    this.isBusy.set(true);

    try {
      await this.persistenceReady;
      await signInWithRedirect(this.auth, new GoogleAuthProvider());
    } catch (error: unknown) {
      this.isBusy.set(false);
      this.error.set(this.getAuthErrorMessage(error));
    }
  }

  async logOut(): Promise<void> {
    this.error.set(null);
    this.isBusy.set(true);
    try {
      await signOut(this.auth);
    } catch (error: unknown) {
      this.error.set(this.getAuthErrorMessage(error));
    } finally {
      this.isBusy.set(false);
    }
  }

  retryProfileSync(): void {
    const user = this.user();
    if (user) {
      void this.profiles.syncFromGoogleAccount(user);
    }
  }

  clearError(): void {
    this.error.set(null);
  }

  private applyUser(user: User | null): void {
    this.user.set(user);
    this.status.set(user ? 'signed-in' : 'signed-out');

    if (user) {
      if (this.profiles.profile()?.uid !== user.uid || this.profiles.error()) {
        void this.profiles.syncFromGoogleAccount(user);
      }
    } else {
      this.profiles.clear();
    }
  }

  private resolveWhenReady(): void {
    if (this.observerReady && this.redirectReady) {
      this.resolveReady();
    }
  }

  private getAuthErrorMessage(error: unknown): string {
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';

    switch (code) {
      case 'auth/unauthorized-domain':
        return '이 접속 주소는 로그인 허용 도메인이 아니에요. Firebase 설정을 확인해 주세요.';
      case 'auth/operation-not-allowed':
        return 'Firebase Console에서 Google 로그인을 활성화해야 해요.';
      case 'auth/network-request-failed':
        return '네트워크 연결을 확인한 뒤 다시 시도해 주세요.';
      case 'auth/redirect-cancelled-by-user':
      case 'auth/cancelled-popup-request':
        return '로그인이 취소되었어요. 원할 때 다시 시도해 주세요.';
      default:
        return '로그인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.';
    }
  }
}
