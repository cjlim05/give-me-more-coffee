package org.example.coffee.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.example.coffee.dto.OrderResponse;
import org.example.coffee.entity.OrderItem;
import org.example.coffee.entity.Orders;
import org.example.coffee.repository.OrderItemRepository;
import org.example.coffee.repository.OrdersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrdersRepository ordersRepository;
    private final OrderItemRepository orderItemRepository;

    public List<OrderResponse> getOrdersByUserId(Long userId) {
        List<Orders> orders = ordersRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        return orders.stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long orderId, Long userId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        if (!order.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        return toOrderResponse(order);
    }

    private OrderResponse toOrderResponse(Orders order) {
        List<OrderItem> items = orderItemRepository.findByOrder_OrderId(order.getOrderId());

        List<OrderResponse.OrderItemDto> itemDtos = items.stream()
                .map(item -> OrderResponse.OrderItemDto.builder()
                        .orderItemId(item.getOrderItemId())
                        .productId(item.getProduct().getProductId())
                        .productName(item.getProduct().getName())
                        .thumbnailImg(item.getProduct().getThumbnailImg())
                        .optionId(item.getOption().getOptionId())
                        .optionValue(item.getOption().getOptionValue())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .totalPrice(order.getTotalPrice())
                .usedPoint(order.getUsedPoint())
                .earnedPoint(order.getEarnedPoint())
                .finalPrice(order.getFinalPrice())
                .status(order.getStatus())
                .recipient(order.getRecipient())
                .phone(order.getPhone())
                .zipcode(order.getZipcode())
                .address(order.getAddress())
                .addressDetail(order.getAddressDetail())
                .memo(order.getMemo())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .items(itemDtos)
                .build();
    }
}
