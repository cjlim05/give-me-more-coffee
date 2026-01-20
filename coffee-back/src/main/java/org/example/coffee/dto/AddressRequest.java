package org.example.coffee.dto;

import lombok.Getter;

@Getter
public class AddressRequest {

    private String name;
    private String recipient;
    private String phone;
    private String zipcode;
    private String address;
    private String addressDetail;
    private Boolean isDefault;
}
