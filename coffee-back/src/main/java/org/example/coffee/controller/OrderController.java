package org.example.coffee.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.example.coffee.dto.OrderResponse;
import org.example.coffee.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<OrderResponse> getMyOrders(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return orderService.getOrdersByUserId(userId);
    }

    @GetMapping("/{orderId}")
    public OrderResponse getOrderDetail(@PathVariable Long orderId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return orderService.getOrderById(orderId, userId);
    }
}
