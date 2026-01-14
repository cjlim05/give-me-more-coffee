import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CoffeeDetail() {
  const { name, price, image } = useLocalSearchParams();

  const [option, setOption] = useState('200g');
  const [count, setCount] = useState(1);

  return (
    <View style={styles.container}>
      {/* 🔹 상품 이미지 */}
      <Image source={{ uri: image }} style={styles.image} />

      {/* 🔹 상품 정보 */}
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.price}>{price}</Text>

      {/* 🔹 옵션 선택 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>용량 선택</Text>
        <View style={styles.optionRow}>
          {['200g', '500g', '1kg'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.optionButton,
                option === item && styles.optionActive,
              ]}
              onPress={() => setOption(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  option === item && styles.optionTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 🔹 수량 선택 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>수량</Text>
        <View style={styles.countRow}>
          <TouchableOpacity
            style={styles.countButton}
            onPress={() => count > 1 && setCount(count - 1)}
          >
            <Text>-</Text>
          </TouchableOpacity>

          <Text style={styles.countText}>{count}</Text>

          <TouchableOpacity
            style={styles.countButton}
            onPress={() => setCount(count + 1)}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 하단 구매 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartText}>장바구니 담기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  image: {
    width: '100%',
    height: 320,
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 16,
  },

  price: {
    fontSize: 18,
    color: '#333',
    paddingHorizontal: 16,
    marginTop: 8,
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },

  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  optionActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },

  optionText: {
    fontSize: 14,
  },

  optionTextActive: {
    color: '#fff',
  },

  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  countButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    marginHorizontal: 16,
    fontSize: 16,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },

  cartButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },

  cartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
