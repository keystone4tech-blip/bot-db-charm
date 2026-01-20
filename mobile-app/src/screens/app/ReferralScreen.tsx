import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { selectUser } from '../../redux/slices/authSlice';
import { selectReferralStats, setReferralStats } from '../../redux/slices/profileSlice';
import { apiClient } from '../../services/api';

export default function ReferralScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const referralStats = useAppSelector(selectReferralStats);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReferralStats();
  }, [user?.id]);

  const loadReferralStats = async () => {
    if (!user?.id) return;

    try {
      const response: any = await apiClient.getReferralStats(user.id);
      if (response) {
        dispatch(setReferralStats(response));
      }
    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReferralStats();
    setRefreshing(false);
  };

  const copyReferralCode = async () => {
    if (!user?.referral_code) return;

    await Clipboard.setStringAsync(user.referral_code);
    Alert.alert('Успех', 'Реферальный код скопирован в буфер обмена');
  };

  const shareReferralLink = async () => {
    if (!user?.referral_code) return;

    const referralLink = `https://t.me/YOUR_BOT?start=${user.referral_code}`;

    try {
      await Share.share({
        message: `Присоединяйся к Keystone! Используй мой реферальный код: ${user.referral_code}`,
        url: referralLink,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const StatCard = ({ icon, title, value, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const ReferralItem = ({ referral, index }: any) => (
    <View style={styles.referralItem}>
      <View style={styles.referralAvatar}>
        <Text style={styles.referralAvatarText}>
          {referral.first_name?.[0]?.toUpperCase() || 'U'}
        </Text>
      </View>
      <View style={styles.referralInfo}>
        <Text style={styles.referralName}>
          {referral.first_name} {referral.last_name || ''}
        </Text>
        {referral.telegram_username && (
          <Text style={styles.referralUsername}>@{referral.telegram_username}</Text>
        )}
      </View>
      <View style={styles.referralDate}>
        <Text style={styles.referralDateText}>
          {new Date(referral.created_at).toLocaleDateString('ru-RU')}
        </Text>
      </View>
    </View>
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
          <Ionicons name="gift" size={40} color="#FF9800" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Реферальная программа</Text>
            <Text style={styles.headerSubtitle}>Приглашайте друзей и получайте бонусы!</Text>
          </View>
        </View>

        {/* Referral Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Ваш реферальный код</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{user?.referral_code || 'Загрузка...'}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyReferralCode}>
              <Ionicons name="copy-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.codeHint}>
            Поделитесь кодом с друзьями или отправьте им прямую ссылку
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="people-outline"
            title="Всего рефералов"
            value={referralStats?.total_referrals || 0}
            color="#007AFF"
          />
          <StatCard
            icon="checkmark-circle-outline"
            title="Активных"
            value={referralStats?.active_referrals || 0}
            color="#4CAF50"
          />
          <StatCard
            icon="cash-outline"
            title="Заработано"
            value={`${referralStats?.total_earnings || 0} ₽`}
            color="#FF9800"
          />
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={shareReferralLink}>
          <Ionicons name="share-social" size={24} color="#ffffff" />
          <Text style={styles.shareButtonText}>Поделиться приглашением</Text>
        </TouchableOpacity>

        {/* Recent Referrals */}
        {referralStats?.recent_referrals && referralStats.recent_referrals.length > 0 && (
          <View style={styles.referralsSection}>
            <Text style={styles.sectionTitle}>Последние рефералы</Text>
            {referralStats.recent_referrals.map((referral: any, index: number) => (
              <ReferralItem key={referral.id} referral={referral} index={index} />
            ))}
          </View>
        )}

        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>Как это работает?</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Поделитесь кодом</Text>
              <Text style={styles.stepDescription}>
                Отправьте свой реферальный код друзьям или поделитесь ссылкой
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Друзья регистрируются</Text>
              <Text style={styles.stepDescription}>
                При регистрации друзья вводят ваш код
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Получайте бонусы</Text>
              <Text style={styles.stepDescription}>
                За каждого приглашенного пользователя вы получаете награду
              </Text>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FF980020',
    padding: 16,
    borderRadius: 16,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  codeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  code: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  codeHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
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
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  referralsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  referralAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  referralAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  referralUsername: {
    fontSize: 14,
    color: '#007AFF',
  },
  referralDate: {
    alignItems: 'flex-end',
  },
  referralDateText: {
    fontSize: 12,
    color: '#999',
  },
  howItWorks: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
