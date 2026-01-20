package org.example.coffee.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewResponse {

    private Long reviewId;
    private Long productId;
    private String productName;
    private String productThumbnail;
    private Long userId;
    private String userName;
    private String userProfileImage;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
}
