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

const { width } = Dimensions.get('window');

const banners = [
  { id: 1, uri: 'https://picsum.photos/800/400?1' },
  { id: 2, uri: 'https://picsum.photos/800/400?2' },
  { id: 3, uri: 'https://picsum.photos/800/400?3' },
];

export default function HomeScreen() {
  const router = useRouter();

  const [latestProducts, setLatestProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);

  useEffect(() => {
    fetch('http://YOUR_SERVER_IP:8080/api/products/latest')
      .then(res => res.json())
      .then(data => setLatestProducts(data));

    fetch('http://YOUR_SERVER_IP:8080/api/products/best')
      .then(res => res.json())
      .then(data => setBestProducts(data));
  }, []);

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({
          pathname: '/product/coffeedetail',
          params: {
            productId: item.productId,   // ⭐ DB PK 전달
          },
        })
      }
    >
      <Image source={{ uri: item.thumbnailImg }} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={1}>
        {item.productName}
      </Text>
      <Text style={styles.productPrice}>
        {item.basePrice.toLocaleString()}원
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
        >
          {banners.map((banner) => (
            <Image key={banner.id} source={{ uri: banner.uri }} style={styles.banner} />
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 입고된 원두</Text>
          <FlatList
            data={latestProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.productId.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>베스트 셀렉션</Text>
          <FlatList
            data={bestProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.productId.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export const unstable_settings = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  carousel: { width: '100%', height: 200 },
  banner: { width, height: 200 },
  section: { marginTop: 24, paddingLeft: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  productCard: { width: 120, marginRight: 12 },
  productImage: { width: 120, height: 120, borderRadius: 8, marginBottom: 6 },
  productName: { fontSize: 14, fontWeight: '600' },
  productPrice: { fontSize: 13, color: '#666' },
});
