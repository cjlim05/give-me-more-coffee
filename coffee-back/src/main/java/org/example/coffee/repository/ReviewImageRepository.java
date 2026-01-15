package org.example.coffee.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.ReviewImage;

public interface ReviewImageRepository extends JpaRepository<ReviewImage, Long> {

    List<ReviewImage> findByReview_ReviewIdOrderBySortOrderAsc(Long reviewId);
}
