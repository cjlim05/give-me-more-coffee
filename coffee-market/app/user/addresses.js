import React, { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/oauth';

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form, setForm] = useState({
    name: '',
    recipient: '',
    phone: '',
    zipcode: '',
    address: '',
    addressDetail: '',
    isDefault: false,
  });

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('배송지 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setForm({
      name: '',
      recipient: '',
      phone: '',
      zipcode: '',
      address: '',
      addressDetail: '',
      isDefault: false,
    });
    setModalVisible(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setForm({
      name: address.name,
      recipient: address.recipient,
      phone: address.phone,
      zipcode: address.zipcode || '',
      address: address.address,
      addressDetail: address.addressDetail || '',
      isDefault: address.isDefault,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.recipient || !form.phone || !form.address) {
      Alert.alert('알림', '필수 항목을 입력해주세요.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const method = editingAddress ? 'PUT' : 'POST';
      const url = editingAddress
        ? `${API_BASE_URL}/api/addresses/${editingAddress.addressId}`
        : `${API_BASE_URL}/api/addresses`;

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setModalVisible(false);
        fetchAddresses();
        Alert.alert('완료', editingAddress ? '배송지가 수정되었습니다.' : '배송지가 추가되었습니다.');
      }
    } catch (error) {
      console.error('배송지 저장 에러:', error);
      Alert.alert('오류', '저장에 실패했습니다.');
    }
  };

  const handleDelete = (addressId) => {
    Alert.alert('삭제 확인', '이 배송지를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/addresses/${addressId}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              fetchAddresses();
              Alert.alert('완료', '배송지가 삭제되었습니다.');
            }
          } catch (error) {
            console.error('배송지 삭제 에러:', error);
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (addressId) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/addresses/${addressId}/default`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error('기본 배송지 설정 에러:', error);
    }
  };

  const renderAddressItem = ({ item }) => (
    <View style={styles.addressCard}>
      <View style={styles.cardHeader}>
        <View style={styles.nameRow}>
          <Text style={styles.addressName}>{item.name}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>기본</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Text style={styles.editButton}>수정</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.recipient}>{item.recipient}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <Text style={styles.address}>
          [{item.zipcode}] {item.address}
        </Text>
        {item.addressDetail && (
          <Text style={styles.addressDetail}>{item.addressDetail}</Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(item.addressId)}
          >
            <Text style={styles.setDefaultText}>기본 배송지로 설정</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.addressId)}
        >
          <Text style={styles.deleteText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '배송지 관리',
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
          headerTitle: '배송지 관리',
          headerBackTitle: '뒤로',
        }}
      />

      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>등록된 배송지가 없습니다</Text>
          <Text style={styles.emptySubtitle}>새 배송지를 추가해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.addressId.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ 새 배송지 추가</Text>
      </TouchableOpacity>

      {/* 배송지 추가/수정 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingAddress ? '배송지 수정' : '새 배송지'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>저장</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>배송지명 *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="예: 집, 회사"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>받는 분 *</Text>
              <TextInput
                style={styles.input}
                value={form.recipient}
                onChangeText={(text) => setForm({ ...form, recipient: text })}
                placeholder="받는 분 이름"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>연락처 *</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                placeholder="010-0000-0000"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>우편번호</Text>
              <TextInput
                style={styles.input}
                value={form.zipcode}
                onChangeText={(text) => setForm({ ...form, zipcode: text })}
                placeholder="우편번호"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>주소 *</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => setForm({ ...form, address: text })}
                placeholder="기본 주소"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>상세 주소</Text>
              <TextInput
                style={styles.input}
                value={form.addressDetail}
                onChangeText={(text) => setForm({ ...form, addressDetail: text })}
                placeholder="상세 주소"
              />
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setForm({ ...form, isDefault: !form.isDefault })}
            >
              <View style={[styles.checkbox, form.isDefault && styles.checkboxChecked]}>
                {form.isDefault && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>기본 배송지로 설정</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1e',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#007aff',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    fontSize: 14,
    color: '#007aff',
  },

  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f7',
    paddingTop: 12,
  },
  recipient: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#1c1c1e',
    lineHeight: 20,
  },
  addressDetail: {
    fontSize: 14,
    color: '#636366',
    marginTop: 2,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f7',
    gap: 12,
  },
  setDefaultButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
  },
  setDefaultText: {
    fontSize: 13,
    color: '#636366',
    fontWeight: '500',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteText: {
    fontSize: 13,
    color: '#ff3b30',
    fontWeight: '500',
  },

  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#1c1c1e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // 모달
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  cancelButton: {
    fontSize: 16,
    color: '#8e8e93',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  saveButton: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1c1c1e',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#c7c7cc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#1c1c1e',
  },
});
