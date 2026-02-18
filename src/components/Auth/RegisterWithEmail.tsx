// src/components/Auth/RegisterWithEmail.tsx
import { useState, useEffect } from 'react';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { Eye, EyeOff, AlertCircle, UserPlus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface RegisterWithEmailProps {
  onSwitchToTelegram?: () => void;
  onSwitchToLogin?: () => void;
  onRegisterSuccess?: (userData: any) => void;
  initialReferralCode?: string;
}

// Admin fallback referral code
const ADMIN_REFERRAL_CODE = 'GMQW2EGO';

interface ReferrerPreview {
  first_name: string | null;
  telegram_username: string | null;
  avatar_url: string | null;
}

export const RegisterWithEmail = ({ onSwitchToTelegram, onSwitchToLogin, onRegisterSuccess, initialReferralCode }: RegisterWithEmailProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: initialReferralCode || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsWarning, setShowTermsWarning] = useState(false);
  const [referrerPreview, setReferrerPreview] = useState<ReferrerPreview | null>(null);
  const [referralVerified, setReferralVerified] = useState(false);
  const [verifyingReferral, setVerifyingReferral] = useState(false);

  // Auto-verify referral code from URL
  useEffect(() => {
    if (initialReferralCode) {
      verifyReferralCode(initialReferralCode);
    }
  }, [initialReferralCode]);

  const verifyReferralCode = async (code: string) => {
    if (!code.trim()) {
      setReferrerPreview(null);
      setReferralVerified(false);
      return;
    }

    setVerifyingReferral(true);
    try {
      const { data } = await supabase.functions.invoke('user-profile-data', {
        body: { profileId: code, publicView: true },
      });

      // If profileId didn't work, try by referral_code using a dedicated approach
      // We need to search by referral_code, so let's use the edge function differently
      const { data: searchData } = await supabase.functions.invoke('verify-referral', {
        body: { referralCode: code.toUpperCase() },
      });

      if (searchData?.referrer) {
        setReferrerPreview({
          first_name: searchData.referrer.first_name,
          telegram_username: searchData.referrer.telegram_username,
          avatar_url: searchData.referrer.avatar_url,
        });
        setReferralVerified(true);
      } else {
        setReferrerPreview(null);
        setReferralVerified(false);
      }
    } catch {
      setReferrerPreview(null);
      setReferralVerified(false);
    } finally {
      setVerifyingReferral(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setShowTermsWarning(false);
  };

  const handleReferralCodeBlur = () => {
    if (formData.referralCode.trim()) {
      verifyReferralCode(formData.referralCode);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.email) return 'Введите адрес электронной почты';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Введите корректный адрес электронной почты';
    if (!formData.password) return 'Введите пароль';
    if (formData.password.length < 6) return 'Пароль должен содержать минимум 6 символов';
    if (formData.password !== formData.confirmPassword) return 'Пароли не совпадают';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setShowTermsWarning(false);

    if (!agreedToTerms) {
      setShowTermsWarning(true);
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Use referral code from form, or default to admin
      const referralCode = formData.referralCode.trim() || ADMIN_REFERRAL_CODE;

      const { data, error: signUpError } = await supabaseAuth.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            referral_code: referralCode,
          },
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Пользователь с таким email уже зарегистрирован');
        } else if (signUpError.message.includes('valid email')) {
          setError('Введите корректный адрес электронной почты');
        } else if (signUpError.message.includes('password')) {
          setError('Пароль слишком слабый. Используйте минимум 6 символов');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (data.user) {
        if (data.user.identities?.length === 0) {
          setError('Пользователь с таким email уже зарегистрирован');
          return;
        }

        if (!data.session) {
          setSuccessMessage('Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.');
          setFormData({ email: '', password: '', confirmPassword: '', referralCode: '' });
          setAgreedToTerms(false);
        } else {
          onRegisterSuccess?.(data.user);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl">Регистрация</CardTitle>
        <CardDescription>Создайте аккаунт для доступа к сервису</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
              {successMessage}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Электронная почта</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@mail.ru"
              value={formData.email}
              onChange={handleChange}
              className="bg-background/50"
              autoComplete="email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Минимум 6 символов"
                value={formData.password}
                onChange={handleChange}
                className="bg-background/50 pr-10"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={formData.password} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Повторите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={cn(
                  "bg-background/50 pr-10",
                  formData.confirmPassword && formData.password !== formData.confirmPassword && "border-destructive"
                )}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-destructive">Пароли не совпадают</p>
            )}
          </div>

          {/* Referral Code Input */}
          <div className="space-y-2">
            <Label htmlFor="referralCode" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Реферальный код (необязательно)
            </Label>
            <div className="relative">
              <Input
                id="referralCode"
                name="referralCode"
                type="text"
                placeholder="Введите код пригласителя"
                value={formData.referralCode}
                onChange={handleChange}
                onBlur={handleReferralCodeBlur}
                className={cn(
                  "bg-background/50 pr-10 uppercase",
                  referralVerified && "border-green-500"
                )}
              />
              {referralVerified && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {verifyingReferral && (
              <p className="text-xs text-muted-foreground">Проверка кода...</p>
            )}
            {referrerPreview && referralVerified && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-2 text-xs">
                <Check className="h-3 w-3 text-green-500 shrink-0" />
                <span>Пригласитель: <strong>{referrerPreview.first_name || 'Пользователь'}</strong>
                  {referrerPreview.telegram_username && ` (@${referrerPreview.telegram_username})`}
                </span>
              </div>
            )}
            {!initialReferralCode && !formData.referralCode && (
              <p className="text-xs text-muted-foreground">
                Если у вас нет реферального кода, регистрация будет выполнена под администратором проекта
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => {
                  setAgreedToTerms(checked as boolean);
                  setShowTermsWarning(false);
                }}
                className={cn(
                  "mt-0.5",
                  showTermsWarning && !agreedToTerms && "border-destructive"
                )}
              />
              <label
                htmlFor="terms"
                className={cn(
                  "text-sm leading-relaxed cursor-pointer",
                  showTermsWarning && !agreedToTerms && "text-destructive"
                )}
              >
                Я даю согласие на обработку персональных данных в соответствии с{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  политикой конфиденциальности
                </a>
              </label>
            </div>
            {showTermsWarning && !agreedToTerms && (
              <p className="flex items-center gap-1.5 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" />
                Необходимо дать согласие на обработку персональных данных
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Уже есть аккаунт?</span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline"
            >
              Войти
            </button>
          </div>
          
          {onSwitchToTelegram && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={onSwitchToTelegram}
              type="button"
            >
              Войти через Telegram
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};
