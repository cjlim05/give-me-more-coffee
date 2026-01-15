package org.example.coffee.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_price", nullable = false)
    private Integer totalPrice;

    @Builder.Default
    @Column(name = "used_point")
    private Integer usedPoint = 0;

    @Builder.Default
    @Column(name = "earned_point")
    private Integer earnedPoint = 0;

    @Column(name = "final_price", nullable = false)
    private Integer finalPrice;

    @Builder.Default
    @Column(length = 20)
    private String status = "PENDING";

    @Column(nullable = false, length = 50)
    private String recipient;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 10)
    private String zipcode;

    @Column(nullable = false, length = 200)
    private String address;

    @Column(name = "address_detail", length = 100)
    private String addressDetail;

    @Column(length = 200)
    private String memo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;
}
