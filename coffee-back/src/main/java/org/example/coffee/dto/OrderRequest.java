package org.example.coffee.dto;

import lombok.Getter;

@Getter
public class OrderRequest {

    private Long addressId;
    private Integer usePoint;
    private String memo;
}
