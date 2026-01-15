package org.example.coffee.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.example.coffee.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProduct_ProductIdOrderByCreatedAtDesc(Long productId);

    List<Review> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.productId = :productId")
    Long countByProductId(@Param("productId") Long productId);
}
