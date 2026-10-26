import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HomePage } from './pages/home/home';
import { LoginPage } from './pages/login/login';
import { NotFoundPage } from './pages/not-found/not-found';
import { FIREBASE_APP_PROVIDER } from './core/firebase-app';
import { FIREBASE_AUTH_PROVIDER } from './core/firebase-auth';
import { FIRESTORE_PROVIDER } from './core/firebase-firestore';
import { SharedModule } from './shared/shared-module';
import { ProfilePage } from './pages/profile/profile';
import { DesignPreviewPage } from './pages/design-preview/design-preview';

@NgModule({
  declarations: [
    App,
    HomePage,
    LoginPage,
    ProfilePage,
    NotFoundPage,
    DesignPreviewPage,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
  ],
  providers: [
    FIREBASE_APP_PROVIDER,
    FIREBASE_AUTH_PROVIDER,
    FIRESTORE_PROVIDER,
  ],
  bootstrap: [App]
})
export class AppModule { }
