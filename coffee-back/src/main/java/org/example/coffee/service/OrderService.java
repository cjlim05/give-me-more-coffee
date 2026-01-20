package org.example.coffee.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.example.coffee.dto.OrderRequest;
import org.example.coffee.dto.OrderResponse;
import org.example.coffee.entity.*;
import org.example.coffee.repository.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrdersRepository ordersRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final UserAddressRepository addressRepository;
    private final PointHistoryRepository pointHistoryRepository;

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

    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 장바구니 조회
        List<CartItem> cartItems = cartItemRepository.findByUser_UserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("장바구니가 비어있습니다.");
        }

        // 배송지 조회
        UserAddress address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new IllegalArgumentException("배송지를 찾을 수 없습니다."));

        if (!address.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        // 총 금액 계산
        int totalPrice = cartItems.stream()
                .mapToInt(item -> (item.getProduct().getBasePrice() + item.getOption().getExtraPrice()) * item.getQuantity())
                .sum();

        // 포인트 사용
        int usePoint = request.getUsePoint() != null ? request.getUsePoint() : 0;
        if (usePoint > user.getPoint()) {
            throw new IllegalArgumentException("포인트가 부족합니다.");
        }
        if (usePoint > totalPrice) {
            usePoint = totalPrice;
        }

        int finalPrice = totalPrice - usePoint;

        // 적립 포인트 (결제금액의 1%)
        int earnedPoint = (int) (finalPrice * 0.01);

        // 주문 생성
        Orders order = Orders.builder()
                .user(user)
                .totalPrice(totalPrice)
                .usedPoint(usePoint)
                .earnedPoint(earnedPoint)
                .finalPrice(finalPrice)
                .status("PENDING")
                .recipient(address.getRecipient())
                .phone(address.getPhone())
                .zipcode(address.getZipcode())
                .address(address.getAddress())
                .addressDetail(address.getAddressDetail())
                .memo(request.getMemo())
                .build();

        Orders savedOrder = ordersRepository.save(order);

        // 주문 상품 생성
        for (CartItem cartItem : cartItems) {
            int itemPrice = (cartItem.getProduct().getBasePrice() + cartItem.getOption().getExtraPrice()) * cartItem.getQuantity();

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(cartItem.getProduct())
                    .option(cartItem.getOption())
                    .quantity(cartItem.getQuantity())
                    .price(itemPrice)
                    .build();

            orderItemRepository.save(orderItem);
        }

        // 포인트 차감
        if (usePoint > 0) {
            user.setPoint(user.getPoint() - usePoint);

            PointHistory pointHistory = PointHistory.builder()
                    .user(user)
                    .amount(-usePoint)
                    .type("USE")
                    .description("주문 사용")
                    .order(savedOrder)
                    .balance(user.getPoint())
                    .build();

            pointHistoryRepository.save(pointHistory);
        }

        // 장바구니 비우기
        cartItemRepository.deleteByUser_UserId(userId);

        return toOrderResponse(savedOrder);
    }

    private OrderResponse toOrderResponse(Orders order) {
        List<OrderItem> items = orderItemRepository.findByOrder_OrderId(order.getOrderId());

        List<OrderResponse.OrderItemDto> itemDtos = items.stream()
                .map(item -> OrderResponse.OrderItemDto.builder()
                        .orderItemId(item.getOrderItemId())
                        .productId(item.getProduct().getProductId())
                        .productName(item.getProduct().getProductName())
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
