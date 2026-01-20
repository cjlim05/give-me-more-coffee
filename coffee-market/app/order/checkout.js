import React, { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/oauth';

export default function CheckoutScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userPoint, setUserPoint] = useState(0);
  const [usePoint, setUsePoint] = useState(0);
  const [memo, setMemo] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login/login');
        return;
      }

      // 병렬로 데이터 조회
      const [cartRes, addressRes, userRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        AsyncStorage.getItem('user'),
      ]);

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (cartData.length === 0) {
          Alert.alert('알림', '장바구니가 비어있습니다.', [
            { text: '확인', onPress: () => router.back() },
          ]);
          return;
        }
        setCartItems(cartData);
      }

      if (addressRes.ok) {
        const addressData = await addressRes.json();
        setAddresses(addressData);
        // 기본 배송지 선택
        const defaultAddr = addressData.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (addressData.length > 0) {
          setSelectedAddress(addressData[0]);
        }
      }

      if (userRes) {
        const userData = JSON.parse(userRes);
        setUserPoint(userData.point || 0);
      }
    } catch (error) {
      console.error('데이터 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getFinalPrice = () => {
    return Math.max(0, getTotalPrice() - usePoint);
  };

  const getEarnedPoint = () => {
    return Math.floor(getFinalPrice() * 0.01);
  };

  const handleUseAllPoint = () => {
    const maxUse = Math.min(userPoint, getTotalPrice());
    setUsePoint(maxUse);
  };

  const handlePointChange = (text) => {
    const num = parseInt(text) || 0;
    const maxUse = Math.min(userPoint, getTotalPrice());
    setUsePoint(Math.min(num, maxUse));
  };

  const handleSubmit = async () => {
    if (!selectedAddress) {
      Alert.alert('알림', '배송지를 선택해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressId: selectedAddress.addressId,
          usePoint: usePoint,
          memo: memo,
        }),
      });

      if (response.ok) {
        const orderData = await response.json();

        // 유저 포인트 업데이트
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.point = user.point - usePoint;
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }

        Alert.alert('주문 완료', '주문이 완료되었습니다.', [
          {
            text: '주문 상세 보기',
            onPress: () => router.replace(`/user/orders/${orderData.orderId}`),
          },
        ]);
      } else {
        const error = await response.text();
        Alert.alert('오류', error || '주문에 실패했습니다.');
      }
    } catch (error) {
      console.error('주문 에러:', error);
      Alert.alert('오류', '주문 처리 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '주문/결제',
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
          headerTitle: '주문/결제',
          headerBackTitle: '뒤로',
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 배송지 선택 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>배송지</Text>
            <TouchableOpacity onPress={() => router.push('/user/addresses')}>
              <Text style={styles.changeBtn}>변경</Text>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressName}>{selectedAddress.name}</Text>
                {selectedAddress.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>기본</Text>
                  </View>
                )}
              </View>
              <Text style={styles.recipient}>{selectedAddress.recipient}</Text>
              <Text style={styles.phone}>{selectedAddress.phone}</Text>
              <Text style={styles.address}>
                [{selectedAddress.zipcode}] {selectedAddress.address}{' '}
                {selectedAddress.addressDetail}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addAddressBtn}
              onPress={() => router.push('/user/addresses')}
            >
              <Text style={styles.addAddressText}>+ 배송지 추가</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 주문 상품 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주문 상품</Text>
          {cartItems.map((item) => (
            <View key={item.cartItemId} style={styles.itemCard}>
              <Image source={{ uri: item.thumbnailImg }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text style={styles.itemOption}>{item.optionValue}</Text>
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemQuantity}>{item.quantity}개</Text>
                  <Text style={styles.itemPrice}>
                    {item.totalPrice?.toLocaleString()}원
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 포인트 사용 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>포인트 사용</Text>
          <View style={styles.pointRow}>
            <Text style={styles.pointLabel}>보유 포인트</Text>
            <Text style={styles.pointValue}>{userPoint?.toLocaleString()}P</Text>
          </View>
          <View style={styles.pointInputRow}>
            <TextInput
              style={styles.pointInput}
              value={usePoint.toString()}
              onChangeText={handlePointChange}
              keyboardType="number-pad"
              placeholder="0"
            />
            <Text style={styles.pointUnit}>P</Text>
            <TouchableOpacity style={styles.useAllBtn} onPress={handleUseAllPoint}>
              <Text style={styles.useAllText}>전액사용</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 배송 메모 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>배송 메모</Text>
          <TextInput
            style={styles.memoInput}
            value={memo}
            onChangeText={setMemo}
            placeholder="배송 시 요청사항을 입력해주세요"
            multiline
          />
        </View>

        {/* 결제 금액 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 금액</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>상품금액</Text>
            <Text style={styles.priceValue}>{getTotalPrice()?.toLocaleString()}원</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>배송비</Text>
            <Text style={styles.priceValue}>무료</Text>
          </View>
          {usePoint > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>포인트 사용</Text>
              <Text style={[styles.priceValue, styles.discount]}>
                -{usePoint?.toLocaleString()}P
              </Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>총 결제금액</Text>
            <Text style={styles.totalValue}>{getFinalPrice()?.toLocaleString()}원</Text>
          </View>
          <View style={styles.earnRow}>
            <Text style={styles.earnText}>
              적립 예정 포인트: +{getEarnedPoint()?.toLocaleString()}P
            </Text>
          </View>
        </View>

        {/* 결제 수단 안내 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 수단</Text>
          <View style={styles.paymentNotice}>
            <Text style={styles.paymentNoticeText}>
              결제 기능은 준비 중입니다.{'\n'}
              주문하기 버튼을 누르면 주문이 생성됩니다.
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 하단 결제 버튼 */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>총 결제금액</Text>
          <Text style={styles.bottomPrice}>{getFinalPrice()?.toLocaleString()}원</Text>
        </View>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>주문하기</Text>
          )}
        </TouchableOpacity>
      </View>
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

  // 섹션
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 12,
  },
  changeBtn: {
    fontSize: 14,
    color: '#007aff',
  },

  // 배송지
  addressCard: {
    backgroundColor: '#f5f5f7',
    padding: 16,
    borderRadius: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#007aff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  recipient: {
    fontSize: 14,
    color: '#1c1c1e',
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#636366',
    lineHeight: 18,
  },
  addAddressBtn: {
    padding: 20,
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    alignItems: 'center',
  },
  addAddressText: {
    fontSize: 14,
    color: '#007aff',
    fontWeight: '500',
  },

  // 주문 상품
  itemCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f5f5f7',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
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

  // 포인트
  pointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pointLabel: {
    fontSize: 14,
    color: '#8e8e93',
  },
  pointValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  pointInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointInput: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1c1c1e',
  },
  pointUnit: {
    fontSize: 14,
    color: '#1c1c1e',
    marginLeft: 8,
    marginRight: 12,
  },
  useAllBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
  },
  useAllText: {
    fontSize: 13,
    color: '#636366',
    fontWeight: '500',
  },

  // 배송 메모
  memoInput: {
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1c1c1e',
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // 결제 금액
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#8e8e93',
  },
  priceValue: {
    fontSize: 14,
    color: '#1c1c1e',
  },
  discount: {
    color: '#ff3b30',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  earnRow: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  earnText: {
    fontSize: 12,
    color: '#007aff',
  },

  // 결제 수단 안내
  paymentNotice: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
  },
  paymentNoticeText: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },

  // 하단 바
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f7',
  },
  bottomInfo: {},
  bottomLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 2,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  submitBtn: {
    backgroundColor: '#1c1c1e',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  submitBtnDisabled: {
    backgroundColor: '#c7c7cc',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
