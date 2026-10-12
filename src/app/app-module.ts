import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HomePage } from './pages/home/home';
import { LoginPage } from './pages/login/login';
import { NotFoundPage } from './pages/not-found/not-found';
import { FIREBASE_APP_PROVIDER } from './core/firebase-app';
import { SharedModule } from './shared/shared-module';

@NgModule({
  declarations: [
    App,
    HomePage,
    LoginPage,
    NotFoundPage,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    FIREBASE_APP_PROVIDER,
  ],
  bootstrap: [App]
})
export class AppModule { }
