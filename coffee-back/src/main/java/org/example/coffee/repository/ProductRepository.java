package org.example.coffee.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 최근 입고
    List<Product> findTop10ByOrderByProductIdDesc();

    // 베스트 셀렉션
    List<Product> findTop10ByOrderByProductIdAsc();

    // 대륙별 필터링
    List<Product> findByContinent(String continent);

    // 원산지(나라)별 필터링
    List<Product> findByNationality(String nationality);

    // 가공방식별 필터링
    List<Product> findByType(String type);
}
