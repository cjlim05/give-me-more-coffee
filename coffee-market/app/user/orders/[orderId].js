import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../config/oauth';

const ORDER_STATUS = {
  PENDING: { label: '결제대기', color: '#ff9500' },
  PAID: { label: '결제완료', color: '#34c759' },
  PREPARING: { label: '상품준비중', color: '#007aff' },
  SHIPPED: { label: '배송중', color: '#5856d6' },
  DELIVERED: { label: '배송완료', color: '#8e8e93' },
  CANCELLED: { label: '주문취소', color: '#ff3b30' },
};

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('주문 상세 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '주문 상세',
            headerBackTitle: '뒤로',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1c1c1e" />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '주문 상세',
            headerBackTitle: '뒤로',
          }}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>주문 정보를 찾을 수 없습니다.</Text>
        </View>
      </View>
    );
  }

  const status = ORDER_STATUS[order.status] || ORDER_STATUS.PENDING;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: '주문 상세',
          headerBackTitle: '뒤로',
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 주문 상태 */}
        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.label}</Text>
            </View>
            <Text style={styles.orderNumber}>주문번호: {order.orderId}</Text>
          </View>
          <Text style={styles.orderDate}>주문일시: {formatDate(order.createdAt)}</Text>
        </View>

        {/* 배송 진행 상태 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>배송 진행 상태</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <View style={[styles.progressDot, order.paidAt && styles.progressDotActive]} />
              <Text style={styles.progressLabel}>결제완료</Text>
              <Text style={styles.progressDate}>{formatDate(order.paidAt)}</Text>
            </View>
            <View style={[styles.progressLine, order.shippedAt && styles.progressLineActive]} />
            <View style={styles.progressItem}>
              <View style={[styles.progressDot, order.shippedAt && styles.progressDotActive]} />
              <Text style={styles.progressLabel}>배송시작</Text>
              <Text style={styles.progressDate}>{formatDate(order.shippedAt)}</Text>
            </View>
            <View style={[styles.progressLine, order.deliveredAt && styles.progressLineActive]} />
            <View style={styles.progressItem}>
              <View style={[styles.progressDot, order.deliveredAt && styles.progressDotActive]} />
              <Text style={styles.progressLabel}>배송완료</Text>
              <Text style={styles.progressDate}>{formatDate(order.deliveredAt)}</Text>
            </View>
          </View>
        </View>

        {/* 주문 상품 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주문 상품</Text>
          {order.items?.map((item, index) => (
            <TouchableOpacity
              key={item.orderItemId}
              style={styles.itemCard}
              onPress={() => router.push(`/product/${item.productId}`)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: item.thumbnailImg }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                <Text style={styles.itemOption}>{item.optionValue}</Text>
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemQuantity}>{item.quantity}개</Text>
                  <Text style={styles.itemPrice}>{item.price?.toLocaleString()}원</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 배송 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>배송 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>받는 분</Text>
            <Text style={styles.infoValue}>{order.recipient}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>연락처</Text>
            <Text style={styles.infoValue}>{order.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>주소</Text>
            <Text style={styles.infoValue}>
              [{order.zipcode}] {order.address} {order.addressDetail}
            </Text>
          </View>
          {order.memo && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>배송메모</Text>
              <Text style={styles.infoValue}>{order.memo}</Text>
            </View>
          )}
        </View>

        {/* 결제 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>상품금액</Text>
            <Text style={styles.infoValue}>{order.totalPrice?.toLocaleString()}원</Text>
          </View>
          {order.usedPoint > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>포인트 사용</Text>
              <Text style={[styles.infoValue, styles.discount]}>-{order.usedPoint?.toLocaleString()}P</Text>
            </View>
          )}
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>최종 결제금액</Text>
            <Text style={styles.totalValue}>{order.finalPrice?.toLocaleString()}원</Text>
          </View>
          {order.earnedPoint > 0 && (
            <View style={styles.earnedPointRow}>
              <Text style={styles.earnedPointText}>+{order.earnedPoint?.toLocaleString()}P 적립 예정</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e93',
  },

  // 섹션
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 16,
  },

  // 주문 상태
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  orderNumber: {
    fontSize: 13,
    color: '#8e8e93',
  },
  orderDate: {
    fontSize: 13,
    color: '#8e8e93',
  },

  // 배송 진행 상태
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  progressItem: {
    alignItems: 'center',
    width: 80,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e5ea',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#34c759',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e5e5ea',
    marginTop: 9,
  },
  progressLineActive: {
    backgroundColor: '#34c759',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  progressDate: {
    fontSize: 10,
    color: '#8e8e93',
  },

  // 주문 상품
  itemCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    marginBottom: 8,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#e5e5ea',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  itemOption: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 8,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#8e8e93',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
  },

  // 정보 행
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: '#8e8e93',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#1c1c1e',
  },
  discount: {
    color: '#ff3b30',
  },

  // 결제 총액
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1c1c1e',
  },
  totalLabel: {
    width: 80,
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  totalValue: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
    textAlign: 'right',
  },
  earnedPointRow: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  earnedPointText: {
    fontSize: 13,
    color: '#007aff',
    fontWeight: '500',
  },
});
