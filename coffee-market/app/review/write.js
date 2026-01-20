import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/oauth';

export default function WriteReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const isEdit = !!params.reviewId;
  const [rating, setRating] = useState(params.rating ? parseInt(params.rating) : 5);
  const [content, setContent] = useState(params.content || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('알림', '별점을 선택해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');

      const url = isEdit
        ? `${API_BASE_URL}/api/reviews/${params.reviewId}`
        : `${API_BASE_URL}/api/reviews`;

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(params.productId),
          rating,
          content,
        }),
      });

      if (response.ok) {
        Alert.alert('완료', isEdit ? '리뷰가 수정되었습니다.' : '리뷰가 등록되었습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } else {
        const error = await response.text();
        Alert.alert('오류', error || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 저장 에러:', error);
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: isEdit ? '리뷰 수정' : '리뷰 작성',
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
        {/* 별점 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>별점</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Text style={[styles.star, star <= rating && styles.starActive]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>{rating}점</Text>
        </View>

        {/* 리뷰 내용 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>리뷰 내용</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="상품에 대한 솔직한 리뷰를 남겨주세요"
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length}/500</Text>
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

  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 16,
  },

  // 별점
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  star: {
    fontSize: 40,
    color: '#e5e5ea',
  },
  starActive: {
    color: '#ff9500',
  },
  ratingText: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },

  // 리뷰 내용
  contentInput: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1c1c1e',
    minHeight: 200,
  },
  charCount: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'right',
    marginTop: 8,
  },
});
