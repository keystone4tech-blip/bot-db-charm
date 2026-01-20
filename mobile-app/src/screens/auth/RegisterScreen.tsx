import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../redux/hooks';
import { setUser, setTelegramId, setLoading, setError } from '../../redux/slices/authSlice';
import { apiClient } from '../../services/api';
import storage from '../../services/storage';

interface Props {
  route: {
    params?: {
      referralCode?: string;
    };
  };
}

export default function RegisterScreen({ navigation, route }: any) {
  const [telegramId, setTelegramIdInput] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState(route.params?.referralCode || '');
  const [loading, setLoadingState] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const [referrerName, setReferrerName] = useState('');

  const dispatch = useAppDispatch();

  const verifyCode = async () => {
    if (!referralCode.trim()) {
      setCodeValid(null);
      setReferrerName('');
      return;
    }

    try {
      setVerifyingCode(true);
      const response: any = await apiClient.verifyReferralCode(
        referralCode.trim(),
        telegramId ? parseInt(telegramId) : undefined
      );

      if (response.valid && response.user) {
        setCodeValid(true);
        setReferrerName(`${response.user.first_name} (@${response.user.username || 'unknown'})`);
      } else {
        setCodeValid(false);
        setReferrerName(response.message || 'Неверный код');
      }
    } catch (error: any) {
      setCodeValid(false);
      setReferrerName(error.response?.data?.message || 'Ошибка проверки');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleRegister = async () => {
    if (!telegramId.trim() || !firstName.trim()) {
      Alert.alert('Ошибка', 'Заполните обязательные поля');
      return;
    }

    try {
      setLoadingState(true);
      dispatch(setLoading(true));

      const response: any = await apiClient.registerUser({
        telegram_id: parseInt(telegramId.trim()),
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        username: username.trim() || undefined,
        referral_code: referralCode.trim() || undefined,
      });

      if (response.success && response.profile) {
        // Save user data to Redux
        dispatch(setUser(response.profile));
        dispatch(setTelegramId(response.profile.telegram_id));

        // Save to storage
        await storage.setUserId(response.profile.id);
        await storage.setTelegramId(String(response.profile.telegram_id));
        await storage.setFirstName(response.profile.first_name);
        await storage.setReferralCode(response.profile.referral_code);

        Alert.alert('Успех', 'Регистрация выполнена успешно!', [
          {
            text: 'OK',
            onPress: () => navigation.replace('MainTabs'),
          },
        ]);
      } else {
        Alert.alert('Ошибка', 'Не удалось зарегистрироваться');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      dispatch(setError(error.response?.data?.error || 'Ошибка регистрации'));
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось зарегистрироваться');
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>Создайте новый аккаунт</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telegram ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите ваш Telegram ID"
              value={telegramId}
              onChangeText={setTelegramIdInput}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Имя *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ваше имя"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Фамилия</Text>
            <TextInput
              style={styles.input}
              placeholder="Ваша фамилия (опционально)"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="@username (опционально)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Реферальный код (опционально)</Text>
            <View style={styles.referralContainer}>
              <TextInput
                style={[styles.input, styles.referralInput]}
                placeholder="Введите код приглашения"
                value={referralCode}
                onChangeText={setReferralCode}
                onEndEditing={verifyCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {!verifyingCode && referralCode.trim() && codeValid !== null && (
                <View style={[
                  styles.validationIndicator,
                  codeValid ? styles.valid : styles.invalid
                ]}>
                  <Text style={styles.validationText}>
                    {codeValid ? '✓' : '✗'}
                  </Text>
                </View>
              )}
            </View>
            {referrerName ? (
              <Text style={[
                styles.referrerName,
                codeValid ? styles.validText : styles.invalidText
              ]}>
                {referrerName}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Загрузка...' : 'Зарегистрироваться'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>
              Уже есть аккаунт? Войти
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  label: {
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
  referralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralInput: {
    flex: 1,
  },
  validationIndicator: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valid: {
    backgroundColor: '#4CAF50',
  },
  invalid: {
    backgroundColor: '#F44336',
  },
  validationText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  referrerName: {
    marginTop: 8,
    fontSize: 12,
  },
  validText: {
    color: '#4CAF50',
  },
  invalidText: {
    color: '#F44336',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
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
  loginButton: {
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
