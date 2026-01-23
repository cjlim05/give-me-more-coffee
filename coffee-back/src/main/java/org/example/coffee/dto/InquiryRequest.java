package org.example.coffee.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InquiryRequest {
    private Long productId;
    private String title;
    private String content;
    private Boolean isSecret;
}
