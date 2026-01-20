package org.example.coffee.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.example.coffee.dto.ReviewRequest;
import org.example.coffee.dto.ReviewResponse;
import org.example.coffee.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 상품별 리뷰 조회 (로그인 없이 가능)
    @GetMapping("/product/{productId}")
    public List<ReviewResponse> getProductReviews(@PathVariable Long productId) {
        return reviewService.getReviewsByProductId(productId);
    }

    // 상품 리뷰 통계
    @GetMapping("/product/{productId}/stats")
    public Map<String, Object> getProductReviewStats(@PathVariable Long productId) {
        return reviewService.getReviewStats(productId);
    }

    // 내 리뷰 조회
    @GetMapping("/my")
    public List<ReviewResponse> getMyReviews(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return reviewService.getReviewsByUserId(userId);
    }

    // 리뷰 작성
    @PostMapping
    public ReviewResponse createReview(Authentication authentication, @RequestBody ReviewRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return reviewService.createReview(userId, request);
    }

    // 리뷰 수정
    @PutMapping("/{reviewId}")
    public ReviewResponse updateReview(
            @PathVariable Long reviewId,
            Authentication authentication,
            @RequestBody ReviewRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return reviewService.updateReview(reviewId, userId, request);
    }

    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public void deleteReview(@PathVariable Long reviewId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        reviewService.deleteReview(reviewId, userId);
    }
}
