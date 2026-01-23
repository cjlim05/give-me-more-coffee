package org.example.coffee.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.example.coffee.dto.InquiryRequest;
import org.example.coffee.dto.InquiryResponse;
import org.example.coffee.service.InquiryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    // 상품별 문의 목록 조회 (비로그인도 가능, 비밀글은 숨김 처리)
    @GetMapping("/product/{productId}")
    public List<InquiryResponse> getProductInquiries(
            @PathVariable Long productId,
            Authentication authentication) {
        Long currentUserId = authentication != null ? (Long) authentication.getPrincipal() : null;
        return inquiryService.getInquiriesByProduct(productId, currentUserId);
    }

    // 상품별 문의 개수
    @GetMapping("/product/{productId}/count")
    public Map<String, Long> getInquiryCount(@PathVariable Long productId) {
        Long count = inquiryService.getInquiryCount(productId);
        return Map.of("count", count);
    }

    // 문의 상세 조회
    @GetMapping("/{inquiryId}")
    public InquiryResponse getInquiry(
            @PathVariable Long inquiryId,
            Authentication authentication) {
        Long currentUserId = authentication != null ? (Long) authentication.getPrincipal() : null;
        return inquiryService.getInquiry(inquiryId, currentUserId);
    }

    // 내 문의 목록 조회
    @GetMapping("/my")
    public List<InquiryResponse> getMyInquiries(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return inquiryService.getMyInquiries(userId);
    }

    // 문의 작성
    @PostMapping
    public InquiryResponse createInquiry(
            Authentication authentication,
            @RequestBody InquiryRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return inquiryService.createInquiry(userId, request);
    }

    // 문의 수정
    @PutMapping("/{inquiryId}")
    public InquiryResponse updateInquiry(
            @PathVariable Long inquiryId,
            Authentication authentication,
            @RequestBody InquiryRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return inquiryService.updateInquiry(inquiryId, userId, request);
    }

    // 문의 삭제
    @DeleteMapping("/{inquiryId}")
    public void deleteInquiry(
            @PathVariable Long inquiryId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        inquiryService.deleteInquiry(inquiryId, userId);
    }
}
