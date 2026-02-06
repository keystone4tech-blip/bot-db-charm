// src/components/TelegramAuth.tsx
import { useEffect } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface TelegramAuthProps {
  onSwitchToEmailRegister?: () => void;
  onSwitchToEmailLogin?: () => void;
  onSwitchToOTPAuth?: () => void;
  onAuthSuccess?: (userData: any) => void;
}

export const TelegramAuth = ({ 
  onSwitchToEmailRegister, 
  onSwitchToEmailLogin, 
  onSwitchToOTPAuth,
  onAuthSuccess 
}: TelegramAuthProps) => {
  const { 
    isAuthenticated, 
    isLoading: isAuthLoading, 
    error: authError, 
    profile: authProfile,
    refetch: refetchAuth
  } = useTelegramAuth();

  useEffect(() => {
    if (isAuthenticated && authProfile) {
      onAuthSuccess?.({
        id: authProfile.id,
        telegram_id: authProfile.telegram_id,
        telegram_username: authProfile.telegram_username,
        first_name: authProfile.first_name,
        last_name: authProfile.last_name,
        referral_code: authProfile.referral_code
      });
    }
  }, [isAuthenticated, authProfile, onAuthSuccess]);

  if (isAuthLoading) {
    return (
      <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur">
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (authError) {
    return (
      <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle>Ошибка аутентификации</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{authError}</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={refetchAuth} className="w-full">
            Повторить попытку
          </Button>
          <Button
            variant="outline"
            onClick={onSwitchToEmailLogin}
            className="w-full"
          >
            Вход по почте
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isAuthenticated && authProfile) {
    return (
      <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle>С возвращением!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Вы вошли как:</p>
          <p className="font-semibold">{authProfile.first_name} {authProfile.last_name}</p>
          {authProfile.telegram_username && (
            <p className="text-sm text-muted-foreground">@{authProfile.telegram_username}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => {
              onAuthSuccess?.({
                id: authProfile.id,
                telegram_id: authProfile.telegram_id,
                telegram_username: authProfile.telegram_username,
                first_name: authProfile.first_name,
                last_name: authProfile.last_name,
                referral_code: authProfile.referral_code
              });
            }}
            className="w-full"
          >
            Продолжить работу
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Браузерный режим - показываем опции входа
  return (
    <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Добро пожаловать!</CardTitle>
        <CardDescription>
          Выберите способ входа в систему
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            🔒 Безопасная аутентификация
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button
          onClick={() => window.location.href = 'https://t.me/Keystone_Tech_Robot'}
          className="w-full"
          variant="default"
        >
          Открыть Telegram-бота
        </Button>
        
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            onClick={onSwitchToEmailRegister}
            className="flex-1"
          >
            Регистрация
          </Button>

          <Button
            variant="outline"
            onClick={onSwitchToEmailLogin}
            className="flex-1"
          >
            Вход
          </Button>
        </div>

        {onSwitchToOTPAuth && (
          <Button
            variant="link"
            onClick={onSwitchToOTPAuth}
            className="text-sm"
          >
            Войти по ID/никнейму
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
