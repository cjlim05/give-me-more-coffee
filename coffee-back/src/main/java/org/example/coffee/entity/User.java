package org.example.coffee.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"provider", "provider_id"})
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(length = 100)
    private String email;

    @Column(length = 50)
    private String name;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String profileImage;

    // 소셜 로그인 정보
    @Column(length = 20, nullable = false)
    private String provider;  // KAKAO, NAVER, GOOGLE

    @Column(name = "provider_id", length = 100, nullable = false)
    private String providerId;

    @Builder.Default
    @Column(nullable = false)
    private Integer point = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
