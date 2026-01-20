import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../redux/hooks';
import { setTelegramId, setUser, setLoading, setError } from '../../redux/slices/authSlice';
import { apiClient } from '../../services/api';
import storage from '../../services/storage';

export default function LoginScreen({ navigation }: any) {
  const [telegramId, setTelegramIdInput] = useState('');
  const [loading, setLoadingState] = useState(false);

  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    if (!telegramId.trim()) {
      Alert.alert('Ошибка', 'Введите Telegram ID');
      return;
    }

    try {
      setLoadingState(true);
      dispatch(setLoading(true));

      // Get user from backend
      const response: any = await apiClient.getUserByTelegramId(parseInt(telegramId.trim()));

      if (response.success && response.profile) {
        // Save user data to Redux
        dispatch(setUser(response.profile));
        dispatch(setTelegramId(response.profile.telegram_id));

        // Save to storage
        await storage.setUserId(response.profile.id);
        await storage.setTelegramId(String(response.profile.telegram_id));
        await storage.setFirstName(response.profile.first_name);
        await storage.setReferralCode(response.profile.referral_code);

        Alert.alert('Успех', 'Вы успешно вошли!', [
          {
            text: 'OK',
            onPress: () => navigation.replace('MainTabs'),
          },
        ]);
      } else {
        Alert.alert('Ошибка', 'Пользователь не найден. Пожалуйста, зарегистрируйтесь через Telegram бота.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch(setError(error.response?.data?.error || 'Ошибка входа'));
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось войти');
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Добро пожаловать</Text>
          <Text style={styles.subtitle}>Введите ваш Telegram ID для входа</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Telegram ID"
              value={telegramId}
              onChangeText={setTelegramIdInput}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Загрузка...' : 'Войти'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>
              Нет аккаунта? Зарегистрируйтесь
            </Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Для регистрации используйте Telegram бота. Ваш Telegram ID можно узнать у бота.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
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
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
