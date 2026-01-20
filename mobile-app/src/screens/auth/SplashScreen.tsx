import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../redux/hooks';
import { setLoading, setTelegramId } from '../../redux/slices/authSlice';
import storage from '../../services/storage';

export default function SplashScreen({ navigation }: any) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      dispatch(setLoading(true));

      // Check if user has Telegram ID stored
      const telegramId = await storage.getTelegramId();
      const firstName = await storage.getFirstName();
      const userId = await storage.getUserId();

      if (telegramId && userId) {
        // User is logged in, set auth state
        dispatch(setTelegramId(parseInt(telegramId)));

        // Navigate to main app
        setTimeout(() => {
          navigation.replace('MainTabs');
        }, 1500);
      } else {
        // User is not logged in, go to login
        setTimeout(() => {
          navigation.replace('Login');
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setTimeout(() => {
        navigation.replace('Login');
      }, 1500);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Keystone</Text>
        <Text style={styles.subtitle}>VPN & Telegram Bot Management</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
});
