import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { LoginPage } from './pages/login/login';
import { NotFoundPage } from './pages/not-found/not-found';
import { ProfilePage } from './pages/profile/profile';
import { authenticatedGuard, guestOnlyGuard } from './core/auth-guards';
import { DesignPreviewPage } from './pages/design-preview/design-preview';
import { ClassroomPage } from './pages/classroom/classroom';
import { JoinPage } from './pages/join/join';
import { StartPage } from './pages/start/start';
import { InvitePage } from './pages/invite/invite';

const appRoutes: Routes = [
  { path: '', component: HomePage, title: 'Market Mon | 우리 반 경제 놀이터' },
  { path: 'login', component: LoginPage, canActivate: [guestOnlyGuard], title: '로그인 | Market Mon' },
  { path: 'profile', component: ProfilePage, canActivate: [authenticatedGuard], title: '내 프로필 | Market Mon' },
  { path: 'start', component: StartPage, canActivate: [authenticatedGuard], title: '시작하기 | Market-Mon' },
  { path: 'classroom', component: ClassroomPage, canActivate: [authenticatedGuard], title: '학급 운영 | Market-Mon' },
  { path: 'classroom/:classId', component: ClassroomPage, canActivate: [authenticatedGuard], title: '학급 관리 | Market-Mon' },
  { path: 'join', component: JoinPage, title: '학급 참여 | Market-Mon' },
  { path: 'invite/:inviteId', component: InvitePage, title: '공동 교사 초대 | Market-Mon' },
  { path: 'design-preview', component: DesignPreviewPage, title: '글꼴 예시 | Market-Mon' },
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
