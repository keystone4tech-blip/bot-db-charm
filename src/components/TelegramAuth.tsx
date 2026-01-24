// src/components/TelegramAuth.tsx
import { useEffect } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface TelegramAuthProps {
  onSwitchToEmailRegister?: () => void;
  onSwitchToEmailLogin?: () => void;
  onAuthSuccess?: (userData: any) => void;
}

export const TelegramAuth = ({ 
  onSwitchToEmailRegister, 
  onSwitchToEmailLogin, 
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
      <Card className="w-full max-w-md">
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (authError) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ошибка аутентификации Telegram</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{authError}</p>
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>С возвращением!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Вы вошли как:</p>
          <p className="font-semibold">{authProfile.first_name} {authProfile.last_name}</p>
          <p className="text-sm text-gray-500">@{authProfile.telegram_username}</p>
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
          <Button
            variant="outline"
            onClick={onSwitchToEmailLogin}
            className="w-full"
          >
            Перейти к аккаунту по почте
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Аутентификация через Telegram</CardTitle>
        <CardDescription>
          Откройте это приложение через нашего Telegram-бота для входа
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-center">🔒 Безопасная аутентификация через Telegram</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          onClick={() => window.location.href = 'https://t.me/Keystone_Tech_Robot'}
          className="w-full"
        >
          Открыть Telegram-бота
        </Button>
        
        <div className="flex justify-between w-full pt-2">
          <Button
            variant="outline"
            onClick={onSwitchToEmailRegister}
            className="w-[48%]"
          >
            Регистрация по почте
          </Button>
          
          <Button
            variant="outline"
            onClick={onSwitchToEmailLogin}
            className="w-[48%]"
          >
            Вход по почте
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
