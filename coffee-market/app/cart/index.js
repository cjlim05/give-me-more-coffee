import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/oauth';

export default function CartScreen() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('accessToken');

    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    fetch(`${API_BASE_URL}/api/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          throw new Error('인증 만료');
        }
        return res.json();
      })
      .then(data => {
        setCartItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        if (err.message === '인증 만료') {
          setIsLoggedIn(false);
          AsyncStorage.removeItem('accessToken');
        }
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    const token = await AsyncStorage.getItem('accessToken');

    fetch(`${API_BASE_URL}/api/cart/${cartItemId}?quantity=${newQuantity}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(() => {
        setCartItems(prev =>
          prev.map(item =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  quantity: newQuantity,
                  totalPrice: (item.basePrice + item.extraPrice) * newQuantity,
                }
              : item
          )
        );
      })
      .catch(err => console.error(err));
  };

  const removeItem = (cartItemId) => {
    Alert.alert(
      '상품 삭제',
      '장바구니에서 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('accessToken');

            fetch(`${API_BASE_URL}/api/cart/${cartItemId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            })
              .then(() => {
                setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
              })
              .catch(err => console.error(err));
          },
        },
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getTotalCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('알림', '장바구니가 비어있습니다.');
      return;
    }
    router.push('/order/checkout');
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/product/coffeedetail',
          params: { productId: item.productId }
        })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.thumbnailImg }} style={styles.itemImage} />
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
            <Text style={styles.itemOption}>{item.optionValue}</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeItem(item.cartItemId)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.removeIcon}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.quantityBox}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.cartItemId, item.quantity - 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyNum}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.itemPrice}>
            {item.totalPrice.toLocaleString()}원
          </Text>
        </View>
      </View>
    </View>
  );

  // 로그인 안 된 경우
  if (!loading && !isLoggedIn) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Text style={styles.pageTitle}>장바구니</Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔐</Text>
            <Text style={styles.emptyTitle}>로그인이 필요합니다</Text>
            <Text style={styles.emptyDesc}>장바구니를 이용하려면 로그인해주세요</Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.shopBtnText}>로그인하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        <Text style={styles.pageTitle}>장바구니</Text>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>장바구니가 비어있습니다</Text>
            <Text style={styles.emptyDesc}>원하는 상품을 담아보세요</Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => router.push('/home')}
              activeOpacity={0.8}
            >
              <Text style={styles.shopBtnText}>쇼핑하러 가기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.cartItemId.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* 하단 결제 바 */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>총 {getTotalCount()}개 상품</Text>
              <Text style={styles.summaryPrice}>
                {getTotalPrice().toLocaleString()}
                <Text style={styles.summaryUnit}>원</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutBtnText}>결제하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export const unstable_settings = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    letterSpacing: -0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 빈 장바구니 / 로그인 필요
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 24,
  },
  shopBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
  },
  shopBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // 장바구니 목록
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 160,
  },
  separator: {
    height: 1,
    backgroundColor: '#f5f5f7',
    marginVertical: 16,
  },
  cartItem: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    lineHeight: 20,
    marginBottom: 4,
  },
  itemOption: {
    fontSize: 13,
    color: '#8e8e93',
  },
  removeIcon: {
    fontSize: 24,
    color: '#c7c7cc',
    fontWeight: '300',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    padding: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  qtyNum: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    minWidth: 32,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1e',
  },

  // 하단 바
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f7',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 4,
  },
  summaryPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1c1e',
    letterSpacing: -0.5,
  },
  summaryUnit: {
    fontSize: 15,
    fontWeight: '500',
  },
  checkoutBtn: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
