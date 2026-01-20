import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { selectUser, selectTelegramId } from '../../redux/slices/authSlice';
import { selectVPNKeys, setKeys, addKey } from '../../redux/slices/vpnSlice';
import { apiClient } from '../../services/api';

export default function VPNScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const telegramId = useAppSelector(selectTelegramId);
  const vpnKeys = useAppSelector(selectVPNKeys);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVPNKeys();
  }, [user?.id]);

  const loadVPNKeys = async () => {
    if (!user?.id) return;

    try {
      const response: any = await apiClient.getVPNKeys(user.id);
      if (Array.isArray(response)) {
        dispatch(setKeys(response));
      }
    } catch (error) {
      console.error('Error loading VPN keys:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVPNKeys();
    setRefreshing(false);
  };

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      Alert.alert('Ошибка', 'Введите название ключа');
      return;
    }

    if (!user?.id) {
      Alert.alert('Ошибка', 'Не авторизован');
      return;
    }

    try {
      setLoading(true);
      const response: any = await apiClient.createVPNKey({
        user_id: user.id,
        key_name: keyName.trim(),
      });

      if (response) {
        dispatch(addKey(response));
        setModalVisible(false);
        setKeyName('');
        Alert.alert('Успех', 'VPN ключ создан!');
      }
    } catch (error: any) {
      console.error('Error creating VPN key:', error);
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось создать ключ');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (key: string) => {
    // TODO: Implement clipboard
    Alert.alert('Ключ скопирован', key);
  };

  const renderKeyItem = ({ item }: any) => (
    <View style={[styles.keyCard, !item.is_active && styles.keyCardInactive]}>
      <View style={styles.keyHeader}>
        <View style={styles.keyTitle}>
          <Ionicons
            name={item.is_active ? 'key' : 'key-outline'}
            size={24}
            color={item.is_active ? '#4CAF50' : '#999'}
          />
          <Text style={styles.keyName}>{item.key_name}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.is_active ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={[
            styles.statusText,
            item.is_active ? styles.statusTextActive : styles.statusTextInactive
          ]}>
            {item.is_active ? 'Активен' : 'Неактивен'}
          </Text>
        </View>
      </View>

      <View style={styles.keyContent}>
        <Text style={styles.keyLabel}>Ключ:</Text>
        <Text style={styles.keyValue} numberOfLines={1}>
          {item.key}
        </Text>
      </View>

      <View style={styles.keyFooter}>
        <Text style={styles.keyDate}>
          Создан: {new Date(item.created_at).toLocaleDateString('ru-RU')}
        </Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => copyToClipboard(item.key)}
        >
          <Ionicons name="copy-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VPN ключи</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vpnKeys}
        renderItem={renderKeyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="key-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>Нет VPN ключей</Text>
            <Text style={styles.emptySubtext}>
              Создайте свой первый VPN ключ для безопасного соединения
            </Text>
          </View>
        }
      />

      {/* Create Key Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Создать VPN ключ</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Название ключа</Text>
              <TextInput
                style={styles.input}
                placeholder="Например: Домашний VPN"
                value={keyName}
                onChangeText={setKeyName}
                autoFocus
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, loading && styles.modalButtonDisabled]}
                onPress={handleCreateKey}
                disabled={loading}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {loading ? 'Создание...' : 'Создать'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  keyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  keyCardInactive: {
    opacity: 0.6,
  },
  keyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  keyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#4CAF5020',
  },
  statusInactive: {
    backgroundColor: '#99920',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#4CAF50',
  },
  statusTextInactive: {
    color: '#999',
  },
  keyContent: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  keyLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  keyValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  keyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyDate: {
    fontSize: 12,
    color: '#999',
  },
  copyButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonSecondaryText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
