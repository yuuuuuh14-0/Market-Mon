# Market Mon

교실에서 가상 화폐 **Mon**을 사용해 협력과 경제 활동을 경험하는 한국어 웹 애플리케이션입니다. 교사는 학급과 세션을 운영하고, 학생은 공동 목표를 위한 기여·투표에 참여하거나 Mon으로 학급 혜택을 이용합니다.

## 주요 기능

- **학급 경제 시뮬레이션:** 학생들이 공동 자원에 기여하고 투표로 사용 방식을 결정합니다.
- **보상 키오스크:** 교사가 개인 혜택과 학급 공동 혜택을 정합니다. 학생은 개인 혜택을 쿠폰으로 교환하거나 공동 혜택 모금에 참여할 수 있습니다.
- **학급 운영:** Google 계정으로 로그인하고, 학급·세션 가입 요청과 승인은 교사가 관리합니다.

> 시뮬레이션과 보상 기능은 제품 계획이며 아직 구현되지 않았습니다. 현재 앱에는 기본 랜딩 화면과 경로 뼈대만 있습니다.

## 기술 구성

| 영역 | 선택 및 제약 |
| --- | --- |
| 프런트엔드 | Angular 21.2 LTS, NgModule 기반 구성; Standalone 컴포넌트는 사용하지 않음 |
| 렌더링·빌드 | CSR; Angular CLI Vite 개발 서버와 esbuild 프로덕션 번들러; SSR은 사용하지 않음 |
| 스타일·라우팅 | Less, Angular Routing |
| 인증·데이터 | Firebase Authentication, Cloud Firestore |
| 배포 | Firebase Hosting — `market-mon-51ee9.firebaseapp.com` |
| 런타임·패키지 관리 | Node.js 24, Yarn Berry 4.18.1 Plug’n’Play; npm 및 `node_modules` 링크 방식은 사용하지 않음 |

Yarn 버전은 `package.json`의 `packageManager`와 `.yarnrc.yml`의 `yarnPath`에 고정되어 있습니다.

## 로컬 개발

Node.js 24를 설치한 뒤 저장소 루트에서 실행합니다.

```sh
yarn install --immutable
yarn start
```

프로덕션 빌드는 `yarn build`로 만듭니다. 개발 서버는 Angular CLI가 제공하는 Vite 기반 서버이며, 프로덕션 빌드는 Angular esbuild builder를 사용합니다.

Firebase 웹 설정은 `src/environments/firebase.config.ts`에서 관리합니다. 이 값은 클라이언트에 공개되는 설정이며 비밀 키가 아닙니다. Firebase Admin SDK 서비스 계정 키나 기타 비밀 정보는 저장소에 넣지 마세요.

## 프로젝트 문서

- [제품 요구사항 (PRD)](PRD.md)
- [시뮬레이션 규칙 및 Firestore 설계](SIMULATION-SPEC.md)
- [개발 마일스톤](MILESTONE.md)

## 개발 상태

M1 기반을 구성했습니다. 홈·로그인 안내·404 경로와 Firebase 앱 초기화가 준비되어 있습니다. Google 로그인은 M2에서, 학급 시뮬레이션과 보상 키오스크는 M3에서 구현합니다. Firebase Hosting 배포 설정은 M5 범위입니다.
