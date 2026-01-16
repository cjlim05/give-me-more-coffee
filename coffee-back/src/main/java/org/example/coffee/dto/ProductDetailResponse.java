package org.example.coffee.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductDetailResponse {

    private Long productId;
    private String productName;
    private int basePrice;
    private String continent;
    private String nationality;
    private String type;
    private String thumbnailImg;
    private String detailImg;

    private List<OptionDto> options;
    private List<ImageDto> images;

    @Getter
    @Builder
    public static class OptionDto {
        private Long optionId;
        private String optionValue;
        private int extraPrice;
    }

    @Getter
    @Builder
    public static class ImageDto {
        private Long imageId;
        private String imageUrl;
        private Integer sortOrder;
    }
}
