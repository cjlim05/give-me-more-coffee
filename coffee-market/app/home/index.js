import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../components/Header';
import { API_BASE_URL } from '../../config/oauth';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 140;

const banners = [
  { id: 1, uri: 'https://picsum.photos/800/400?1' },
  { id: 2, uri: 'https://picsum.photos/800/400?2' },
  { id: 3, uri: 'https://picsum.photos/800/400?3' },
];

export default function HomeScreen() {
  const router = useRouter();

  const [latestProducts, setLatestProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/latest`)
      .then(res => res.json())
      .then(data => setLatestProducts(data))
      .catch(err => console.error(err));

    fetch(`${API_BASE_URL}/api/products/best`)
      .then(res => res.json())
      .then(data => setBestProducts(data))
      .catch(err => console.error(err));
  }, []);

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
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 배너 */}
        <View style={styles.bannerContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentBanner(index);
            }}
            scrollEventThrottle={16}
          >
            {banners.map((banner) => (
              <Image
                key={banner.id}
                source={{ uri: banner.uri }}
                style={styles.bannerImage}
              />
            ))}
          </ScrollView>

          {/* 배너 인디케이터 */}
          <View style={styles.bannerIndicator}>
            <View style={styles.indicatorBadge}>
              <Text style={styles.indicatorText}>
                {currentBanner + 1} / {banners.length}
              </Text>
            </View>
          </View>
        </View>

        {/* 최근 입고 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 입고된 원두</Text>
            <TouchableOpacity activeOpacity={0.6}>
              <Text style={styles.sectionMore}>더보기</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={latestProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.productId.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* 베스트 셀렉션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>베스트 셀렉션</Text>
            <TouchableOpacity activeOpacity={0.6}>
              <Text style={styles.sectionMore}>더보기</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={bestProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.productId.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 20,
  },

  // 배너
  bannerContainer: {
    position: 'relative',
  },
  bannerImage: {
    width: width,
    height: 200,
    backgroundColor: '#f5f5f7',
  },
  bannerIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 16,
  },
  indicatorBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // 섹션
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    letterSpacing: -0.5,
  },
  sectionMore: {
    fontSize: 14,
    color: '#8e8e93',
  },

  // 상품 목록
  productList: {
    paddingHorizontal: 20,
    gap: 12,
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
