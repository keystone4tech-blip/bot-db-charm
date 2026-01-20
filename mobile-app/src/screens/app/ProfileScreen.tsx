import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { selectUser, logout } from '../../redux/slices/authSlice';
import storage from '../../services/storage';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const handleLogout = async () => {
    Alert.alert(
      'Выход из аккаунта',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            dispatch(logout());
            await storage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Splash' }],
            });
          },
        },
      ]
    );
  };

  const ProfileOption = ({ icon, title, onPress, color = '#007AFF' }: any) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={[styles.optionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.optionTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.first_name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {user?.first_name} {user?.last_name || ''}
            </Text>
            {user?.telegram_username && (
              <Text style={styles.username}>@{user.telegram_username}</Text>
            )}
            <Text style={styles.telegramId}>Telegram ID: {user?.telegram_id}</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Аккаунт</Text>
          <ProfileOption
            icon="person-outline"
            title="Редактировать профиль"
            onPress={() => {}}
          />
          <ProfileOption
            icon="shield-outline"
            title="Безопасность"
            onPress={() => {}}
          />
          <ProfileOption
            icon="notifications-outline"
            title="Уведомления"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Реферальный код</Text>
            <View style={styles.infoValue}>
              <Text style={styles.infoValueText}>{user?.referral_code || '-'}</Text>
            </View>
          </View>
          {user?.referred_by && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Пригласил</Text>
              <Text style={styles.infoValueText}>{user.referred_by}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Дата регистрации</Text>
            <Text style={styles.infoValueText}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('ru-RU')
                : '-'}
            </Text>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Поддержка</Text>
          <ProfileOption
            icon="help-circle-outline"
            title="Помощь и FAQ"
            onPress={() => {}}
          />
          <ProfileOption
            icon="chatbubble-outline"
            title="Связаться с поддержкой"
            onPress={() => {}}
          />
          <ProfileOption
            icon="document-text-outline"
            title="Условия использования"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Keystone Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  telegramId: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  infoValueText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'monospace',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
});
