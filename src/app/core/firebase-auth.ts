import { InjectionToken } from '@angular/core';
import { Auth, getAuth } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { FIREBASE_APP } from './firebase-app';

export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');

export const FIREBASE_AUTH_PROVIDER = {
  provide: FIREBASE_AUTH,
  useFactory: (app: FirebaseApp) => {
    const auth = getAuth(app);
    auth.languageCode = 'ko';
    return auth;
  },
  deps: [FIREBASE_APP],
};
