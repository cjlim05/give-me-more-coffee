import React, { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/oauth';

const POINT_TYPE = {
  EARN: { label: '적립', color: '#34c759', prefix: '+' },
  USE: { label: '사용', color: '#ff3b30', prefix: '-' },
  REFUND: { label: '환불', color: '#007aff', prefix: '+' },
  EXPIRE: { label: '소멸', color: '#8e8e93', prefix: '-' },
  ADMIN: { label: '관리자', color: '#5856d6', prefix: '' },
};

export default function PointsScreen() {
  const router = useRouter();
  const [currentPoint, setCurrentPoint] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchPoints();
    }, [])
  );

  const fetchPoints = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/points`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPoint(data.currentPoint);
        setHistory(data.history);
      }
    } catch (error) {
      console.error('포인트 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderHistoryItem = ({ item }) => {
    const type = POINT_TYPE[item.type] || POINT_TYPE.ADMIN;
    const isPositive = item.amount > 0;

    return (
      <View style={styles.historyItem}>
        <View style={styles.historyLeft}>
          <View style={[styles.typeBadge, { backgroundColor: type.color + '20' }]}>
            <Text style={[styles.typeText, { color: type.color }]}>{type.label}</Text>
          </View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyDesc}>{item.description || '포인트 변동'}</Text>
            <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.historyRight}>
          <Text style={[styles.historyAmount, { color: isPositive ? '#34c759' : '#ff3b30' }]}>
            {isPositive ? '+' : ''}{item.amount?.toLocaleString()}P
          </Text>
          <Text style={styles.historyBalance}>잔액 {item.balance?.toLocaleString()}P</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '포인트',
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
          headerTitle: '포인트',
          headerBackTitle: '뒤로',
        }}
      />

      {/* 현재 포인트 */}
      <View style={styles.pointCard}>
        <Text style={styles.pointLabel}>보유 포인트</Text>
        <Text style={styles.pointValue}>
          {currentPoint?.toLocaleString()}
          <Text style={styles.pointUnit}>P</Text>
        </Text>
      </View>

      {/* 포인트 안내 */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>포인트 안내</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>결제 금액의 1%가 적립됩니다.</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>적립된 포인트는 1P부터 사용 가능합니다.</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>포인트 유효기간은 적립일로부터 1년입니다.</Text>
        </View>
      </View>

      {/* 포인트 내역 */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>적립/사용 내역</Text>

        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>포인트 내역이 없습니다</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.historyId.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 현재 포인트
  pointCard: {
    backgroundColor: '#1c1c1e',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  pointLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  pointValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  pointUnit: {
    fontSize: 24,
    fontWeight: '500',
  },

  // 포인트 안내
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoBullet: {
    fontSize: 12,
    color: '#8e8e93',
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#8e8e93',
    flex: 1,
  },

  // 포인트 내역
  historySection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1e',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyInfo: {
    flex: 1,
  },
  historyDesc: {
    fontSize: 14,
    color: '#1c1c1e',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#8e8e93',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  historyBalance: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 2,
  },

  // 빈 상태
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#8e8e93',
  },
});
