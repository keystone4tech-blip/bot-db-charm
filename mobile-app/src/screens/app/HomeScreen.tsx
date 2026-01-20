import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { selectUser, selectTelegramId } from '../../redux/slices/authSlice';
import { selectReferralStats } from '../../redux/slices/profileSlice';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }: any) {
  const user = useAppSelector(selectUser);
  const telegramId = useAppSelector(selectTelegramId);
  const referralStats = useAppSelector(selectReferralStats);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Refresh data from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const StatCard = ({ icon, title, value, color }: any) => (
    <TouchableOpacity style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const QuickAction = ({ icon, title, onPress, color }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color="#ffffff" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Привет, {user?.first_name || 'Пользователь'}!</Text>
            <Text style={styles.subtitle}>Добро пожаловать в Keystone</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>
              {user?.first_name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="people-outline"
            title="Рефералов"
            value={referralStats?.total_referrals || 0}
            color="#007AFF"
          />
          <StatCard
            icon="key-outline"
            title="VPN ключей"
            value="0"
            color="#4CAF50"
          />
          <StatCard
            icon="chatbubbles-outline"
            title="Каналов"
            value="0"
            color="#FF9800"
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Быстрые действия</Text>
        <View style={styles.quickActionsContainer}>
          <QuickAction
            icon="add-circle"
            title="Создать VPN"
            color="#007AFF"
            onPress={() => navigation.navigate('VPN')}
          />
          <QuickAction
            icon="add-circle"
            title="Добавить канал"
            color="#4CAF50"
            onPress={() => navigation.navigate('Channels')}
          />
          <QuickAction
            icon="share-social"
            title="Пригласить"
            color="#FF9800"
            onPress={() => navigation.navigate('Referral')}
          />
        </View>

        {/* Info Cards */}
        <Text style={styles.sectionTitle}>Информация</Text>
        <TouchableOpacity style={styles.infoCard}>
          <View style={styles.infoCardIcon}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
          </View>
          <View style={styles.infoCardText}>
            <Text style={styles.infoCardTitle}>Как создать VPN ключ?</Text>
            <Text style={styles.infoCardDescription}>
              Нажмите на вкладку VPN и создайте новый ключ для доступа к защищенному соединению
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoCard}>
          <View style={styles.infoCardIcon}>
            <Ionicons name="gift" size={24} color="#FF9800" />
          </View>
          <View style={styles.infoCardText}>
            <Text style={styles.infoCardTitle}>Реферальная программа</Text>
            <Text style={styles.infoCardDescription}>
              Приглашайте друзей и получайте бонусы за каждого приглашенного пользователя
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionTitle: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoCardIcon: {
    marginRight: 12,
  },
  infoCardText: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoCardDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
