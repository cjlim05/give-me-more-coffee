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

export default function MyInquiriesScreen() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchInquiries();
    }, [])
  );

  const fetchInquiries = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/inquiries/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      }
    } catch (error) {
      console.error('문의 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (inquiryId) => {
    Alert.alert('삭제 확인', '이 문의를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/inquiries/${inquiryId}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              setInquiries(inquiries.filter((i) => i.inquiryId !== inquiryId));
              Alert.alert('완료', '문의가 삭제되었습니다.');
            } else {
              const error = await response.text();
              Alert.alert('오류', error || '삭제에 실패했습니다.');
            }
          } catch (error) {
            console.error('문의 삭제 에러:', error);
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

  const renderInquiryItem = ({ item }) => (
    <View style={styles.inquiryCard}>
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
          <Text style={styles.inquiryDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, item.isAnswered && styles.statusBadgeAnswered]}>
          <Text style={[styles.statusText, item.isAnswered && styles.statusTextAnswered]}>
            {item.isAnswered ? '답변완료' : '답변대기'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.inquiryContent}>
        <View style={styles.titleRow}>
          {item.isSecret && <Text style={styles.secretBadge}>비밀글</Text>}
          <Text style={styles.titleText} numberOfLines={1}>
            {item.title || '문의'}
          </Text>
        </View>
        <Text style={styles.contentText} numberOfLines={2}>
          {item.content}
        </Text>
      </View>

      {/* 답변이 있는 경우 */}
      {item.isAnswered && item.answer && (
        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>답변</Text>
          <Text style={styles.answerContent}>{item.answer}</Text>
          {item.answeredAt && (
            <Text style={styles.answerDate}>{formatDate(item.answeredAt)}</Text>
          )}
        </View>
      )}

      {/* 답변 없는 경우에만 수정/삭제 가능 */}
      {!item.isAnswered && (
        <View style={styles.inquiryActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: '/inquiry/write',
                params: {
                  inquiryId: item.inquiryId,
                  productId: item.productId,
                  productName: item.productName,
                  title: item.title,
                  content: item.content,
                  isSecret: item.isSecret?.toString(),
                },
              })
            }
          >
            <Text style={styles.actionText}>수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDelete(item.inquiryId)}
          >
            <Text style={[styles.actionText, styles.deleteText]}>삭제</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '내 문의',
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
          headerTitle: '내 문의',
          headerBackTitle: '뒤로',
        }}
      />

      {inquiries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>작성한 문의가 없습니다</Text>
          <Text style={styles.emptySubtitle}>상품에 대해 궁금한 점을 문의해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={inquiries}
          renderItem={renderInquiryItem}
          keyExtractor={(item) => item.inquiryId.toString()}
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
  inquiryCard: {
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
  inquiryDate: {
    fontSize: 12,
    color: '#8e8e93',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f5f5f7',
  },
  statusBadgeAnswered: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e93',
  },
  statusTextAnswered: {
    color: '#4caf50',
  },

  inquiryContent: {
    paddingVertical: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  secretBadge: {
    fontSize: 11,
    color: '#8e8e93',
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    flex: 1,
  },
  contentText: {
    fontSize: 14,
    color: '#636366',
    lineHeight: 20,
  },

  answerBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1c1c1e',
    marginTop: 4,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 6,
  },
  answerContent: {
    fontSize: 14,
    color: '#636366',
    lineHeight: 20,
  },
  answerDate: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 8,
    textAlign: 'right',
  },

  inquiryActions: {
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
