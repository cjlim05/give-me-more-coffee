import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/oauth';

const ORDER_STATUS = {
  PENDING: { label: '결제대기', color: '#ff9500' },
  PAID: { label: '결제완료', color: '#34c759' },
  PREPARING: { label: '상품준비중', color: '#007aff' },
  SHIPPED: { label: '배송중', color: '#5856d6' },
  DELIVERED: { label: '배송완료', color: '#8e8e93' },
  CANCELLED: { label: '주문취소', color: '#ff3b30' },
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('주문 내역 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderOrderItem = ({ item }) => {
    const status = ORDER_STATUS[item.status] || ORDER_STATUS.PENDING;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/user/orders/${item.orderId}`)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.orderContent}>
          {item.items && item.items.length > 0 && (
            <View style={styles.itemPreview}>
              <Image
                source={{ uri: item.items[0].thumbnailImg }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.items[0].productName}
                  {item.items.length > 1 && ` 외 ${item.items.length - 1}건`}
                </Text>
                <Text style={styles.itemOption}>
                  {item.items[0].optionValue} / {item.items[0].quantity}개
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalPrice}>
            {item.finalPrice?.toLocaleString()}원
          </Text>
          <Text style={styles.detailLink}>상세보기 →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '주문 내역',
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
          headerTitle: '주문 내역',
          headerBackTitle: '뒤로',
        }}
      />

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>주문 내역이 없습니다</Text>
          <Text style={styles.emptySubtitle}>첫 주문을 해보세요!</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.shopButtonText}>쇼핑하러 가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.orderId.toString()}
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

  // 빈 상태
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
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#1c1c1e',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // 주문 리스트
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#8e8e93',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  orderContent: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f7',
    paddingTop: 12,
  },
  itemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f5f5f7',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  itemOption: {
    fontSize: 13,
    color: '#8e8e93',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f7',
  },
  totalPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  detailLink: {
    fontSize: 14,
    color: '#007aff',
  },
});
