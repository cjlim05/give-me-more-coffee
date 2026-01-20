package org.example.coffee.dto;

import lombok.Getter;

@Getter
public class ReviewRequest {

    private Long productId;
    private Long orderItemId;
    private Integer rating;
    private String content;
}
