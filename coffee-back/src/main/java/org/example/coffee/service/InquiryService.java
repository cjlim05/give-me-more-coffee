package org.example.coffee.service;

import lombok.RequiredArgsConstructor;
import org.example.coffee.dto.InquiryRequest;
import org.example.coffee.dto.InquiryResponse;
import org.example.coffee.entity.Product;
import org.example.coffee.entity.ProductInquiry;
import org.example.coffee.entity.User;
import org.example.coffee.repository.ProductInquiryRepository;
import org.example.coffee.repository.ProductRepository;
import org.example.coffee.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    private final ProductInquiryRepository inquiryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // 상품별 문의 목록 조회
    public List<InquiryResponse> getInquiriesByProduct(Long productId, Long currentUserId) {
        List<ProductInquiry> inquiries = inquiryRepository.findByProductIdWithUser(productId);

        return inquiries.stream()
                .map(inquiry -> {
                    InquiryResponse response = InquiryResponse.from(inquiry);
                    // 비밀글이면서 본인이 아닌 경우 내용 숨김
                    if (inquiry.getIsSecret() && !inquiry.getUser().getUserId().equals(currentUserId)) {
                        return InquiryResponse.builder()
                                .inquiryId(response.getInquiryId())
                                .productId(response.getProductId())
                                .productName(response.getProductName())
                                .userId(response.getUserId())
                                .userName(response.getUserName())
                                .title("비밀글입니다.")
                                .content("비밀글입니다.")
                                .answer(null)
                                .isSecret(true)
                                .isAnswered(response.getIsAnswered())
                                .createdAt(response.getCreatedAt())
                                .build();
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    // 문의 상세 조회
    public InquiryResponse getInquiry(Long inquiryId, Long currentUserId) {
        ProductInquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다."));

        // 비밀글이면서 본인이 아닌 경우
        if (inquiry.getIsSecret() && !inquiry.getUser().getUserId().equals(currentUserId)) {
            throw new RuntimeException("비밀글은 작성자만 볼 수 있습니다.");
        }

        return InquiryResponse.from(inquiry);
    }

    // 내 문의 목록 조회
    public List<InquiryResponse> getMyInquiries(Long userId) {
        List<ProductInquiry> inquiries = inquiryRepository.findByUserIdWithProduct(userId);
        return inquiries.stream()
                .map(InquiryResponse::from)
                .collect(Collectors.toList());
    }

    // 상품별 문의 개수
    public Long getInquiryCount(Long productId) {
        return inquiryRepository.countByProductProductId(productId);
    }

    // 문의 작성
    @Transactional
    public InquiryResponse createInquiry(Long userId, InquiryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        ProductInquiry inquiry = ProductInquiry.builder()
                .user(user)
                .product(product)
                .title(request.getTitle())
                .content(request.getContent())
                .isSecret(request.getIsSecret() != null ? request.getIsSecret() : false)
                .build();

        ProductInquiry saved = inquiryRepository.save(inquiry);
        return InquiryResponse.from(saved);
    }

    // 문의 수정
    @Transactional
    public InquiryResponse updateInquiry(Long inquiryId, Long userId, InquiryRequest request) {
        ProductInquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다."));

        // 본인 확인
        if (!inquiry.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("본인의 문의만 수정할 수 있습니다.");
        }

        // 답변이 달린 문의는 수정 불가
        if (inquiry.getAnswer() != null) {
            throw new RuntimeException("답변이 달린 문의는 수정할 수 없습니다.");
        }

        inquiry.setTitle(request.getTitle());
        inquiry.setContent(request.getContent());
        inquiry.setIsSecret(request.getIsSecret() != null ? request.getIsSecret() : inquiry.getIsSecret());

        return InquiryResponse.from(inquiry);
    }

    // 문의 삭제
    @Transactional
    public void deleteInquiry(Long inquiryId, Long userId) {
        ProductInquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다."));

        // 본인 확인
        if (!inquiry.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("본인의 문의만 삭제할 수 있습니다.");
        }

        inquiryRepository.delete(inquiry);
    }
}
