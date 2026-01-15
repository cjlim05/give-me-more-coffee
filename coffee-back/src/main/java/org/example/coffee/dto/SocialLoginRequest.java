package org.example.coffee.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SocialLoginRequest {
    private String provider;      // KAKAO, NAVER, GOOGLE
    private String accessToken;   // 소셜에서 받은 access token
}
