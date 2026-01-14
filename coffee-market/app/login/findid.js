import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function FindIdScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  // 🔹 인증번호 발송 여부 (UI 제어용)
  const [codeSent, setCodeSent] = useState(false);

  return (
    <>
      <Stack.Screen options={{ 
        title: '아이디 찾기',
        headerBackTitle: '로그인', 
        }} />

      <View style={styles.container}>
        <Text style={styles.title}>아이디 찾기</Text>

        {/* 이름 */}
        <TextInput
          style={styles.input}
          placeholder="이름"
          value={name}
          onChangeText={setName}
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

        {/* ✅ 인증번호 발송 후에만 노출 */}
        {codeSent && (
          <>
            {/* 인증번호 입력 */}
            <TextInput
              style={styles.input}
              placeholder="인증번호 입력"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />

            {/* 인증번호 확인 */}
            <TouchableOpacity style={styles.subButton}>
              <Text style={styles.subButtonText}>인증번호 확인</Text>
            </TouchableOpacity>
          </>
        )}

        {/* 아이디 메일 전송 */}
        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.mainButtonText}>
            아이디 이메일로 보내기
          </Text>
        </TouchableOpacity>

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
