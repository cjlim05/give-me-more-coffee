/**
 * 소셜 로그인 설정
 *
 * 각 플랫폼에서 앱 등록 후 발급받은 키를 입력하세요.
 *
 * 카카오: https://developers.kakao.com
 *   - 애플리케이션 추가 → REST API 키 복사
 *   - 플랫폼 설정 → Web 플랫폼 등록 (Redirect URI 설정)
 *
 * 네이버: https://developers.naver.com
 *   - 애플리케이션 등록 → Client ID, Client Secret 복사
 *   - API 설정 → 네아로 (네이버 아이디로 로그인) 선택
 *
 * 구글: https://console.cloud.google.com
 *   - 새 프로젝트 생성 → OAuth 동의 화면 설정
 *   - 사용자 인증 정보 → OAuth 클라이언트 ID 만들기
 */

// API 서버 주소 (배포 시 변경)
export const API_BASE_URL = 'http://localhost:8080';

// 카카오
export const KAKAO_CONFIG = {
  REST_API_KEY: 'YOUR_KAKAO_REST_API_KEY',  // 여기에 입력
  REDIRECT_URI: 'https://auth.expo.io/@your-expo-username/coffee-market',
};

// 네이버
export const NAVER_CONFIG = {
  CLIENT_ID: 'YOUR_NAVER_CLIENT_ID',        // 여기에 입력
  CLIENT_SECRET: 'YOUR_NAVER_CLIENT_SECRET', // 여기에 입력
  REDIRECT_URI: 'https://auth.expo.io/@your-expo-username/coffee-market',
};

// 구글
export const GOOGLE_CONFIG = {
  CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID',       // 여기에 입력 (Web 클라이언트 ID)
  REDIRECT_URI: 'https://auth.expo.io/@your-expo-username/coffee-market',
};
