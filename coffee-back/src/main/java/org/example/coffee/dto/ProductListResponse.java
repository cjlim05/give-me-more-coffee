package org.example.coffee.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductListResponse {

    private Long productId;
    private String productName;
    private int basePrice;
    private String continent;
    private String nationality;
    private String type;
    private String thumbnailImg;
}
