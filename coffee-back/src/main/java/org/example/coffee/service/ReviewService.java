package org.example.coffee.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.example.coffee.dto.ReviewRequest;
import org.example.coffee.dto.ReviewResponse;
import org.example.coffee.entity.Product;
import org.example.coffee.entity.Review;
import org.example.coffee.entity.User;
import org.example.coffee.repository.ProductRepository;
import org.example.coffee.repository.ReviewRepository;
import org.example.coffee.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // 상품별 리뷰 조회
    public List<ReviewResponse> getReviewsByProductId(Long productId) {
        List<Review> reviews = reviewRepository.findByProduct_ProductIdOrderByCreatedAtDesc(productId);
        return reviews.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // 사용자별 리뷰 조회
    public List<ReviewResponse> getReviewsByUserId(Long userId) {
        List<Review> reviews = reviewRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        return reviews.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // 상품 리뷰 통계
    public Map<String, Object> getReviewStats(Long productId) {
        Double avgRating = reviewRepository.findAverageRatingByProductId(productId);
        Long count = reviewRepository.countByProductId(productId);

        return Map.of(
            "averageRating", avgRating != null ? avgRating : 0.0,
            "reviewCount", count != null ? count : 0
        );
    }

    // 리뷰 작성
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("별점은 1~5 사이여야 합니다.");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .content(request.getContent())
                .build();

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    // 리뷰 수정
    @Transactional
    public ReviewResponse updateReview(Long reviewId, Long userId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        if (!review.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("별점은 1~5 사이여야 합니다.");
        }

        review.setRating(request.getRating());
        review.setContent(request.getContent());

        return toResponse(review);
    }

    // 리뷰 삭제
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        if (!review.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .productId(review.getProduct().getProductId())
                .productName(review.getProduct().getProductName())
                .productThumbnail(review.getProduct().getThumbnailImg())
                .userId(review.getUser().getUserId())
                .userName(review.getUser().getName())
                .userProfileImage(review.getUser().getProfileImage())
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
