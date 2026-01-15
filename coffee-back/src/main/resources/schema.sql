-- =====================================================
-- Coffee Shop Database Schema
-- =====================================================

-- 1. 회원
CREATE TABLE IF NOT EXISTS user (
    user_id       BIGINT PRIMARY KEY AUTO_INCREMENT,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    name          VARCHAR(50) NOT NULL,
    phone         VARCHAR(20),
    point         INT DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. 배송지
CREATE TABLE IF NOT EXISTS user_address (
    address_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id        BIGINT NOT NULL,
    name           VARCHAR(50) NOT NULL,
    recipient      VARCHAR(50) NOT NULL,
    phone          VARCHAR(20) NOT NULL,
    zipcode        VARCHAR(10),
    address        VARCHAR(200) NOT NULL,
    address_detail VARCHAR(100),
    is_default     BOOLEAN DEFAULT FALSE,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- 3. 장바구니
CREATE TABLE IF NOT EXISTS cart_item (
    cart_item_id  BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id       BIGINT NOT NULL,
    product_id    BIGINT NOT NULL,
    option_id     BIGINT NOT NULL,
    quantity      INT NOT NULL DEFAULT 1,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (option_id) REFERENCES product_option(option_id),
    UNIQUE KEY uk_cart (user_id, product_id, option_id)
);

-- 4. 주문
CREATE TABLE IF NOT EXISTS orders (
    order_id       BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id        BIGINT NOT NULL,
    total_price    INT NOT NULL,
    used_point     INT DEFAULT 0,
    earned_point   INT DEFAULT 0,
    final_price    INT NOT NULL,
    status         VARCHAR(20) DEFAULT 'PENDING',
    recipient      VARCHAR(50) NOT NULL,
    phone          VARCHAR(20) NOT NULL,
    zipcode        VARCHAR(10),
    address        VARCHAR(200) NOT NULL,
    address_detail VARCHAR(100),
    memo           VARCHAR(200),
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at        DATETIME,
    shipped_at     DATETIME,
    delivered_at   DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- 5. 주문 상품
CREATE TABLE IF NOT EXISTS order_item (
    order_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id      BIGINT NOT NULL,
    product_id    BIGINT NOT NULL,
    option_id     BIGINT NOT NULL,
    quantity      INT NOT NULL,
    price         INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (option_id) REFERENCES product_option(option_id)
);

-- 6. 리뷰
CREATE TABLE IF NOT EXISTS review (
    review_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id       BIGINT NOT NULL,
    product_id    BIGINT NOT NULL,
    order_item_id BIGINT,
    rating        INT NOT NULL,
    content       TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (order_item_id) REFERENCES order_item(order_item_id)
);

-- 7. 리뷰 이미지
CREATE TABLE IF NOT EXISTS review_image (
    image_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    review_id  BIGINT NOT NULL,
    image_url  VARCHAR(250) NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (review_id) REFERENCES review(review_id) ON DELETE CASCADE
);

-- 8. 포인트 내역
CREATE TABLE IF NOT EXISTS point_history (
    history_id  BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT NOT NULL,
    amount      INT NOT NULL,
    type        VARCHAR(20) NOT NULL,
    description VARCHAR(100),
    order_id    BIGINT,
    balance     INT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
