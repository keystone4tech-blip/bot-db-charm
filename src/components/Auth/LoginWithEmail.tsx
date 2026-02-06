// src/components/Auth/LoginWithEmail.tsx
import { useState } from 'react';
import { loginWithEmailSupabase } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

interface LoginWithEmailProps {
  onSwitchToTelegram?: () => void;
  onSwitchToRegister?: () => void;
  onLoginSuccess?: (userData: any) => void;
}

export const LoginWithEmail = ({ onSwitchToTelegram, onSwitchToRegister, onLoginSuccess }: LoginWithEmailProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithEmailSupabase(formData.email, formData.password);

      if (result.success && result.profile) {
        onLoginSuccess?.(result.profile);
      } else {
        // Обрабатываем различные ошибки Supabase
        const errorMessage = result.error || 'Ошибка входа';
        if (errorMessage.includes('Invalid login credentials')) {
          setError('Неверный email или пароль');
        } else if (errorMessage.includes('Email not confirmed')) {
          setError('Email не подтверждён. Проверьте почту для подтверждения');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl">Вход</CardTitle>
        <CardDescription>Войдите в свой аккаунт</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
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
                placeholder="Введите пароль"
                value={formData.password}
                onChange={handleChange}
                className="bg-background/50 pr-10"
                autoComplete="current-password"
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
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Вход...
              </>
            ) : (
              'Войти'
            )}
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Нет аккаунта?</span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary hover:underline"
            >
              Зарегистрироваться
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
