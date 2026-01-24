// src/components/OTPAuthScreen.tsx
import { useState } from 'react';
import { requestOTPCode, verifyOTPCode } from '../lib/api';
import { AuthResponse } from '../lib/api';

interface OTPAuthScreenProps {
  onAuthSuccess?: (userData: AuthResponse) => void;
  onBack?: () => void;
}

export enum OTPAuthMode {
  REQUEST_CODE = 'request_code',
  ENTER_CODE = 'enter_code'
}

export const OTPAuthScreen = ({ onAuthSuccess, onBack }: OTPAuthScreenProps) => {
  const [mode, setMode] = useState<OTPAuthMode>(OTPAuthMode.REQUEST_CODE);
  const [identifier, setIdentifier] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState('');

  const handleRequestCode = async () => {
    if (!identifier.trim()) {
      setError('Пожалуйста, введите ID или никнейм');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await requestOTPCode(identifier);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Код отправлен в Telegram бот');
        setSessionId(result.sessionId || '');
        setUserId(result.userId || '');
        setMode(OTPAuthMode.ENTER_CODE);
      } else {
        setError(result.error || 'Не удалось отправить код');
      }
    } catch (error) {
      setError('Ошибка при запросе кода');
      console.error('Request OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 6) {
      setError('Пожалуйста, введите 6-значный код');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyOTPCode(sessionId, code);
      
      if (result.success) {
        setSuccessMessage('Вы успешно вошли!');
        onAuthSuccess?.(result);
      } else {
        setError(result.error || 'Неправильный код');
      }
    } catch (error) {
      setError('Ошибка при проверке кода');
      console.error('Verify OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 characters
    if (/^\d*$/.test(value) && value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6">
          {mode === OTPAuthMode.REQUEST_CODE ? (
            <>
              <h2 className="text-2xl font-bold text-center mb-6">Вход по ID/никнейму</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Введите ваш ID или никнейм
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="123456789 или @username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleRequestCode}
                disabled={isLoading}
                className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Отправка...' : 'Отправить код'}
              </button>
              
              {onBack && (
                <div className="mt-4 text-center">
                  <button
                    onClick={onBack}
                    className="text-blue-500 hover:underline text-sm"
                    disabled={isLoading}
                  >
                    Назад
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-6">Введите код из Telegram</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Введите 6-значный код из бота
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-mono"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                  {successMessage}
                </div>
              )}
              
              <button
                onClick={handleVerifyCode}
                disabled={isLoading || code.length !== 6}
                className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${(isLoading || code.length !== 6) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Проверка...' : 'Подтвердить'}
              </button>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setMode(OTPAuthMode.REQUEST_CODE)}
                  className="text-blue-500 hover:underline text-sm mr-4"
                  disabled={isLoading}
                >
                  Изменить ID/никнейм
                </button>
                
                {onBack && (
                  <button
                    onClick={onBack}
                    className="text-blue-500 hover:underline text-sm"
                    disabled={isLoading}
                  >
                    Назад
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};