package org.example.coffee.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CartItemResponse {

    private Long cartItemId;
    private Long productId;
    private String productName;
    private String thumbnailImg;
    private int basePrice;

    private Long optionId;
    private String optionValue;
    private int extraPrice;

    private int quantity;
    private int totalPrice;
}
