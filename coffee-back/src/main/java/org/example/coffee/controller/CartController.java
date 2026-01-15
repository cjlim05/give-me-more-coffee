package org.example.coffee.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.example.coffee.dto.CartItemResponse;
import org.example.coffee.dto.CartRequest;
import org.example.coffee.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public List<CartItemResponse> getCart(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return cartService.getCartItems(userId);
    }

    @PostMapping
    public CartItemResponse addToCart(Authentication authentication, @RequestBody CartRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return cartService.addToCart(userId, request);
    }

    @PatchMapping("/{cartItemId}")
    public void updateQuantity(@PathVariable Long cartItemId, @RequestParam int quantity) {
        cartService.updateQuantity(cartItemId, quantity);
    }

    @DeleteMapping("/{cartItemId}")
    public void removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
    }

    @DeleteMapping
    public void clearCart(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        cartService.clearCart(userId);
    }
}
