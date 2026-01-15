package org.example.coffee.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartRequest {

    private String sessionId;
    private Long productId;
    private Long optionId;
    private int quantity;
}
