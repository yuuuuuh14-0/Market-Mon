import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { LoginPage } from './pages/login/login';
import { NotFoundPage } from './pages/not-found/not-found';

const appRoutes: Routes = [
  { path: '', component: HomePage, title: 'Market Mon | 우리 반 경제 놀이터' },
  { path: 'login', component: LoginPage, title: '로그인 | Market Mon' },
  { path: '**', component: NotFoundPage, title: '페이지를 찾을 수 없어요 | Market Mon' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
