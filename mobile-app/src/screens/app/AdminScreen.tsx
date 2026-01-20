import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AdminScreen({ navigation }: any) {
  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const AdminAction = ({ title, description, icon, onPress, color = '#007AFF' }: any) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Панель администратора</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Общая статистика</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Пользователей"
              value="0"
              icon="people-outline"
              color="#007AFF"
            />
            <StatCard
              title="VPN ключей"
              value="0"
              icon="key-outline"
              color="#4CAF50"
            />
            <StatCard
              title="Каналов"
              value="0"
              icon="chatbubbles-outline"
              color="#FF9800"
            />
            <StatCard
              title="Рефералов"
              value="0"
              icon="share-outline"
              color="#9C27B0"
            />
          </View>
        </View>

        {/* User Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Управление пользователями</Text>
          <AdminAction
            title="Все пользователи"
            description="Просмотр и управление пользователями"
            icon="people"
            color="#007AFF"
            onPress={() => {}}
          />
          <AdminAction
            title="Блокировки"
            description="Заблокированные пользователи"
            icon="ban-outline"
            color="#F44336"
            onPress={() => {}}
          />
          <AdminAction
            title="Поиск пользователя"
            description="Найти пользователя по ID или username"
            icon="search"
            color="#607D8B"
            onPress={() => {}}
          />
        </View>

        {/* Content Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Управление контентом</Text>
          <AdminAction
            title="VPN ключи"
            description="Управление всеми VPN ключами"
            icon="key"
            color="#4CAF50"
            onPress={() => {}}
          />
          <AdminAction
            title="Telegram каналы"
            description="Управление каналами пользователей"
            icon="chatbubbles"
            color="#FF9800"
            onPress={() => {}}
          />
        </View>

        {/* Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Аналитика</Text>
          <AdminAction
            title="Статистика регистрации"
            description="График регистрации новых пользователей"
            icon="bar-chart-outline"
            color="#9C27B0"
            onPress={() => {}}
          />
          <AdminAction
            title="Активность пользователей"
            description="Аналитика активности"
            icon="pulse-outline"
            color="#E91E63"
            onPress={() => {}}
          />
          <AdminAction
            title="Финансовая статистика"
            description="Доходы и выплаты"
            icon="cash-outline"
            color="#2196F3"
            onPress={() => {}}
          />
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки системы</Text>
          <AdminAction
            title="Глобальные настройки"
            description="Основные настройки приложения"
            icon="settings-outline"
            color="#607D8B"
            onPress={() => {}}
          />
          <AdminAction
            title="Уведомления"
            description="Настройка системных уведомлений"
            icon="notifications-outline"
            color="#FF9800"
            onPress={() => {}}
          />
          <AdminAction
            title="Логи системы"
            description="Просмотр системных логов"
            icon="document-text-outline"
            color="#4CAF50"
            onPress={() => {}}
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
});
