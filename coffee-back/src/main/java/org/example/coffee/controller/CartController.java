package org.example.coffee.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import org.example.coffee.dto.CartItemResponse;
import org.example.coffee.dto.CartRequest;
import org.example.coffee.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public List<CartItemResponse> getCart(@RequestParam String sessionId) {
        return cartService.getCartItems(sessionId);
    }

    @PostMapping
    public CartItemResponse addToCart(@RequestBody CartRequest request) {
        return cartService.addToCart(request);
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
    public void clearCart(@RequestParam String sessionId) {
        cartService.clearCart(sessionId);
    }
}
