package org.example.coffee.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.Orders;

public interface OrdersRepository extends JpaRepository<Orders, Long> {

    List<Orders> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    List<Orders> findByStatus(String status);
}
