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
import org.example.coffee.repository.CartItemRepository;
import org.example.coffee.repository.ProductRepository;
import org.example.coffee.repository.ProductOptionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;

    public List<CartItemResponse> getCartItems(String sessionId) {
        List<CartItem> items = cartItemRepository.findBySessionId(sessionId);

        return items.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemResponse addToCart(CartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));

        ProductOption option = productOptionRepository.findById(request.getOptionId())
                .orElseThrow(() -> new RuntimeException("옵션이 존재하지 않습니다."));

        CartItem cartItem = cartItemRepository
                .findBySessionIdAndProduct_ProductIdAndOption_OptionId(
                        request.getSessionId(), request.getProductId(), request.getOptionId())
                .orElse(null);

        if (cartItem != null) {
            cartItem.addQuantity(request.getQuantity());
        } else {
            cartItem = CartItem.builder()
                    .sessionId(request.getSessionId())
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
    public void clearCart(String sessionId) {
        cartItemRepository.deleteBySessionId(sessionId);
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
