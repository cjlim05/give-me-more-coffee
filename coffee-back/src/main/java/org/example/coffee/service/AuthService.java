package org.example.coffee.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.coffee.config.JwtProvider;
import org.example.coffee.dto.LoginResponse;
import org.example.coffee.dto.SocialLoginRequest;
import org.example.coffee.entity.User;
import org.example.coffee.repository.UserRepository;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public LoginResponse socialLogin(SocialLoginRequest request) {
        String provider = request.getProvider().toUpperCase();
        String accessToken = request.getAccessToken();

        // 소셜 프로바이더에서 유저 정보 가져오기
        SocialUserInfo userInfo = getSocialUserInfo(provider, accessToken);

        // 유저 조회 또는 생성
        User user = userRepository.findByProviderAndProviderId(provider, userInfo.id)
                .orElseGet(() -> createUser(provider, userInfo));

        // JWT 토큰 생성
        String jwtAccessToken = jwtProvider.createAccessToken(user.getUserId());
        String jwtRefreshToken = jwtProvider.createRefreshToken(user.getUserId());

        return LoginResponse.builder()
                .accessToken(jwtAccessToken)
                .refreshToken(jwtRefreshToken)
                .user(toUserResponse(user))
                .build();
    }

    public LoginResponse refreshToken(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new RuntimeException("유효하지 않은 리프레시 토큰입니다.");
        }

        Long userId = jwtProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        String newAccessToken = jwtProvider.createAccessToken(userId);
        String newRefreshToken = jwtProvider.createRefreshToken(userId);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(toUserResponse(user))
                .build();
    }

    public User getUserFromToken(String token) {
        if (!jwtProvider.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }

        Long userId = jwtProvider.getUserIdFromToken(token);
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    private SocialUserInfo getSocialUserInfo(String provider, String accessToken) {
        return switch (provider) {
            case "KAKAO" -> getKakaoUserInfo(accessToken);
            case "NAVER" -> getNaverUserInfo(accessToken);
            case "GOOGLE" -> getGoogleUserInfo(accessToken);
            default -> throw new RuntimeException("지원하지 않는 소셜 로그인입니다: " + provider);
        };
    }

    private SocialUserInfo getKakaoUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://kapi.kakao.com/v2/user/me",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            String id = root.get("id").asText();
            JsonNode kakaoAccount = root.get("kakao_account");
            JsonNode profile = kakaoAccount.get("profile");

            String email = kakaoAccount.has("email") ? kakaoAccount.get("email").asText() : null;
            String name = profile.has("nickname") ? profile.get("nickname").asText() : "카카오유저";
            String profileImage = profile.has("profile_image_url") ? profile.get("profile_image_url").asText() : null;

            return new SocialUserInfo(id, email, name, profileImage);
        } catch (Exception e) {
            throw new RuntimeException("카카오 사용자 정보를 가져오는데 실패했습니다.", e);
        }
    }

    private SocialUserInfo getNaverUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://openapi.naver.com/v1/nid/me",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode responseNode = root.get("response");

            String id = responseNode.get("id").asText();
            String email = responseNode.has("email") ? responseNode.get("email").asText() : null;
            String name = responseNode.has("name") ? responseNode.get("name").asText() : "네이버유저";
            String profileImage = responseNode.has("profile_image") ? responseNode.get("profile_image").asText() : null;

            return new SocialUserInfo(id, email, name, profileImage);
        } catch (Exception e) {
            throw new RuntimeException("네이버 사용자 정보를 가져오는데 실패했습니다.", e);
        }
    }

    private SocialUserInfo getGoogleUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());

            String id = root.get("id").asText();
            String email = root.has("email") ? root.get("email").asText() : null;
            String name = root.has("name") ? root.get("name").asText() : "구글유저";
            String profileImage = root.has("picture") ? root.get("picture").asText() : null;

            return new SocialUserInfo(id, email, name, profileImage);
        } catch (Exception e) {
            throw new RuntimeException("구글 사용자 정보를 가져오는데 실패했습니다.", e);
        }
    }

    private User createUser(String provider, SocialUserInfo userInfo) {
        User user = User.builder()
                .email(userInfo.email)
                .name(userInfo.name)
                .profileImage(userInfo.profileImage)
                .provider(provider)
                .providerId(userInfo.id)
                .point(0)
                .build();

        return userRepository.save(user);
    }

    private LoginResponse.UserResponse toUserResponse(User user) {
        return LoginResponse.UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .point(user.getPoint())
                .build();
    }

    private record SocialUserInfo(String id, String email, String name, String profileImage) {}
}
