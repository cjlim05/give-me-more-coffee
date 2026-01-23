import React, { useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/oauth';

export default function WriteInquiryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const isEdit = !!params.inquiryId;
  const [title, setTitle] = useState(params.title || '');
  const [content, setContent] = useState(params.content || '');
  const [isSecret, setIsSecret] = useState(params.isSecret === 'true' || false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('알림', '문의 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');

      const url = isEdit
        ? `${API_BASE_URL}/api/inquiries/${params.inquiryId}`
        : `${API_BASE_URL}/api/inquiries`;

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(params.productId),
          title: title.trim() || '상품 문의',
          content: content.trim(),
          isSecret,
        }),
      });

      if (response.ok) {
        Alert.alert('완료', isEdit ? '문의가 수정되었습니다.' : '문의가 등록되었습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } else {
        const error = await response.text();
        Alert.alert('오류', error || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('문의 저장 에러:', error);
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: isEdit ? '문의 수정' : '상품 문의',
          headerBackTitle: '취소',
          headerRight: () => (
            <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="#007aff" />
              ) : (
                <Text style={styles.submitBtn}>완료</Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 상품 정보 */}
        {params.productName && (
          <View style={styles.productInfo}>
            <Text style={styles.productLabel}>문의 상품</Text>
            <Text style={styles.productName}>{params.productName}</Text>
          </View>
        )}

        {/* 제목 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제목</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="문의 제목을 입력해주세요 (선택)"
            maxLength={100}
          />
        </View>

        {/* 문의 내용 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의 내용</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="문의하실 내용을 입력해주세요"
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>
        </View>

        {/* 비밀글 설정 */}
        <View style={styles.secretSection}>
          <View style={styles.secretLeft}>
            <Text style={styles.secretTitle}>비밀글로 작성</Text>
            <Text style={styles.secretDesc}>다른 사용자에게 문의 내용이 보이지 않습니다</Text>
          </View>
          <Switch
            value={isSecret}
            onValueChange={setIsSecret}
            trackColor={{ false: '#e5e5ea', true: '#34c759' }}
            thumbColor="#fff"
          />
        </View>

        {/* 안내 문구 */}
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>문의 안내</Text>
          <Text style={styles.noticeText}>• 답변은 영업일 기준 1-2일 내에 등록됩니다.</Text>
          <Text style={styles.noticeText}>• 주문/배송 관련 문의는 마이페이지에서 확인해주세요.</Text>
          <Text style={styles.noticeText}>• 욕설, 비방 등 부적절한 내용은 삭제될 수 있습니다.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  submitBtn: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '600',
  },

  productInfo: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  productLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
  },

  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 12,
  },

  titleInput: {
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1c1c1e',
  },

  contentInput: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1c1c1e',
    minHeight: 180,
  },
  charCount: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'right',
    marginTop: 8,
  },

  secretSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  secretLeft: {
    flex: 1,
  },
  secretTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  secretDesc: {
    fontSize: 13,
    color: '#8e8e93',
  },

  notice: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 10,
  },
  noticeText: {
    fontSize: 13,
    color: '#8e8e93',
    lineHeight: 20,
  },
});
