import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function FindPasswordScreen() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');

  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [code, setCode] = useState('');

  return (
    <>
      <Stack.Screen options={{ title: '비밀번호 찾기', headerBackTitle: '로그인' }} />

      <View style={styles.container}>
        <Text style={styles.title}>비밀번호 찾기</Text>

        {/* 아이디 */}
        <TextInput
          style={styles.input}
          placeholder="아이디"
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
        />

        {/* 이메일 */}
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* 인증번호 보내기 */}
        <TouchableOpacity
          style={styles.subButton}
          onPress={() => setCodeSent(true)}
        >
          <Text style={styles.subButtonText}>인증번호 보내기</Text>
        </TouchableOpacity>

        {/* ✅ 인증번호 발송 후 노출 */}
        {codeSent && (
          <>
            <TextInput
              style={styles.input}
              placeholder="인증번호 입력"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={styles.subButton}
              onPress={() => setCodeVerified(true)}
            >
              <Text style={styles.subButtonText}>인증하기</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ✅ 인증 완료 후 노출 */}
        {codeVerified && (
          <>
            <TouchableOpacity style={styles.mainButton}>
              <Text style={styles.mainButtonText}>
                임시 비밀번호 발급
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* 로그인 이동 */}
        <TouchableOpacity onPress={() => router.push('/login/login')}>
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
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  subButton: {
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  subButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  mainButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backText: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
});
