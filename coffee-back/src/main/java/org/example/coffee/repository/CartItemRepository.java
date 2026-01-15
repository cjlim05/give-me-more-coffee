package org.example.coffee.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUser_UserId(Long userId);

    Optional<CartItem> findByUser_UserIdAndProduct_ProductIdAndOption_OptionId(
            Long userId, Long productId, Long optionId);

    void deleteByUser_UserId(Long userId);
}
