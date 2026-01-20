package org.example.coffee.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {

    private Long orderId;
    private Integer totalPrice;
    private Integer usedPoint;
    private Integer earnedPoint;
    private Integer finalPrice;
    private String status;
    private String recipient;
    private String phone;
    private String zipcode;
    private String address;
    private String addressDetail;
    private String memo;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;

    private List<OrderItemDto> items;

    @Getter
    @Builder
    public static class OrderItemDto {
        private Long orderItemId;
        private Long productId;
        private String productName;
        private String thumbnailImg;
        private Long optionId;
        private String optionValue;
        private Integer quantity;
        private Integer price;
    }
}
