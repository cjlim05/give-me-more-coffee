package org.example.coffee.dto;

import lombok.Builder;
import lombok.Getter;
import org.example.coffee.entity.ProductInquiry;

import java.time.LocalDateTime;

@Getter
@Builder
public class InquiryResponse {
    private Long inquiryId;
    private Long productId;
    private String productName;
    private String productThumbnail;
    private Long userId;
    private String userName;
    private String title;
    private String content;
    private String answer;
    private LocalDateTime answeredAt;
    private Boolean isSecret;
    private Boolean isAnswered;
    private LocalDateTime createdAt;

    public static InquiryResponse from(ProductInquiry inquiry) {
        return InquiryResponse.builder()
                .inquiryId(inquiry.getInquiryId())
                .productId(inquiry.getProduct().getProductId())
                .productName(inquiry.getProduct().getProductName())
                .productThumbnail(inquiry.getProduct().getThumbnailImg())
                .userId(inquiry.getUser().getUserId())
                .userName(maskName(inquiry.getUser().getName()))
                .title(inquiry.getTitle())
                .content(inquiry.getContent())
                .answer(inquiry.getAnswer())
                .answeredAt(inquiry.getAnsweredAt())
                .isSecret(inquiry.getIsSecret())
                .isAnswered(inquiry.getAnswer() != null)
                .createdAt(inquiry.getCreatedAt())
                .build();
    }

    // 이름 마스킹 (홍길동 -> 홍*동)
    private static String maskName(String name) {
        if (name == null || name.length() < 2) {
            return name;
        }
        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        return name.charAt(0) + "*".repeat(name.length() - 2) + name.charAt(name.length() - 1);
    }
}
