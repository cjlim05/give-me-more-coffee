import React from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <Text style={styles.title}>로그인</Text>

        <TextInput
          style={styles.input}
          placeholder="아이디"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <TouchableOpacity onPress={() => router.push('/login/findid')}>
            <Text style={styles.linkText}>아이디 찾기</Text>
          </TouchableOpacity>

          <Text style={styles.divider}>|</Text>

          <TouchableOpacity onPress={() => router.push('/login/findpassword')}>
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </TouchableOpacity>

          <Text style={styles.divider}>|</Text>

          <TouchableOpacity onPress={() => router.push('/login/signup')}>
            <Text style={styles.linkText}>회원가입</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.socialButton, styles.naver]}>
            <Text style={styles.socialText}>네이버 간편로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.kakao]}>
            <Text style={[styles.socialText, styles.kakaoText]}>카카오 간편로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.google]}>
            <Text style={styles.socialText}>구글 간편로그인</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginHorizontal: 8,
    color: '#ccc',
  },
  socialContainer: {
    marginTop: 40,
  },
  socialButton: {
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  socialText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  naver: {
    backgroundColor: '#03C75A',
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  kakaoText: {
    color: '#000',
  },
  google: {
    backgroundColor: '#4285F4',
  },
});
