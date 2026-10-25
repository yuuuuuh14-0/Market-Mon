import { InjectionToken } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FIREBASE_APP } from './firebase-app';

export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE');

export const FIRESTORE_PROVIDER = {
  provide: FIRESTORE,
  useFactory: (app: FirebaseApp) => getFirestore(app),
  deps: [FIREBASE_APP],
};
