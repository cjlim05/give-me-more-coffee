package org.example.coffee.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 최근 입고
    List<Product> findTop10ByOrderByProductIdDesc();

    // 베스트 셀렉션 (category_id = 1 가정)
    List<Product> findTop10ByCategoryId(Long categoryId);
}
