package org.example.coffee.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.example.coffee.dto.AddressRequest;
import org.example.coffee.dto.AddressResponse;
import org.example.coffee.entity.User;
import org.example.coffee.entity.UserAddress;
import org.example.coffee.repository.UserAddressRepository;
import org.example.coffee.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressResponse> getAddressesByUserId(Long userId) {
        List<UserAddress> addresses = addressRepository.findByUser_UserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        return addresses.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddress(userId);
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .name(request.getName())
                .recipient(request.getRecipient())
                .phone(request.getPhone())
                .zipcode(request.getZipcode())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();

        UserAddress saved = addressRepository.save(address);
        return toResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(Long addressId, Long userId, AddressRequest request) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("배송지를 찾을 수 없습니다."));

        if (!address.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddress(userId);
        }

        address.setName(request.getName());
        address.setRecipient(request.getRecipient());
        address.setPhone(request.getPhone());
        address.setZipcode(request.getZipcode());
        address.setAddress(request.getAddress());
        address.setAddressDetail(request.getAddressDetail());
        address.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : address.getIsDefault());

        return toResponse(address);
    }

    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("배송지를 찾을 수 없습니다."));

        if (!address.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        addressRepository.delete(address);
    }

    @Transactional
    public void setDefaultAddress(Long addressId, Long userId) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("배송지를 찾을 수 없습니다."));

        if (!address.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        clearDefaultAddress(userId);
        address.setIsDefault(true);
    }

    private void clearDefaultAddress(Long userId) {
        addressRepository.findByUser_UserIdAndIsDefaultTrue(userId)
                .ifPresent(addr -> addr.setIsDefault(false));
    }

    private AddressResponse toResponse(UserAddress address) {
        return AddressResponse.builder()
                .addressId(address.getAddressId())
                .name(address.getName())
                .recipient(address.getRecipient())
                .phone(address.getPhone())
                .zipcode(address.getZipcode())
                .address(address.getAddress())
                .addressDetail(address.getAddressDetail())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }
}
