package org.example.coffee.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.example.coffee.dto.PointHistoryResponse;
import org.example.coffee.service.PointService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/points")
@RequiredArgsConstructor
public class PointController {

    private final PointService pointService;

    @GetMapping
    public Map<String, Object> getMyPoint(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Integer currentPoint = pointService.getCurrentPoint(userId);
        List<PointHistoryResponse> history = pointService.getPointHistory(userId);

        return Map.of(
            "currentPoint", currentPoint,
            "history", history
        );
    }

    @GetMapping("/history")
    public List<PointHistoryResponse> getPointHistory(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return pointService.getPointHistory(userId);
    }
}
