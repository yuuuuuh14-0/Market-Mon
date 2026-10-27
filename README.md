# Market-Mon

**Market-Mon은 함께 모으고, 함께 결정하며, 교실 안에서 성장하는 학급 경제 놀이터입니다.** 학생은 수업 활동으로 Mon과 능력치를 모으고, 저축과 직업 성장에 참여합니다. 학급은 공동 목표를 함께 이루고, 교사는 교실 활동과 혜택을 운영합니다.

## 제품 방향

- **함께 결정:** Mon을 기여하고 투표해 공동 자원의 사용을 정하는 시뮬레이션
- **나의 성장:** 활동·저축·직업·능력치를 통해 개인의 성장을 기록
- **우리 반 키오스크:** 교사가 정한 혜택과 학급 보스를 통해 함께 보상을 경험
- **교실 공개판:** 전자칠판에는 공동 진행과 수업 도구를, 개인 기기에는 본인 정보만 표시

Market-Mon은 교실 경제를 학생의 일상적인 선택으로 경험하도록 돕습니다. 개인별 순위나 공개 잔액은 제공하지 않습니다.

## 기술 구성

| 구분 | 구성 |
| --- | --- |
| 앱 | 저장소 루트의 Angular 18.2, NgModule, CSR, Zone.js |
| 화면 | Angular Router, Less, Angular CLI Vite 개발 서버, esbuild 프로덕션 빌드 |
| Firebase | Authentication·Firestore 사용, 활동 사진용 Storage 계획; 모듈형 JavaScript SDK 직접 사용 |
| 런타임·패키지 | Node.js 22, Yarn Berry 4.18.1 Plug'n'Play |
| 저장소 내 의존성 | `.yarn` 전체 추적. `.yarn/cache` 압축 아카이브 및 플랫폼별 `.yarn/unplugged` 포함 |

`frontend/`, Standalone 컴포넌트, SSR, npm 설치, `node_modules` 링크 방식은 사용하지 않습니다. `.nvmrc`는 Node 22를 표시하지만 시스템 기본 버전을 자동 변경하지 않습니다. Angular 18은 공식 지원이 종료된 버전이며, 프로젝트 호환성을 위해 유지합니다.

## 실행

Node.js 22를 설치·활성화하고 버전을 확인한 다음 저장소 루트에서 실행합니다.

```sh
node -v
node .yarn/releases/yarn-4.18.1.cjs install --immutable
node .yarn/releases/yarn-4.18.1.cjs start
```

개발 서버는 <http://localhost:4200>에서 확인합니다. 종료는 `Ctrl+C`, 프로덕션 빌드는 다음 명령을 사용합니다.

```sh
node .yarn/releases/yarn-4.18.1.cjs build
```

앱 전체에서 Gmarket Sans를 사용합니다. 개발 서버의 <http://localhost:4200/design-preview>에서 기본 글꼴의 실제 화면 예시를 볼 수 있습니다. 글꼴 파일은 CDN에서 불러오므로 인터넷 연결이 필요하며, 불러오지 못하면 기기 기본 한글 글꼴로 표시됩니다.

로컬 개발은 Firebase 프로젝트 `market-mon-51ee9`의 공개 웹 설정을 사용합니다. Firebase 웹 설정은 클라이언트에 전달되는 공개 값이며 비밀 키가 아닙니다. 서비스 계정 키나 기타 비밀 정보를 저장소에 추가하지 마세요.

## Firebase 로그인 설정

Firebase Console에서 아래 설정이 필요합니다.

1. Authentication의 로그인 제공자에서 Google을 활성화합니다.
2. Authorized domains에 `localhost`와 Hosting 도메인을 추가합니다.
3. Firestore Rules에 저장소의 [`firestore.rules`](firestore.rules)를 적용합니다.

Google 로그인·로그아웃·로그인 상태 유지·프로필 모드가 구현되어 있습니다. Safari에서는 로컬 `localhost`와 Firebase 인증 도메인 간 사이트 간 저장소 제한으로 리디렉션 로그인이 완료되지 않을 수 있습니다. 실제 로그인과 M3 흐름은 M8에서 `market-mon-51ee9.firebaseapp.com`에 배포한 뒤 검증합니다. 계정 모드는 화면 기본값이며 학급별 권한은 실제 멤버십 승인으로 결정됩니다. 학생 번호 로그인은 M3.5로 미뤘으며 M3에서는 Google 계정만 사용합니다.

## 현재 진행 상태

M0 제품 규칙, M1 Angular 기반, M2 Google 인증·프로필, M2.5 소개 페이지와 디자인 체계, M3 학급 생성·참여 승인 구현을 완료했습니다. M3 Firestore Rules를 게시하고 프로덕션 빌드를 확인했습니다. 실제 교사·학생 계정 간 흐름과 비인가 접근 검증은 M8 Hosting 배포 후 진행합니다. 개인 경제, 활동, 직업 성장, 보스, 키오스크는 이후 마일스톤에서 구현합니다.

## 문서

- [제품 요구사항](PRD.md)
- [공동 시뮬레이션 및 Firestore 설계](SIMULATION-SPEC.md)
- [학급 경제·성장 명세](CLASSROOM-ECONOMY-SPEC.md)
- [개발 마일스톤](MILESTONE.md)
