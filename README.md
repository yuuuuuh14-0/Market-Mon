# Market Mon

교실에서 가상 화폐 **Mon**을 사용해 협력과 경제 활동을 경험하는 한국어 웹 애플리케이션입니다. 교사는 학급과 세션을 운영하고, 학생은 공동 목표를 위한 기여·투표에 참여하거나 Mon으로 학급 혜택을 이용합니다.

## 주요 기능

- **학급 경제 시뮬레이션:** 학생들이 공동 자원에 기여하고 투표로 사용 방식을 결정합니다.
- **보상 키오스크:** 교사가 개인 혜택과 학급 공동 혜택을 정합니다. 학생은 개인 혜택을 쿠폰으로 교환하거나 공동 혜택 모금에 참여할 수 있습니다.
- **학급 운영:** Google 계정으로 로그인하고, 학급·세션 가입 요청과 승인은 교사가 관리합니다.

> 제품 규칙과 데이터 접근 방식은 계획 문서에 정의되어 있습니다. 이 저장소는 아직 앱 구현 전 단계이므로 위 기능이 동작하는 애플리케이션은 포함하지 않습니다.

## 기술 구성

| 영역 | 선택 및 제약 |
| --- | --- |
| 프런트엔드 | Angular, NgModule 기반 구성; Standalone 컴포넌트는 사용하지 않음 |
| 렌더링·빌드 | CSR, Vite; SSR은 사용하지 않음 |
| 스타일·라우팅 | Less, Angular Routing |
| 인증·데이터 | Firebase Authentication, Cloud Firestore |
| 배포 | Firebase Hosting — `market-mon-51ee9.firebaseapp.com` |
| 패키지 관리 | Yarn Berry 4.18.1 Plug’n’Play; npm 및 `node_modules` 링크 방식은 사용하지 않음 |

Yarn 버전은 `package.json`의 `packageManager`와 `.yarnrc.yml`의 `yarnPath`에 고정되어 있습니다.

## 프로젝트 문서

- [제품 요구사항 (PRD)](PRD.md)
- [시뮬레이션 규칙 및 Firestore 설계](SIMULATION-SPEC.md)
- [개발 마일스톤](MILESTONE.md)

## 개발 상태

제품 범위와 주요 규칙을 문서로 정리하고 있습니다. 현재 저장소에는 실행 가능한 Angular 앱 구성과 Firebase 배포 설정이 없으므로 설치·실행 명령은 아직 제공하지 않습니다. 프로젝트 기반 구성이 마련되면 이 안내를 갱신합니다.
