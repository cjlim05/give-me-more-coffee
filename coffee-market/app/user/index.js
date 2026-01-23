import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';

export default function UserScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('로그인 상태 확인 에러:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          await AsyncStorage.removeItem('user');
          setIsLoggedIn(false);
          setUser(null);
          Alert.alert('완료', '로그아웃 되었습니다.');
        },
      },
    ]);
  };

  const menuItems = [
    {
      id: 'orders',
      icon: '📦',
      title: '주문 내역',
      subtitle: '주문 및 배송 조회',
      onPress: () => router.push('/user/orders'),
    },
    {
      id: 'addresses',
      icon: '📍',
      title: '배송지 관리',
      subtitle: '배송지 추가/수정',
      onPress: () => router.push('/user/addresses'),
    },
    {
      id: 'points',
      icon: '💰',
      title: '포인트',
      subtitle: user ? `${user.point?.toLocaleString() || 0}P 보유` : '0P 보유',
      onPress: () => router.push('/user/points'),
    },
    {
      id: 'reviews',
      icon: '📝',
      title: '내 리뷰',
      subtitle: '작성한 리뷰 관리',
      onPress: () => router.push('/user/reviews'),
    },
    {
      id: 'inquiries',
      icon: '💬',
      title: '내 문의',
      subtitle: '상품 문의 내역',
      onPress: () => router.push('/user/inquiries'),
    },
  ];

  // 로그인 안 된 경우
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header />

        <View style={styles.notLoggedIn}>
          <Text style={styles.notLoggedInIcon}>👤</Text>
          <Text style={styles.notLoggedInTitle}>로그인이 필요합니다</Text>
          <Text style={styles.notLoggedInSubtitle}>
            로그인하고 다양한 서비스를 이용해보세요
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login/login')}
          >
            <Text style={styles.loginButtonText}>로그인하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 로그인 된 경우
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 프로필 섹션 */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {user?.name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || '사용자'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push('/user/profile')}
          >
            <Text style={styles.editProfileText}>프로필 수정</Text>
          </TouchableOpacity>
        </View>

        {/* 포인트 배너 */}
        <View style={styles.pointBanner}>
          <View style={styles.pointInfo}>
            <Text style={styles.pointLabel}>보유 포인트</Text>
            <Text style={styles.pointValue}>
              {user?.point?.toLocaleString() || 0}
              <Text style={styles.pointUnit}>P</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/user/points')}>
            <Text style={styles.pointHistory}>내역 보기 →</Text>
          </TouchableOpacity>
        </View>

        {/* 메뉴 리스트 */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 기타 메뉴 */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Text style={styles.menuIcon}>📞</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>고객센터</Text>
              <Text style={styles.menuSubtitle}>문의 및 도움말</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>설정</Text>
              <Text style={styles.menuSubtitle}>알림, 개인정보</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },

  // 로그인 안됨
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  notLoggedInTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  notLoggedInSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#1c1c1e',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // 프로필 섹션
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8e8e93',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#8e8e93',
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
  },
  editProfileText: {
    fontSize: 13,
    color: '#636366',
    fontWeight: '500',
  },

  // 포인트 배너
  pointBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    padding: 20,
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
  },
  pointInfo: {},
  pointLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  pointValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  pointUnit: {
    fontSize: 18,
    fontWeight: '500',
  },
  pointHistory: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },

  // 메뉴 섹션
  menuSection: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
  },
  menuArrow: {
    fontSize: 20,
    color: '#c7c7cc',
  },

  // 구분선
  divider: {
    height: 8,
    backgroundColor: '#f5f5f7',
    marginVertical: 8,
  },

  // 로그아웃
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    color: '#ff3b30',
    fontWeight: '600',
  },
});
