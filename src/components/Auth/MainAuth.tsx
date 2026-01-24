// src/components/Auth/MainAuth.tsx
import { useState } from 'react';
import { RegisterWithEmail } from './RegisterWithEmail';
import { LoginWithEmail } from './LoginWithEmail';
import { TelegramAuth } from '../TelegramAuth';
import { OTPAuthScreen } from '../OTPAuthScreen';

export enum AuthMethod {
  TELEGRAM = 'telegram',
  EMAIL_REGISTER = 'email_register',
  EMAIL_LOGIN = 'email_login',
  OTP_AUTH = 'otp_auth'
}

interface MainAuthProps {
  onAuthSuccess?: (userData: any) => void;
}

export const MainAuth = ({ onAuthSuccess }: MainAuthProps) => {
  const [currentMethod, setCurrentMethod] = useState<AuthMethod>(AuthMethod.TELEGRAM);

  const handleRegisterSuccess = (userData: any) => {
    // Обработка успешной регистрации
    console.log('Registration successful:', userData);
    onAuthSuccess?.(userData);
  };

  const handleLoginSuccess = (userData: any) => {
    // Обработка успешного входа
    console.log('Login successful:', userData);
    onAuthSuccess?.(userData);
  };

  const renderCurrentView = () => {
    switch (currentMethod) {
      case AuthMethod.EMAIL_REGISTER:
        return (
          <RegisterWithEmail
            onSwitchToTelegram={() => setCurrentMethod(AuthMethod.TELEGRAM)}
            onRegisterSuccess={handleRegisterSuccess}
          />
        );
      case AuthMethod.EMAIL_LOGIN:
        return (
          <LoginWithEmail
            onSwitchToTelegram={() => setCurrentMethod(AuthMethod.TELEGRAM)}
            onSwitchToRegister={() => setCurrentMethod(AuthMethod.EMAIL_REGISTER)}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case AuthMethod.OTP_AUTH:
        return (
          <OTPAuthScreen
            onAuthSuccess={handleLoginSuccess}
            onBack={() => setCurrentMethod(AuthMethod.TELEGRAM)}
          />
        );
      case AuthMethod.TELEGRAM:
      default:
        return (
          <TelegramAuth
            onSwitchToEmailRegister={() => setCurrentMethod(AuthMethod.EMAIL_REGISTER)}
            onSwitchToEmailLogin={() => setCurrentMethod(AuthMethod.EMAIL_LOGIN)}
            onSwitchToOTPAuth={() => setCurrentMethod(AuthMethod.OTP_AUTH)}
            onAuthSuccess={handleLoginSuccess}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {renderCurrentView()}

        {/* Показываем переключатели только если не на экране Telegram */}
        {currentMethod !== AuthMethod.TELEGRAM && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setCurrentMethod(AuthMethod.TELEGRAM)}
              className="text-blue-500 hover:underline"
            >
              Войти через Telegram
            </button>
          </div>
        )}
      </div>
    </div>
  );
};