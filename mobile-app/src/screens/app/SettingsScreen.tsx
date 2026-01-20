import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { checkForUpdates } from '../../services/updates';
import { selectNotificationsEnabled, setNotificationsEnabled } from '../../redux/slices/notificationSlice';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import storage from '../../services/storage';

export default function SettingsScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const notificationsEnabled = useAppSelector(selectNotificationsEnabled);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const notifsEnabled = await storage.areNotificationsEnabled();
    setNotifications(notifsEnabled);
  };

  const toggleNotifications = async (value: boolean) => {
    setNotifications(value);
    await storage.setNotificationsEnabled(value);
    dispatch(setNotificationsEnabled(value));
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const hasUpdate = await checkForUpdates();
      if (!hasUpdate) {
        Alert.alert('Обновление', 'У вас установлена последняя версия приложения');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось проверить обновления');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const SettingItem = ({
    icon,
    title,
    rightComponent,
    onPress,
    color = '#007AFF',
  }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
      {rightComponent}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Уведомления</Text>
          <SettingItem
            icon="notifications-outline"
            title="Push уведомления"
            color="#FF9800"
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#ccc', true: '#FF9800' }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingItem
            icon="mail-outline"
            title="Уведомления о рефералах"
            rightComponent={<Switch value={true} />}
          />
          <SettingItem
            icon="key-outline"
            title="Уведомления о VPN ключах"
            rightComponent={<Switch value={true} />}
          />
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Внешний вид</Text>
          <SettingItem
            icon="moon-outline"
            title="Темная тема"
            color="#673AB7"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#ccc', true: '#673AB7' }}
                thumbColor="#ffffff"
              />
            }
          />
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Приложение</Text>
          <SettingItem
            icon="language-outline"
            title="Язык"
            color="#4CAF50"
            rightComponent={
              <Text style={styles.settingValue}>Русский</Text>
            }
            onPress={() => {}}
          />
          <SettingItem
            icon="cloud-download-outline"
            title="Проверить обновления"
            color="#2196F3"
            rightComponent={
              checkingUpdate ? (
                <Text style={styles.checkingText}>Проверка...</Text>
              ) : null
            }
            onPress={handleCheckUpdate}
          />
          <SettingItem
            icon="information-circle-outline"
            title="О приложении"
            color="#607D8B"
            onPress={() => {}}
          />
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Данные</Text>
          <SettingItem
            icon="trash-outline"
            title="Очистить кэш"
            color="#F44336"
            onPress={() => {
              Alert.alert('Очистить кэш', 'Очистить кэш приложения?', [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Очистить', style: 'destructive', onPress: () => {} },
              ]);
            }}
          />
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, styles.dangerZone]}>
          <Text style={styles.sectionTitle}>Опасная зона</Text>
          <SettingItem
            icon="warning-outline"
            title="Удалить аккаунт"
            color="#F44336"
            onPress={() => {
              Alert.alert(
                'Удаление аккаунта',
                'Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить.',
                [
                  { text: 'Отмена', style: 'cancel' },
                  { text: 'Удалить', style: 'destructive', onPress: () => {} },
                ]
              );
            }}
          />
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dangerZone: {
    borderTopWidth: 3,
    borderTopColor: '#F44336',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  checkingText: {
    fontSize: 14,
    color: '#007AFF',
  },
});
