import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/oauth';

export default function MyReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [])
  );

  const fetchReviews = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/reviews/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('리뷰 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (reviewId) => {
    Alert.alert('삭제 확인', '이 리뷰를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              setReviews(reviews.filter((r) => r.reviewId !== reviewId));
              Alert.alert('완료', '리뷰가 삭제되었습니다.');
            }
          } catch (error) {
            console.error('리뷰 삭제 에러:', error);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <TouchableOpacity
        style={styles.productInfo}
        onPress={() =>
          router.push({
            pathname: '/product/coffeedetail',
            params: { productId: item.productId },
          })
        }
      >
        <Image source={{ uri: item.productThumbnail }} style={styles.productImage} />
        <View style={styles.productTextInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.productName}
          </Text>
          <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.reviewContent}>
        <Text style={styles.stars}>{renderStars(item.rating)}</Text>
        {item.content && <Text style={styles.contentText}>{item.content}</Text>}
      </View>

      <View style={styles.reviewActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            router.push({
              pathname: '/review/write',
              params: {
                reviewId: item.reviewId,
                productId: item.productId,
                rating: item.rating,
                content: item.content,
              },
            })
          }
        >
          <Text style={styles.actionText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item.reviewId)}
        >
          <Text style={[styles.actionText, styles.deleteText]}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '내 리뷰',
            headerBackTitle: '뒤로',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1c1c1e" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: '내 리뷰',
          headerBackTitle: '뒤로',
        }}
      />

      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>작성한 리뷰가 없습니다</Text>
          <Text style={styles.emptySubtitle}>구매한 상품의 리뷰를 남겨보세요</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.reviewId.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },

  listContent: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f5f5f7',
    marginRight: 12,
  },
  productTextInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#8e8e93',
  },
  reviewContent: {
    paddingVertical: 12,
  },
  stars: {
    fontSize: 16,
    color: '#ff9500',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#1c1c1e',
    lineHeight: 20,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f7',
    gap: 16,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 13,
    color: '#007aff',
    fontWeight: '500',
  },
  deleteText: {
    color: '#ff3b30',
  },
});
