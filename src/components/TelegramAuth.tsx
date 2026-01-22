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
          <CardTitle>Telegram Authentication Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{authError}</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={refetchAuth} className="w-full">
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={onSwitchToEmailLogin}
            className="w-full"
          >
            Login with Email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isAuthenticated && authProfile) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You are authenticated as:</p>
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
            Continue to App
          </Button>
          <Button
            variant="outline"
            onClick={onSwitchToEmailLogin}
            className="w-full"
          >
            Switch to Email Account
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authenticate with Telegram</CardTitle>
        <CardDescription>
          Open this app through our Telegram bot to authenticate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-center">🔒 Secure Telegram Authentication</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          onClick={() => window.location.href = 'https://t.me/Keystone_Tech_bot'} 
          className="w-full"
        >
          Open Telegram Bot
        </Button>
        
        <div className="flex justify-between w-full pt-2">
          <Button
            variant="outline"
            onClick={onSwitchToEmailRegister}
            className="w-[48%]"
          >
            Register with Email
          </Button>
          
          <Button
            variant="outline"
            onClick={onSwitchToEmailLogin}
            className="w-[48%]"
          >
            Login with Email
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};