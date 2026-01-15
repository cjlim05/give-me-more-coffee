package org.example.coffee.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProduct_ProductIdOrderBySortOrderAsc(Long productId);
}
