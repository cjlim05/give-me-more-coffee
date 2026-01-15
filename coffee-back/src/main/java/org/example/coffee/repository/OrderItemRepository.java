package org.example.coffee.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder_OrderId(Long orderId);

    List<OrderItem> findByOrder_User_UserId(Long userId);
}
