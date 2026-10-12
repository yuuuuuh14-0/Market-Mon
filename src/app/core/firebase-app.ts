import { InjectionToken } from '@angular/core';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../environments/firebase.config';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');

export function initializeFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export const FIREBASE_APP_PROVIDER = {
  provide: FIREBASE_APP,
  useFactory: initializeFirebaseApp,
};
