# Coffee Shop Database Schema

## 테이블 관계도

```
┌─────────────────────┐          ┌─────────────────────┐
│      USER 영역       │          │     PRODUCT 영역     │
└─────────────────────┘          └─────────────────────┘

     ┌──────┐                         ┌─────────┐
     │ user │                         │ product │
     └──┬───┘                         └────┬────┘
        │                                  │
   ┌────┼────┐                    ┌────────┼────────┐
   ▼    ▼    ▼                    ▼        ▼        ▼
┌────┐┌────┐┌─────┐         ┌────────┐┌────────┐┌────────┐
│addr││pnt ││order│         │ option ││ image  ││ variant│
└────┘└────┘└──┬──┘         └───┬────┘└────────┘└────────┘
               │                │
               ▼                │
          ┌─────────┐           │
          │order_itm│           │
          └─────────┘           │


┌─────────────────────────────────────────────────────────┐
│                    연결 테이블                            │
│   (user와 product를 이어주는 테이블들)                     │
└─────────────────────────────────────────────────────────┘

    cart_item    →  user_id + product_id + option_id
    order_item   →  order_id(→user) + product_id + option_id
    review       →  user_id + product_id
```

---

## 영역별 테이블 분류

| 영역 | 테이블 | 설명 |
|------|--------|------|
| **USER** | user | 회원 |
| | user_address | 배송지 |
| | point_history | 포인트 |
| | orders | 주문 |
| **PRODUCT** | product | 상품 |
| | product_option | 옵션 |
| | product_image | 이미지 |
| | product_variant | 재고 |
| **연결** | cart_item | 장바구니 (user ↔ product) |
| | order_item | 주문상품 (order ↔ product) |
| | review | 리뷰 (user ↔ product) |
| | review_image | 리뷰사진 |

---

## 관계 요약

| 부모 | 자식 | 관계 | 설명 |
|------|------|------|------|
| user | user_address | 1:N | 배송지 여러개 |
| user | cart_item | 1:N | 장바구니 |
| user | orders | 1:N | 주문 내역 |
| user | review | 1:N | 작성한 리뷰 |
| user | point_history | 1:N | 포인트 내역 |
| orders | order_item | 1:N | 주문 상품들 |
| review | review_image | 1:N | 리뷰 사진들 |
| product | product_option | 1:N | 옵션 (200g, 500g) |
| product | product_image | 1:N | 상품 사진들 |
| product | product_variant | 1:N | 재고 |
| product | review | 1:N | 상품 리뷰 |

---

## 테이블 상세

### 1. user (회원)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| user_id | BIGINT | PK | 회원 ID |
| email | VARCHAR(100) | YES | 이메일 |
| name | VARCHAR(50) | YES | 이름 |
| phone | VARCHAR(20) | YES | 연락처 |
| profile_image | VARCHAR(255) | YES | 프로필 이미지 URL |
| provider | VARCHAR(20) | NO | 소셜 제공자 (KAKAO, NAVER, GOOGLE) |
| provider_id | VARCHAR(100) | NO | 소셜 고유 ID |
| point | INT | DEFAULT 0 | 보유 포인트 |
| created_at | DATETIME | DEFAULT NOW | 가입일 |
| updated_at | DATETIME | AUTO UPDATE | 수정일 |

> **UNIQUE KEY**: (provider, provider_id) - 소셜 로그인 중복 방지

---

### 2. user_address (배송지)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| address_id | BIGINT | PK | 배송지 ID |
| user_id | BIGINT | FK | 회원 ID |
| name | VARCHAR(50) | NO | 배송지명 (집, 회사) |
| recipient | VARCHAR(50) | NO | 받는 사람 |
| phone | VARCHAR(20) | NO | 연락처 |
| zipcode | VARCHAR(10) | YES | 우편번호 |
| address | VARCHAR(200) | NO | 기본주소 |
| address_detail | VARCHAR(100) | YES | 상세주소 |
| is_default | BOOLEAN | DEFAULT FALSE | 기본 배송지 여부 |
| created_at | DATETIME | DEFAULT NOW | 등록일 |

---

### 3. cart_item (장바구니)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| cart_item_id | BIGINT | PK | 장바구니 ID |
| user_id | BIGINT | FK | 회원 ID |
| product_id | BIGINT | FK | 상품 ID |
| option_id | BIGINT | FK | 옵션 ID |
| quantity | INT | DEFAULT 1 | 수량 |
| created_at | DATETIME | DEFAULT NOW | 담은 날짜 |

> **UNIQUE KEY**: (user_id, product_id, option_id) - 같은 상품+옵션 중복 방지

---

### 4. orders (주문)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| order_id | BIGINT | PK | 주문 ID |
| user_id | BIGINT | FK | 회원 ID |
| total_price | INT | NO | 상품 총액 |
| used_point | INT | DEFAULT 0 | 사용 포인트 |
| earned_point | INT | DEFAULT 0 | 적립 포인트 |
| final_price | INT | NO | 최종 결제금액 |
| status | VARCHAR(20) | DEFAULT 'PENDING' | 주문 상태 |
| recipient | VARCHAR(50) | NO | 받는 사람 |
| phone | VARCHAR(20) | NO | 연락처 |
| zipcode | VARCHAR(10) | YES | 우편번호 |
| address | VARCHAR(200) | NO | 기본주소 |
| address_detail | VARCHAR(100) | YES | 상세주소 |
| memo | VARCHAR(200) | YES | 배송 메모 |
| created_at | DATETIME | DEFAULT NOW | 주문일 |
| paid_at | DATETIME | YES | 결제일 |
| shipped_at | DATETIME | YES | 발송일 |
| delivered_at | DATETIME | YES | 배송완료일 |

> **status 값**: PENDING → PAID → PREPARING → SHIPPED → DELIVERED / CANCELLED

---

### 5. order_item (주문 상품)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| order_item_id | BIGINT | PK | 주문상품 ID |
| order_id | BIGINT | FK | 주문 ID |
| product_id | BIGINT | FK | 상품 ID |
| option_id | BIGINT | FK | 옵션 ID |
| quantity | INT | NO | 수량 |
| price | INT | NO | 주문 당시 단가 |

---

### 6. review (리뷰)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| review_id | BIGINT | PK | 리뷰 ID |
| user_id | BIGINT | FK | 작성자 ID |
| product_id | BIGINT | FK | 상품 ID |
| order_item_id | BIGINT | FK, NULL | 주문상품 ID (구매인증) |
| rating | INT | NO | 별점 (1~5) |
| content | TEXT | YES | 리뷰 내용 |
| created_at | DATETIME | DEFAULT NOW | 작성일 |
| updated_at | DATETIME | AUTO UPDATE | 수정일 |

---

### 7. review_image (리뷰 이미지)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| image_id | BIGINT | PK | 이미지 ID |
| review_id | BIGINT | FK | 리뷰 ID |
| image_url | VARCHAR(250) | NO | 이미지 URL |
| sort_order | INT | DEFAULT 0 | 정렬 순서 |

---

### 8. point_history (포인트 내역)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| history_id | BIGINT | PK | 내역 ID |
| user_id | BIGINT | FK | 회원 ID |
| amount | INT | NO | 금액 (+적립, -사용) |
| type | VARCHAR(20) | NO | 타입 (EARN/USE/EXPIRE) |
| description | VARCHAR(100) | YES | 설명 ("구매 적립" 등) |
| order_id | BIGINT | FK, NULL | 관련 주문 ID |
| balance | INT | NO | 변동 후 잔액 |
| created_at | DATETIME | DEFAULT NOW | 발생일 |

---

### 9. product (상품)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| product_id | BIGINT | PK | 상품 ID |
| product_name | VARCHAR(200) | NO | 상품명 |
| base_price | INT | NO | 기본 가격 |
| nationality | VARCHAR(100) | YES | 원산지 |
| type | VARCHAR(100) | YES | 가공방식 |
| thumbnail_img | VARCHAR(250) | YES | 썸네일 |
| detail_img | VARCHAR(250) | YES | 상세 이미지 |

**필터링**
- `nationality`: 원산지별 필터 (프론트엔드 하드코딩)
- `type`: 가공방식별 필터 (프론트엔드 하드코딩)

---

### 10. product_option (상품 옵션)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| option_id | BIGINT | PK | 옵션 ID |
| product_id | BIGINT | FK | 상품 ID |
| option_value | VARCHAR(50) | NO | 옵션값 (200g, 500g) |
| extra_price | INT | NO | 추가금액 |

---

### 11. product_variant (재고)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| variant_id | BIGINT | PK | 변형 ID |
| product_id | BIGINT | FK | 상품 ID |
| option_id | BIGINT | FK | 옵션 ID |
| stock | INT | NO | 재고 수량 |

---

### 12. product_image (상품 이미지)
| 컬럼 | 타입 | NULL | 설명 |
|------|------|------|------|
| image_id | BIGINT | PK | 이미지 ID |
| product_id | BIGINT | FK | 상품 ID |
| image_url | VARCHAR(250) | YES | 이미지 URL |
| sort_order | INT | YES | 정렬 순서 |

---

## FK 참조 (교차)

| 테이블 | 참조하는 FK |
|--------|------------|
| cart_item | user_id, product_id, option_id |
| order_item | order_id, product_id, option_id |
| review | user_id, product_id, order_item_id |
| point_history | user_id, order_id |
| product_variant | product_id, option_id |
