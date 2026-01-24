// src/components/Auth/LoginWithEmail.tsx
import { useState } from 'react';
import { loginWithEmail, sendOTP, verifyOTP } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginWithEmailProps {
  onSwitchToTelegram?: () => void;
  onSwitchToRegister?: () => void;
  onLoginSuccess?: (userData: any) => void;
}

export const LoginWithEmail = ({ onSwitchToTelegram, onSwitchToRegister, onLoginSuccess }: LoginWithEmailProps) => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithEmail({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        onLoginSuccess?.(result.profile);
      } else {
        setError(result.error || 'Ошибка входа');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await sendOTP(formData.email);

      if (result.success) {
        setOtpSent(true);
        setLoginMethod('otp');
      } else {
        setError(result.error || 'Не удалось отправить OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifyOTP(formData.email, formData.otp);

      if (result.success) {
        onLoginSuccess?.(result.profile);
      } else {
        setError(result.error || 'Неверный OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Вход по почте</CardTitle>
        <CardDescription>Войдите в свой аккаунт, используя адрес электронной почты</CardDescription>
      </CardHeader>
      
      {loginMethod === 'password' ? (
        <form onSubmit={handlePasswordLogin}>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Электронная почта</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Введите вашу электронную почту"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Введите ваш пароль"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти по паролю'}
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSendOTP}
              type="button"
              disabled={loading}
            >
              Вход по OTP
            </Button>
            
            <div className="flex justify-between w-full pt-2">
              <Button
                variant="ghost"
                onClick={onSwitchToRegister}
                type="button"
              >
                Регистрация
              </Button>
              
              <Button
                variant="ghost"
                onClick={onSwitchToTelegram}
                type="button"
              >
                Вход через Telegram
              </Button>
            </div>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Электронная почта</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Введите вашу электронную почту"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={otpSent}
              />
            </div>
            
            {!otpSent ? (
              <div className="pt-4">
                <Button 
                  type="button" 
                  className="w-full" 
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  Отправить OTP
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">Одноразовый пароль</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    placeholder="Введите 6-значный код"
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    Подтвердить OTP
                  </Button>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setLoginMethod('password');
                setOtpSent(false);
              }}
              type="button"
              disabled={loading}
            >
              Вернуться к входу по паролю
            </Button>
            
            <div className="flex justify-between w-full pt-2">
              <Button
                variant="ghost"
                onClick={onSwitchToRegister}
                type="button"
              >
                Регистрация
              </Button>
              
              <Button
                variant="ghost"
                onClick={onSwitchToTelegram}
                type="button"
              >
                Вход через Telegram
              </Button>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};
