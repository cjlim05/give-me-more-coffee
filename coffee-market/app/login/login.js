import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_BASE_URL,
  KAKAO_CONFIG,
  NAVER_CONFIG,
  GOOGLE_CONFIG,
} from '../../config/oauth';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    try {
      setLoading(true);

      // 카카오 인증 URL
      const authUrl =
        `https://kauth.kakao.com/oauth/authorize?` +
        `client_id=${KAKAO_CONFIG.REST_API_KEY}` +
        `&redirect_uri=${encodeURIComponent(KAKAO_CONFIG.REDIRECT_URI)}` +
        `&response_type=code`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        KAKAO_CONFIG.REDIRECT_URI
      );

      if (result.type === 'success' && result.url) {
        const code = extractCodeFromUrl(result.url);
        if (code) {
          // 인가 코드로 액세스 토큰 교환
          const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=authorization_code&client_id=${KAKAO_CONFIG.REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_CONFIG.REDIRECT_URI)}&code=${code}`,
          });

          const tokenData = await tokenResponse.json();

          if (tokenData.access_token) {
            await sendToBackend('KAKAO', tokenData.access_token);
          }
        }
      }
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      Alert.alert('오류', '카카오 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 네이버 로그인
  const handleNaverLogin = async () => {
    try {
      setLoading(true);

      const state = Math.random().toString(36).substring(7);

      const authUrl =
        `https://nid.naver.com/oauth2.0/authorize?` +
        `client_id=${NAVER_CONFIG.CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(NAVER_CONFIG.REDIRECT_URI)}` +
        `&response_type=code` +
        `&state=${state}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        NAVER_CONFIG.REDIRECT_URI
      );

      if (result.type === 'success' && result.url) {
        const code = extractCodeFromUrl(result.url);
        if (code) {
          const tokenResponse = await fetch(
            `https://nid.naver.com/oauth2.0/token?` +
            `grant_type=authorization_code` +
            `&client_id=${NAVER_CONFIG.CLIENT_ID}` +
            `&client_secret=${NAVER_CONFIG.CLIENT_SECRET}` +
            `&code=${code}` +
            `&state=${state}`
          );

          const tokenData = await tokenResponse.json();

          if (tokenData.access_token) {
            await sendToBackend('NAVER', tokenData.access_token);
          }
        }
      }
    } catch (error) {
      console.error('네이버 로그인 에러:', error);
      Alert.alert('오류', '네이버 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 구글 로그인
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CONFIG.CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(GOOGLE_CONFIG.REDIRECT_URI)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent('email profile')}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        GOOGLE_CONFIG.REDIRECT_URI
      );

      if (result.type === 'success' && result.url) {
        // 구글은 implicit flow라서 URL fragment에서 토큰 추출
        const accessToken = extractTokenFromUrl(result.url);
        if (accessToken) {
          await sendToBackend('GOOGLE', accessToken);
        }
      }
    } catch (error) {
      console.error('구글 로그인 에러:', error);
      Alert.alert('오류', '구글 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 백엔드로 토큰 전송
  const sendToBackend = async (provider, accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          accessToken,
        }),
      });

      if (!response.ok) {
        throw new Error('로그인 실패');
      }

      const data = await response.json();

      // 토큰 저장
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      Alert.alert('로그인 성공', `${data.user.name}님 환영합니다!`, [
        { text: '확인', onPress: () => router.replace('/home') },
      ]);
    } catch (error) {
      console.error('백엔드 로그인 에러:', error);
      Alert.alert('오류', '서버 연결에 실패했습니다.');
    }
  };

  // URL에서 code 파라미터 추출
  const extractCodeFromUrl = (url) => {
    const match = url.match(/[?&]code=([^&]+)/);
    return match ? match[1] : null;
  };

  // URL fragment에서 access_token 추출 (구글용)
  const extractTokenFromUrl = (url) => {
    const match = url.match(/access_token=([^&]+)/);
    return match ? match[1] : null;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <Text style={styles.title}>로그인</Text>
        <Text style={styles.subtitle}>간편하게 로그인하세요</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#222" />
            <Text style={styles.loadingText}>로그인 중...</Text>
          </View>
        ) : (
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, styles.kakao]}
              onPress={handleKakaoLogin}
            >
              <Text style={[styles.socialText, styles.kakaoText]}>
                카카오로 시작하기
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.naver]}
              onPress={handleNaverLogin}
            >
              <Text style={styles.socialText}>네이버로 시작하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.google]}
              onPress={handleGoogleLogin}
            >
              <Text style={styles.socialText}>구글로 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.skipText}>둘러보기</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1c1c1e',
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 48,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8e8e93',
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  socialText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  kakaoText: {
    color: '#191919',
  },
  naver: {
    backgroundColor: '#03C75A',
  },
  google: {
    backgroundColor: '#4285F4',
  },
  skipButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: '#8e8e93',
    textDecorationLine: 'underline',
  },
});
