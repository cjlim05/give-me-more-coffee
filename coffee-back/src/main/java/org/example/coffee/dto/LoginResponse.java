package org.example.coffee.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private UserResponse user;

    @Getter
    @Builder
    public static class UserResponse {
        private Long userId;
        private String email;
        private String name;
        private String phone;
        private String profileImage;
        private Integer point;
    }
}
