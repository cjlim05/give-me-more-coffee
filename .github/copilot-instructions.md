<!-- .github/copilot-instructions.md for coffee monorepo -->
# AI 코파일럿 지침 — coffee 모노레포

이 저장소는 두 개의 주요 구성요소로 구성된 모노레포입니다: 백엔드(`coffee-back`)와 모바일/웹 프런트엔드(`coffee-market`). 아래 지침은 코드 변경, 빌드/런, 패턴 식별에 즉시 도움이 되도록 이 프로젝트의 발견 가능한 정보만을 정리합니다.

## 한눈에 보기 (Big picture)
- **구성:**
  - `coffee-back` — Spring Boot (Java 17) 기반 백엔드. 빌드: Maven (`./mvnw`).
  - `coffee-market` — Expo + React Native(React 19) 기반 앱(모바일/웹 데모). 라우터: `expo-router`.
- **데이터 흐름:** 현재 프런트엔드는 더미 데이터(예: `app/(tabs)/home.js`)를 사용해 라우팅과 화면 전환을 시연합니다. 백엔드는 기본 Spring Boot 애플리케이션(`CoffeeBackApplication.java`)만 존재하며, 별도의 API 엔드포인트가 발견되지 않았습니다.

## 파일·디렉터리 핵심 포인트
- `coffee-back/pom.xml` — Java 17, Spring Boot 스타터(웹mvc, data-jpa, security) 및 Lombok 설정(supported via annotationProcessorPaths).
- `coffee-back/src/main/java/org/example/coffee/CoffeeBackApplication.java` — Spring Boot 진입점.
- `coffee-back/src/main/resources/application.properties` — 애플리케이션 이름 설정(`spring.application.name=coffee-back`).
- `coffee-market/package.json` — Expo 기반 실행 스크립트(`npm run start` → `expo start`).
- `coffee-market/app/index.js` — 기본 라우트가 `/home`으로 리디렉트됩니다.
- `coffee-market/app/_layout.tsx` — 앱 전역 테마 및 네비게이션 구조(Expo Router의 Stack 사용).
- `coffee-market/app/(tabs)/home.js` — 배너/상품 목록 UI 예시. 라우팅 예: `router.push({ pathname: '/product/coffeedetail', params: {...} })`.

## 프로젝트별 실행 / 개발 워크플로
- Backend (로컬 개발)
  - 빌드: `./mvnw -DskipTests package` 또는 전체 빌드 `./mvnw package`.
  - 개발 실행: `./mvnw spring-boot:run` (기본 포트 8080).
  - 테스트: `./mvnw test`.
  - 디버깅: IDE(예: IntelliJ)에서 `CoffeeBackApplication`을 Run/Debug 하거나, Maven에서 원격 디버깅 JVM 인수 사용: `./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"`.

- Frontend (Expo)
  - 시작: `cd coffee-market && npm run start` → Expo DevTools 선택(android/ios/web 또는 터널).
  - 라우팅: `app/` 폴더 기반 파일 라우팅(`expo-router`). 페이지 컴포넌트는 경로에 따라 매칭됩니다.

## 패턴·컨벤션 (이 프로젝트에 특화된 내용)
- 백엔드
  - Java 패키지 네임스페이스: `org.example.coffee` — 컨트롤러/서비스/레포지토리 클래스는 이 루트 아래에 위치시킵니다.
  - Lombok이 의존성으로 포함되어 있으므로 DTO/엔티티에서 Lombok 어노테이션(예: `@Data`, `@Builder`)를 기대합니다.
  - Spring Security 스타터가 포함되어 있으나 설정 파일이나 보안 구성 클래스가 현재 보이지 않습니다 — 보안 추가 시 `security` 설정을 프로젝트 루트 패키지 내에 둡니다.
- 프런트엔드
  - Expo Router 사용으로 경로는 `app/<path>`가 곧 라우트입니다. 예: `app/product/coffeedetail.js` → 경로 `/product/coffeedetail`.
  - 화면 간 전달은 `router.push({ pathname, params })` 형태로 이루어집니다(예시는 `app/(tabs)/home.js`).

## 통합 포인트 / 외부 의존성
- 현재 코드베이스에서 백엔드-프런트엔드 간 네트워크 호출(HTTP fetch / axios 등)은 발견되지 않았습니다. API를 추가하려면 다음 관례를 따르세요:
  - 백엔드: REST 컨트롤러를 `src/main/java/org/example/coffee/controller`에 추가하고 `/api/...` 네임스페이스 사용 권장.
  - 프런트엔드: 개발 시 Expo가 로컬호스트를 바라본다면 모바일 디바이스에서는 머신 IP나 Expo의 tunnel을 사용해야 합니다.

## AI 에이전트에게 바라는 점 (구체적·행동 가능한 지시)
- 변경 전: 관련 테스트(`./mvnw test`)를 먼저 실행하여 리그레션이 없는지 확인하세요.
- API 추가 제안: 백엔드에 새로운 컨트롤러를 추가하면 `coffee-market`의 관련 화면에서 실제 API 호출로 대체할 수 있습니다. 예시: `GET /api/products` → `app/(tabs)/home.js`의 더미 `products` 대체.
- 코드 변경 시 프로젝트 루트의 `pom.xml`·`package.json` 스크립트를 업데이트하고, 필요한 경우 `README` 또는 `HELP.md`에 실행 명령을 추가하세요.

## 찾아볼 파일(예시)
- `coffee-back/pom.xml`
- `coffee-back/src/main/java/org/example/coffee/CoffeeBackApplication.java`
- `coffee-back/src/main/resources/application.properties`
- `coffee-market/package.json`
- `coffee-market/app/index.js`
- `coffee-market/app/(tabs)/home.js`

---
피드백: 이 초안을 저장했습니다. 더 상세히 원하는 항목(예: API 설계 권고, 테스트 커버리지 가이드, VSCode 런/디버그 설정 샘플)이 있으면 알려주세요.
