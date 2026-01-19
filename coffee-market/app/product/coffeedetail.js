import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function CoffeeDetail() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) return;

    fetch(`http://localhost:8080/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.options && data.options.length > 0) {
          setSelectedOption(data.options[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [productId]);

  const calculateTotalPrice = () => {
    if (!product || !selectedOption) return 0;
    return (product.basePrice + selectedOption.extraPrice) * quantity;
  };

  const handleAddToCart = async () => {
    if (!selectedOption) {
      Alert.alert('알림', '옵션을 선택해주세요.');
      return;
    }

    const token = await AsyncStorage.getItem('accessToken');

    if (!token) {
      Alert.alert('로그인 필요', '장바구니를 이용하려면 로그인이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        { text: '로그인', onPress: () => router.push('/login') },
      ]);
      return;
    }

    fetch('http://localhost:8080/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product.productId,
        optionId: selectedOption.optionId,
        quantity,
      }),
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          throw new Error('인증 만료');
        }
        return res.json();
      })
      .then(() => {
        Alert.alert('장바구니', '장바구니에 담았습니다.', [
          { text: '계속 쇼핑', style: 'cancel' },
          { text: '장바구니 보기', onPress: () => router.push('/cart') },
        ]);
      })
      .catch(err => {
        console.error(err);
        if (err.message === '인증 만료') {
          Alert.alert('로그인 필요', '다시 로그인해주세요.', [
            { text: '확인', onPress: () => router.push('/login') },
          ]);
        } else {
          Alert.alert('오류', '장바구니 담기에 실패했습니다.');
        }
      });
  };

  const handleBuyNow = async () => {
    if (!selectedOption) {
      Alert.alert('알림', '옵션을 선택해주세요.');
      return;
    }

    const token = await AsyncStorage.getItem('accessToken');

    if (!token) {
      Alert.alert('로그인 필요', '구매하려면 로그인이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        { text: '로그인', onPress: () => router.push('/login') },
      ]);
      return;
    }

    fetch('http://localhost:8080/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product.productId,
        optionId: selectedOption.optionId,
        quantity,
      }),
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          throw new Error('인증 만료');
        }
        return res.json();
      })
      .then(() => {
        router.push('/cart');
      })
      .catch(err => {
        console.error(err);
        if (err.message === '인증 만료') {
          Alert.alert('로그인 필요', '다시 로그인해주세요.', [
            { text: '확인', onPress: () => router.push('/login') },
          ]);
        } else {
          Alert.alert('오류', '처리에 실패했습니다.');
        }
      });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>상품을 찾을 수 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 썸네일 이미지 */}
        <Image
          source={{ uri: product.thumbnailImg }}
          style={styles.productImage}
        />

        {/* 상품 정보 */}
        <View style={styles.infoContainer}>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.nationality}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.type}</Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.productName}</Text>

          <Text style={styles.price}>
            {product.basePrice.toLocaleString()}
            <Text style={styles.priceUnit}>원</Text>
          </Text>
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 옵션 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>용량</Text>
          <View style={styles.optionGrid}>
            {product.options && product.options.map((opt) => (
              <TouchableOpacity
                key={opt.optionId}
                style={[
                  styles.optionCard,
                  selectedOption?.optionId === opt.optionId && styles.optionCardActive,
                ]}
                onPress={() => setSelectedOption(opt)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionValue,
                    selectedOption?.optionId === opt.optionId && styles.optionValueActive,
                  ]}
                >
                  {opt.optionValue}
                </Text>
                {opt.extraPrice > 0 && (
                  <Text
                    style={[
                      styles.optionExtra,
                      selectedOption?.optionId === opt.optionId && styles.optionExtraActive,
                    ]}
                  >
                    +{opt.extraPrice.toLocaleString()}원
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 수량 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>수량</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityBtn, quantity <= 1 && styles.quantityBtnDisabled]}
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              activeOpacity={0.7}
            >
              <Text style={[styles.quantityBtnText, quantity <= 1 && styles.quantityBtnTextDisabled]}>−</Text>
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityNum}>{quantity}</Text>
            </View>

            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => setQuantity(quantity + 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.quantityBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 상품 정보 이미지들 */}
        {product.images && product.images.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>상품 정보</Text>
              {product.images.map((img, index) => (
                <Image
                  key={img.imageId || index}
                  source={{ uri: img.imageUrl }}
                  style={styles.detailImage}
                  resizeMode="contain"
                />
              ))}
            </View>
          </>
        )}

        {/* 하단 여백 */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* 하단 고정 바 */}
      <View style={styles.bottomBar}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>총 결제금액</Text>
          <Text style={styles.totalPrice}>
            {calculateTotalPrice().toLocaleString()}
            <Text style={styles.totalPriceUnit}>원</Text>
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Text style={styles.cartBtnText}>장바구니</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyBtn}
            onPress={handleBuyNow}
            activeOpacity={0.8}
          >
            <Text style={styles.buyBtnText}>바로구매</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#8e8e93',
  },
  scrollView: {
    flex: 1,
  },

  // 썸네일 이미지
  productImage: {
    width: width,
    height: width,
    backgroundColor: '#f5f5f7',
  },

  // 상품 정보
  infoContainer: {
    padding: 20,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#636366',
    fontWeight: '500',
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1c1e',
    lineHeight: 30,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  price: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1c1c1e',
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontSize: 18,
    fontWeight: '500',
  },

  // 구분선
  divider: {
    height: 8,
    backgroundColor: '#f5f5f7',
  },

  // 섹션
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // 옵션
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    minWidth: 100,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
  },
  optionCardActive: {
    backgroundColor: '#1c1c1e',
  },
  optionValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  optionValueActive: {
    color: '#fff',
  },
  optionExtra: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 4,
  },
  optionExtraActive: {
    color: 'rgba(255,255,255,0.7)',
  },

  // 수량
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 4,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBtnDisabled: {
    backgroundColor: 'transparent',
  },
  quantityBtnText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  quantityBtnTextDisabled: {
    color: '#c7c7cc',
  },
  quantityDisplay: {
    minWidth: 50,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  quantityNum: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
  },

  // 상세 이미지
  detailImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
    marginBottom: 12,
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#8e8e93',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
    letterSpacing: -0.5,
  },
  totalPriceUnit: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cartBtn: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  buyBtn: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
