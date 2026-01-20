import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { selectUser } from '../../redux/slices/authSlice';

export default function ChannelsScreen() {
  const user = useAppSelector(selectUser);
  const [channels, setChannels] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [channelId, setChannelId] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelUsername, setChannelUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChannels();
  }, [user?.id]);

  const loadChannels = async () => {
    // TODO: Implement API call
    setChannels([]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChannels();
    setRefreshing(false);
  };

  const handleAddChannel = async () => {
    if (!channelId.trim() || !channelName.trim()) {
      Alert.alert('Ошибка', 'Заполните обязательные поля');
      return;
    }

    if (!user?.id) {
      Alert.alert('Ошибка', 'Не авторизован');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement API call to create channel
      setModalVisible(false);
      setChannelId('');
      setChannelName('');
      setChannelUsername('');
      Alert.alert('Успех', 'Канал добавлен!');
    } catch (error: any) {
      console.error('Error adding channel:', error);
      Alert.alert('Ошибка', 'Не удалось добавить канал');
    } finally {
      setLoading(false);
    }
  };

  const renderChannelItem = ({ item }: any) => (
    <View style={styles.channelCard}>
      <View style={styles.channelHeader}>
        <View style={styles.channelIcon}>
          <Ionicons name="chatbubbles" size={32} color="#007AFF" />
        </View>
        <View style={styles.channelInfo}>
          <Text style={styles.channelName}>{item.channel_name}</Text>
          {item.channel_username && (
            <Text style={styles.channelUsername}>@{item.channel_username}</Text>
          )}
        </View>
      </View>

      {item.members_count && (
        <View style={styles.channelStats}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.channelMembers}>{item.members_count} подписчиков</Text>
        </View>
      )}

      <Text style={styles.channelDate}>
        Добавлен: {new Date(item.created_at).toLocaleDateString('ru-RU')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Telegram каналы</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={channels}
        renderItem={renderChannelItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>Нет каналов</Text>
            <Text style={styles.emptySubtext}>
              Добавьте свои Telegram каналы для управления
            </Text>
          </View>
        }
      />

      {/* Add Channel Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Добавить канал</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>ID канала *</Text>
              <TextInput
                style={styles.input}
                placeholder="-1001234567890"
                value={channelId}
                onChangeText={setChannelId}
                keyboardType="number-pad"
              />

              <Text style={styles.inputLabel}>Название канала *</Text>
              <TextInput
                style={styles.input}
                placeholder="Мой канал"
                value={channelName}
                onChangeText={setChannelName}
              />

              <Text style={styles.inputLabel}>Username (опционально)</Text>
              <TextInput
                style={styles.input}
                placeholder="@mychannel"
                value={channelUsername}
                onChangeText={setChannelUsername}
                autoCapitalize="none"
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
                onPress={handleAddChannel}
                disabled={loading}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {loading ? 'Добавление...' : 'Добавить'}
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
  channelCard: {
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
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  channelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  channelUsername: {
    fontSize: 14,
    color: '#007AFF',
  },
  channelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelMembers: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  channelDate: {
    fontSize: 12,
    color: '#999',
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
    marginBottom: 16,
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
