package org.example.coffee.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AddressResponse {

    private Long addressId;
    private String name;
    private String recipient;
    private String phone;
    private String zipcode;
    private String address;
    private String addressDetail;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}
