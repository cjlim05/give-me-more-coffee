package org.example.coffee.controller;

import lombok.RequiredArgsConstructor;
import org.example.coffee.dto.LoginResponse;
import org.example.coffee.dto.RefreshRequest;
import org.example.coffee.dto.SocialLoginRequest;
import org.example.coffee.entity.User;
import org.example.coffee.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    /**
     * 소셜 로그인
     * POST /api/auth/login
     * Body: { "provider": "KAKAO", "accessToken": "소셜에서 받은 토큰" }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> socialLogin(@RequestBody SocialLoginRequest request) {
        LoginResponse response = authService.socialLogin(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 토큰 갱신
     * POST /api/auth/refresh
     * Body: { "refreshToken": "리프레시 토큰" }
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@RequestBody RefreshRequest request) {
        LoginResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    /**
     * 현재 유저 정보 조회
     * GET /api/auth/me
     * Header: Authorization: Bearer {accessToken}
     */
    @GetMapping("/me")
    public ResponseEntity<LoginResponse.UserResponse> getCurrentUser(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        User user = authService.getUserFromToken(token);

        LoginResponse.UserResponse response = LoginResponse.UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .point(user.getPoint())
                .build();

        return ResponseEntity.ok(response);
    }
}
