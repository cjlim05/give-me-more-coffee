import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function SignupScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: '회원가입',
          headerBackTitle: '로그인',
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}>회원가입</Text>

        {/* 이름 */}
        <TextInput
          style={styles.input}
          placeholder="이름"
          autoCapitalize="none"
        />

        {/* 이메일 */}
        <TextInput
          style={styles.input}
          placeholder="이메일"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* 인증번호 전송 */}
        <TouchableOpacity style={styles.subButton}>
          <Text style={styles.subButtonText}>인증번호 전송</Text>
        </TouchableOpacity>

        {/* ✅ 인증번호 입력 + 확인 (한 줄) */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="인증번호 입력"
            keyboardType="number-pad"
          />

          <TouchableOpacity style={styles.codeButton}>
            <Text style={styles.subButtonText}>확인</Text>
          </TouchableOpacity>
        </View>

        {/* 비밀번호 */}
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          secureTextEntry
        />

        {/* 회원가입 */}
        <TouchableOpacity style={styles.signupButton}>
          <Text style={styles.signupButtonText}>회원가입</Text>
        </TouchableOpacity>

        {/* 로그인 이동 */}
        <TouchableOpacity onPress={() => router.replace('/login/login')}>
          <Text style={styles.backText}>로그인으로 돌아가기</Text>
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },

  /* 인증번호 전송 버튼 */
  subButton: {
    backgroundColor: '#666',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  subButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },

  /* ✅ row 스타일 */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  codeInput: {
    flex: 1,
    marginBottom: 0,
  },
  codeButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  signupButton: {
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
});
