import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { initiateAuth, verifyAuthCode } from '@/lib/api';
import { useTelegramContext } from './TelegramProvider';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [telegramIdentifier, setTelegramIdentifier] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { refetchAuth, setAuthenticatedState } = useTelegramContext();

  const handleInitiateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Проверяем, является ли введённое значение числом (ID) или никнеймом
    let telegramId: number | undefined;
    let telegramUsername: string | undefined;

    // Проверяем, является ли введённое значение числом
    if (/^\d+$/.test(telegramIdentifier.trim())) {
      telegramId = Number(telegramIdentifier.trim());
    } else {
      // Убираем @ из начала, если он есть
      telegramUsername = telegramIdentifier.trim().replace(/^@/, '');
    }

    try {
      const result = await initiateAuth(telegramId, telegramUsername);

      if (result.success) {
        toast.success('Код аутентификации отправлен в ваш Telegram');
        setStep('verify');
      } else if (result.userNotFound) {
        setError(result.message || 'Пользователь не найден в системе. Пожалуйста, зарегистрируйтесь через бота.');
      } else {
        setError(result.error || 'Не удалось инициировать аутентификацию');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при инициации аутентификации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await verifyAuthCode(authCode);

      if (result.success) {
        toast.success('Аутентификация успешна!');
        // Устанавливаем состояние аутентификации напрямую
        if (result.profile && result.balance && result.referralStats) {
          setAuthenticatedState(
            result.profile as AuthProfile,
            result.balance as AuthBalance,
            result.referralStats as AuthReferralStats,
            result.role || 'user'
          );
        }
        onClose();
      } else {
        setError(result.error || 'Неверный код');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при проверке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryRegister = () => {
    window.open('https://t.me/Keystone_Tech_Robot', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white backdrop:bg-white">
        <DialogHeader>
          <DialogTitle>Вход в аккаунт</DialogTitle>
          <DialogDescription>
            Введите ваш Telegram ID или никнейм для входа
          </DialogDescription>
        </DialogHeader>

        {step === 'login' ? (
          <form onSubmit={handleInitiateAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegramIdentifier">Telegram ID или Никнейм</Label>
              <Input
                id="telegramIdentifier"
                type="text"
                placeholder="Введите ID или @никнейм"
                value={telegramIdentifier}
                onChange={(e) => setTelegramIdentifier(e.target.value)}
              />
            </div>

            {error && (
              <div className="space-y-2">
                <p className="text-red-500 text-sm">{error}</p>
                {error.includes('Пользователь не найден') && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTryRegister}
                    className="w-full"
                  >
                    Перейти к регистрации
                  </Button>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Загрузка...' : 'Получить код'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="authCode">Код подтверждения</Label>
              <Input
                id="authCode"
                type="text"
                placeholder="Введите 6-значный код"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Мы отправили 6-значный код в ваш Telegram. Пожалуйста, проверьте сообщения от бота.
            </p>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Проверка...' : 'Войти'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('login')}
              >
                Назад
              </Button>
            </div>
          </form>
        )}

        {!(error && error.includes('Пользователь не найден')) && (
          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground">
              Не можете войти?{' '}
              <button
                onClick={handleTryRegister}
                className="text-primary underline hover:no-underline"
              >
                Пройдите регистрацию через бота
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;