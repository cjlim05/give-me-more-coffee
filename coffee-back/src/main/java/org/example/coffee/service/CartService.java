package org.example.coffee.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.example.coffee.dto.CartItemResponse;
import org.example.coffee.dto.CartRequest;
import org.example.coffee.entity.CartItem;
import org.example.coffee.entity.Product;
import org.example.coffee.entity.ProductOption;
import org.example.coffee.entity.User;
import org.example.coffee.repository.CartItemRepository;
import org.example.coffee.repository.ProductRepository;
import org.example.coffee.repository.ProductOptionRepository;
import org.example.coffee.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;
    private final UserRepository userRepository;

    public List<CartItemResponse> getCartItems(Long userId) {
        List<CartItem> items = cartItemRepository.findByUser_UserId(userId);

        return items.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemResponse addToCart(Long userId, CartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다."));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));

        ProductOption option = productOptionRepository.findById(request.getOptionId())
                .orElseThrow(() -> new RuntimeException("옵션이 존재하지 않습니다."));

        CartItem cartItem = cartItemRepository
                .findByUser_UserIdAndProduct_ProductIdAndOption_OptionId(
                        userId, request.getProductId(), request.getOptionId())
                .orElse(null);

        if (cartItem != null) {
            cartItem.addQuantity(request.getQuantity());
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .option(option)
                    .quantity(request.getQuantity())
                    .build();
        }

        cartItemRepository.save(cartItem);
        return toResponse(cartItem);
    }

    @Transactional
    public void updateQuantity(Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("장바구니 항목이 존재하지 않습니다."));

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUser_UserId(userId);
    }

    private CartItemResponse toResponse(CartItem item) {
        Product product = item.getProduct();
        ProductOption option = item.getOption();
        int totalPrice = (product.getBasePrice() + option.getExtraPrice()) * item.getQuantity();

        return CartItemResponse.builder()
                .cartItemId(item.getCartItemId())
                .productId(product.getProductId())
                .productName(product.getProductName())
                .thumbnailImg(product.getThumbnailImg())
                .basePrice(product.getBasePrice())
                .optionId(option.getOptionId())
                .optionValue(option.getOptionValue())
                .extraPrice(option.getExtraPrice())
                .quantity(item.getQuantity())
                .totalPrice(totalPrice)
                .build();
    }
}
