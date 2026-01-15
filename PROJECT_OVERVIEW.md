# Give Me More Coffee - 프로젝트 개요

커피 원두 판매 이커머스 애플리케이션 (모노레포 구조)

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| **Backend** | Spring Boot | 3.2.5 |
| | Java | 17 |
| | MySQL | - |
| | Spring Data JPA | - |
| | Spring Security | - |
| | Lombok | - |
| **Frontend** | Expo | ~54.0.30 |
| | React | 19.1.0 |
| | React Native | 0.81.5 |
| | Expo Router | ~6.0.21 |
| | TypeScript | ~5.9.2 |

## 디렉토리 구조

```
give-me-more-coffee/
├── coffee-back/                    # 백엔드 (Spring Boot)
│   ├── pom.xml                     # Maven 설정
│   ├── mvnw / mvnw.cmd             # Maven 래퍼
│   └── src/
│       ├── main/java/org/example/coffee/
│       │   ├── CoffeeBackApplication.java   # 메인 클래스
│       │   ├── controller/                  # REST API 컨트롤러
│       │   │   └── ProductController.java
│       │   ├── entity/                      # JPA 엔티티
│       │   │   ├── Product.java
│       │   │   ├── Category.java
│       │   │   ├── ProductOption.java
│       │   │   └── ProductVariant.java
│       │   ├── repository/                  # 데이터 접근 계층
│       │   │   └── ProductRepository.java
│       │   └── service/                     # 비즈니스 로직
│       │       └── ProductService.java
│       └── main/resources/
│           └── application.properties       # 설정 파일
│
└── coffee-market/                  # 프론트엔드 (Expo + React Native)
    ├── package.json                # NPM 의존성
    ├── app.json                    # Expo 설정
    ├── tsconfig.json               # TypeScript 설정
    ├── app/                        # 페이지 라우팅
    │   ├── _layout.tsx             # 루트 레이아웃
    │   ├── index.js                # 진입점 → /home 리다이렉트
    │   ├── home/
    │   │   └── index.js            # 홈 페이지
    │   ├── product/
    │   │   └── coffeedetail.js     # 상품 상세
    │   ├── login/
    │   │   ├── login.js            # 로그인
    │   │   ├── signup.js           # 회원가입
    │   │   ├── findid.js           # ID 찾기
    │   │   └── findpassword.js     # 비밀번호 찾기
    │   └── user/
    │       └── index.js            # 사용자 프로필
    ├── components/                 # 재사용 컴포넌트
    │   ├── Header.js               # 헤더 (메뉴, 검색, 필터)
    │   └── ...
    ├── constants/
    │   └── Colors.ts               # 색상 정의
    └── assets/                     # 이미지, 폰트, 아이콘
```

## 데이터베이스 스키마

### product (상품)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| product_id | PK | 상품 ID |
| product_name | VARCHAR | 상품명 |
| base_price | INT | 기본 가격 |
| nationality | VARCHAR | 원산지 |
| type | VARCHAR | 가공 방식 |
| category_id | FK | 카테고리 ID |
| thumbnail_img | VARCHAR | 썸네일 이미지 |
| detail_img | VARCHAR | 상세 이미지 |

### category (카테고리)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| category_id | PK | 카테고리 ID |
| category_name | VARCHAR | 카테고리명 |

### product_option (상품 옵션)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| option_id | PK | 옵션 ID |
| product_id | FK | 상품 ID |
| option_value | VARCHAR | 옵션 값 (예: 200g, 500g, 1kg) |
| extra_price | INT | 추가 가격 |

### product_variant (재고)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| variant_id | PK | 변형 ID |
| product_id | FK | 상품 ID |
| option_id | FK | 옵션 ID |
| stock | INT | 재고 수량 |

## API 엔드포인트

### 현재 구현됨
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/products/latest` | 최신 상품 10개 |
| GET | `/api/products/best` | 베스트 상품 (카테고리 1) |
| GET | `/api/products/{productId}` | 상품 상세 정보 |

### 구현 예정
- 사용자 인증 (로그인, 회원가입, 소셜 로그인)
- 장바구니 기능
- 주문/결제 기능
- 사용자 프로필 관리

## 프론트엔드 라우트

| 라우트 | 설명 | 상태 |
|--------|------|------|
| `/home` | 홈 (배너, 최신/베스트 상품) | 구현됨 |
| `/product/coffeedetail` | 상품 상세 (옵션, 수량 선택) | 구현됨 |
| `/login/login` | 로그인 | UI 구현됨 |
| `/login/signup` | 회원가입 | UI 구현됨 |
| `/login/findid` | ID 찾기 | UI 구현됨 |
| `/login/findpassword` | 비밀번호 찾기 | UI 구현됨 |
| `/user` | 사용자 프로필 | 라우트만 존재 |

## 개발 명령어

### Backend
```bash
cd coffee-back
./mvnw spring-boot:run    # 서버 실행 (포트 8080)
./mvnw package            # 빌드
./mvnw test               # 테스트
```

### Frontend
```bash
cd coffee-market
npm run start             # Expo 개발 서버
npm run android           # Android 실행
npm run ios               # iOS 실행
npm run web               # 웹 브라우저 실행
```

## 설정 사항

### Backend (application.properties)
- 서버 포트: 8080
- 데이터베이스: MySQL (환경변수로 설정)
- 타임존: Asia/Seoul
- CORS: 모든 origin 허용

### Frontend
- API 서버 URL: `http://YOUR_SERVER_IP:8080` (변경 필요)

## TODO

- [ ] 프론트엔드 API URL 설정
- [ ] 사용자 인증 구현 (백엔드 + 프론트엔드)
- [ ] 소셜 로그인 연동 (네이버, 카카오, 구글)
- [ ] 장바구니 기능
- [ ] 주문/결제 기능
- [ ] 상품 필터링 (원산지, 가공방식)
