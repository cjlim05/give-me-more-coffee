package org.example.coffee.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.example.coffee.dto.AddressRequest;
import org.example.coffee.dto.AddressResponse;
import org.example.coffee.service.AddressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public List<AddressResponse> getMyAddresses(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return addressService.getAddressesByUserId(userId);
    }

    @PostMapping
    public AddressResponse addAddress(Authentication authentication, @RequestBody AddressRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return addressService.addAddress(userId, request);
    }

    @PutMapping("/{addressId}")
    public AddressResponse updateAddress(
            @PathVariable Long addressId,
            Authentication authentication,
            @RequestBody AddressRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return addressService.updateAddress(addressId, userId, request);
    }

    @DeleteMapping("/{addressId}")
    public void deleteAddress(@PathVariable Long addressId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        addressService.deleteAddress(addressId, userId);
    }

    @PatchMapping("/{addressId}/default")
    public void setDefaultAddress(@PathVariable Long addressId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        addressService.setDefaultAddress(addressId, userId);
    }
}
