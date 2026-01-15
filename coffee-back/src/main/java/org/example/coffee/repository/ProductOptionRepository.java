package org.example.coffee.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.ProductOption;

public interface ProductOptionRepository extends JpaRepository<ProductOption, Long> {

    List<ProductOption> findByProduct_ProductId(Long productId);
}
