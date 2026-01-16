import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const MENU_WIDTH = WINDOW_WIDTH * 0.8;

/* ================== 카테고리 데이터 ================== */

const NATIONALITIES_BY_CONTINENT = {
  아프리카: ['에티오피아', '케냐', '탄자니아', '르완다'],
  중남미: [
    '브라질',
    '콜롬비아',
    '과테말라',
    '코스타리카',
    '온두라스',
    '멕시코',
    '엘살바도르',
    '파나마',
    '페루',
    '니카라과',
    '볼리비아',
  ],
  아시아: ['인도네시아', '베트남', '인도'],
};

const PROCESS_TYPES = [
  '워시드',
  '내추럴',
  '허니',
  '애너로빅',
];

/* ==================================================== */

export default function Header() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [originOpen, setOriginOpen] = useState(false);
  const [openContinent, setOpenContinent] = useState(null);
  const [processOpen, setProcessOpen] = useState(false);

  const slideX = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: menuOpen ? 0 : -MENU_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: menuOpen ? 0.5 : 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  }, [menuOpen]);

  const goCategory = (params) => {
    router.push({ pathname: '/category', params });
    setMenuOpen(false);
    setCategoryOpen(false);
    setOriginOpen(false);
    setProcessOpen(false);
    setOpenContinent(null);
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.row}>
            {/* 왼쪽 */}
            <View style={styles.left}>
              <TouchableOpacity onPress={() => setMenuOpen(v => !v)}>
                <Text style={{ fontSize: 24 }}>{menuOpen ? '✕' : '☰'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setSearchOpen(v => !v)}>
                <Text style={styles.icon}>🔎</Text>
              </TouchableOpacity>
            </View>

            {/* 중앙 */}
            <View style={styles.center}>
              {!searchOpen && (
                <TouchableOpacity onPress={() => router.push('/')}>
                  <Text style={styles.logo}>CHANJU</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 오른쪽 */}
            <View style={styles.right}>
              <TouchableOpacity>
                <Text style={styles.icon}>🛒</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/user')}>
                <Text style={styles.icon}>👤</Text>
              </TouchableOpacity>
            </View>
          </View>

          {searchOpen && (
            <View style={styles.searchRow}>
              <TextInput
                placeholder="상품 검색"
                style={styles.searchInput}
                placeholderTextColor="#666"
              />
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Overlay */}
      <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
        <Animated.View
          pointerEvents={menuOpen ? 'auto' : 'none'}
          style={[styles.overlay, { opacity: overlayOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* 메뉴 패널 */}
      <Animated.View
        pointerEvents={menuOpen ? 'auto' : 'none'}
        style={[
          styles.menuPanel,
          { transform: [{ translateX: slideX }], width: MENU_WIDTH, height: WINDOW_HEIGHT },
        ]}
      >
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>메뉴</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/')}>
            <Text>홈</Text>
          </TouchableOpacity>

          {/* ================= 카테고리 ================= */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setCategoryOpen(v => !v)}
          >
            <Text>카테고리 {categoryOpen ? '-' : '+'}</Text>
          </TouchableOpacity>

          {categoryOpen && (
            <View style={styles.subMenu}>
              {/* 원산지 */}
              <TouchableOpacity onPress={() => setOriginOpen(v => !v)}>
                <Text style={styles.subTitle}>
                  원산지 {originOpen ? '-' : '+'}
                </Text>
              </TouchableOpacity>

              {originOpen &&
                Object.entries(NATIONALITIES_BY_CONTINENT).map(
                  ([continent, countries]) => (
                    <View key={continent}>
                      <View style={styles.continentRow}>
                        <TouchableOpacity
                          style={styles.continentName}
                          onPress={() => goCategory({ continent })}
                        >
                          <Text style={styles.continentText}>{continent}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            setOpenContinent(openContinent === continent ? null : continent)
                          }
                        >
                          <Text style={styles.expandBtn}>
                            {openContinent === continent ? '−' : '+'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {openContinent === continent &&
                        countries.map((country) => (
                          <TouchableOpacity
                            key={country}
                            style={styles.country}
                            onPress={() => goCategory({ nationality: country })}
                          >
                            <Text>{country}</Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  )
                )}

              {/* 가공방식 */}
              <TouchableOpacity
                onPress={() => setProcessOpen(v => !v)}
                style={{ marginTop: 12 }}
              >
                <Text style={styles.subTitle}>
                  가공 방식 {processOpen ? '-' : '+'}
                </Text>
              </TouchableOpacity>

              {processOpen &&
                PROCESS_TYPES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={styles.country}
                    onPress={() => goCategory({ process: p })}
                  >
                    <Text>{p}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/user')}>
            <Text>내 정보</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.closeBtn]}
            onPress={() => setMenuOpen(false)}
          >
            <Text>닫기</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

/* ================== 스타일 ================== */

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#fff' },
  container: { borderBottomWidth: 0.5, borderBottomColor: '#ddd' },

  row: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: { flexDirection: 'row', gap: 12 },
  center: { flex: 1, alignItems: 'center' },
  right: { flexDirection: 'row', gap: 12 },

  logo: { fontSize: 18, fontWeight: '700' },
  icon: { fontSize: 20 },

  searchRow: { padding: 12 },
  searchInput: {
    height: 40,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
  },

  overlay: {
    position: 'absolute',
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 50,
  },

  menuPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: '#fff',
    zIndex: 60,
  },

  menuContent: { paddingTop: 60, paddingHorizontal: 16 },
  menuTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  menuItem: { paddingVertical: 12 },

  subMenu: { paddingLeft: 12, paddingBottom: 8 },
  subTitle: { fontWeight: '600', marginVertical: 6 },

  continentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
    marginVertical: 4,
  },
  continentName: { flex: 1 },
  continentText: { fontWeight: '500' },
  expandBtn: { paddingHorizontal: 12, fontSize: 16 },
  country: { marginLeft: 20, paddingVertical: 4 },

  closeBtn: {
    marginTop: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    alignItems: 'center',
  },
});
