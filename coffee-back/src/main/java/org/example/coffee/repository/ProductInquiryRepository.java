package org.example.coffee.repository;

import org.example.coffee.entity.ProductInquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductInquiryRepository extends JpaRepository<ProductInquiry, Long> {

    // 상품별 문의 목록 (최신순)
    @Query("SELECT i FROM ProductInquiry i JOIN FETCH i.user WHERE i.product.productId = :productId ORDER BY i.createdAt DESC")
    List<ProductInquiry> findByProductIdWithUser(@Param("productId") Long productId);

    // 상품별 문의 개수
    Long countByProductProductId(Long productId);

    // 내 문의 목록
    @Query("SELECT i FROM ProductInquiry i JOIN FETCH i.product WHERE i.user.userId = :userId ORDER BY i.createdAt DESC")
    List<ProductInquiry> findByUserIdWithProduct(@Param("userId") Long userId);

    // 상품별 문의 목록 (페이징)
    Page<ProductInquiry> findByProductProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
}
