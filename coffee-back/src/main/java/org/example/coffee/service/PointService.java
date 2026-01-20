package org.example.coffee.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.example.coffee.dto.PointHistoryResponse;
import org.example.coffee.entity.PointHistory;
import org.example.coffee.entity.User;
import org.example.coffee.repository.PointHistoryRepository;
import org.example.coffee.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PointService {

    private final PointHistoryRepository pointHistoryRepository;
    private final UserRepository userRepository;

    public Integer getCurrentPoint(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return user.getPoint();
    }

    public List<PointHistoryResponse> getPointHistory(Long userId) {
        List<PointHistory> history = pointHistoryRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        return history.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PointHistoryResponse toResponse(PointHistory history) {
        return PointHistoryResponse.builder()
                .historyId(history.getHistoryId())
                .amount(history.getAmount())
                .type(history.getType())
                .description(history.getDescription())
                .orderId(history.getOrder() != null ? history.getOrder().getOrderId() : null)
                .balance(history.getBalance())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
