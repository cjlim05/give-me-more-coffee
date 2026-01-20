import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../components/Header';
import { API_BASE_URL } from '../../config/oauth';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

export default function CategoryScreen() {
  const router = useRouter();
  const { continent, nationality, process } = useLocalSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const title = continent || nationality || process || '카테고리';

  useEffect(() => {
    setLoading(true);

    let url = '';
    if (continent) {
      url = `${API_BASE_URL}/api/products/filter/continent?value=${encodeURIComponent(continent)}`;
    } else if (nationality) {
      url = `${API_BASE_URL}/api/products/filter/nationality?value=${encodeURIComponent(nationality)}`;
    } else if (process) {
      url = `${API_BASE_URL}/api/products/filter/type?value=${encodeURIComponent(process)}`;
    }

    if (url) {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setProducts(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [continent, nationality, process]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({
          pathname: '/product/coffeedetail',
          params: { productId: item.productId },
        })
      }
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.thumbnailImg }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.productName}
        </Text>
        <Text style={styles.productPrice}>
          {item.basePrice.toLocaleString()}원
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerBackTitle: '뒤로가기',
        }}
      />
      <Header />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>{title}</Text>
          <Text style={styles.countText}>{products.length}개</Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>상품이 없습니다</Text>
            <Text style={styles.emptyDesc}>다른 카테고리를 확인해보세요</Text>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => router.push('/home')}
              activeOpacity={0.8}
            >
              <Text style={styles.homeBtnText}>홈으로</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.productId.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
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
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
    letterSpacing: -0.5,
  },
  countText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 빈 상태
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
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
  homeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
  },
  homeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // 상품 목록
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  productCard: {
    width: CARD_WIDTH,
  },
  productImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
    marginBottom: 10,
  },
  productInfo: {
    paddingHorizontal: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1c1e',
    lineHeight: 18,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c1e',
  },
});
