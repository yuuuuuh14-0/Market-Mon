import { Injectable, inject, signal } from '@angular/core';
import { User } from 'firebase/auth';
import { doc, Firestore, getDoc, setDoc } from 'firebase/firestore';
import { FIRESTORE } from './firebase-firestore';

export type AccountMode = 'teacher' | 'student';

export interface AccountProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
  accountMode: AccountMode | null;
}

@Injectable({ providedIn: 'root' })
export class AccountProfileService {
  private readonly firestore = inject(FIRESTORE);
  private generation = 0;

  readonly profile = signal<AccountProfile | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  async syncFromGoogleAccount(user: User): Promise<void> {
    const generation = ++this.generation;
    const profileRef = doc(this.firestore, 'users', user.uid);
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const currentProfile = await getDoc(profileRef);
      const previousMode = currentProfile.exists()
        ? currentProfile.data()['accountMode']
        : null;
      const accountMode = this.isAccountMode(previousMode) ? previousMode : null;
      const nextProfile: AccountProfile = {
        uid: user.uid,
        displayName: user.displayName?.trim() || 'Market Mon 사용자',
        photoURL: user.photoURL || null,
        accountMode,
      };

      await setDoc(profileRef, {
        displayName: nextProfile.displayName,
        photoURL: nextProfile.photoURL,
        accountMode: nextProfile.accountMode,
      });

      if (generation === this.generation) {
        this.profile.set(nextProfile);
      }
    } catch {
      if (generation === this.generation) {
        this.error.set('계정 정보를 저장하지 못했어요. 네트워크를 확인한 뒤 다시 시도해 주세요.');
      }
    } finally {
      if (generation === this.generation) {
        this.isLoading.set(false);
      }
    }
  }

  async saveAccountMode(accountMode: AccountMode): Promise<void> {
    const currentProfile = this.profile();
    if (!currentProfile) {
      this.error.set('계정 정보를 먼저 불러와 주세요.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      await setDoc(doc(this.firestore, 'users', currentProfile.uid), { accountMode }, { merge: true });
      this.profile.set({ ...currentProfile, accountMode });
    } catch {
      this.error.set('역할 모드를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      throw new Error('Account mode update failed.');
    } finally {
      this.isLoading.set(false);
    }
  }

  clear(): void {
    this.generation++;
    this.profile.set(null);
    this.isLoading.set(false);
    this.error.set(null);
  }

  private isAccountMode(value: unknown): value is AccountMode {
    return value === 'teacher' || value === 'student';
  }
}
