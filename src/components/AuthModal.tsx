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
  const [telegramId, setTelegramId] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { refetchAuth } = useTelegramContext();

  const handleInitiateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await initiateAuth(
        telegramId ? Number(telegramId) : undefined,
        telegramUsername || undefined
      );

      if (result.success) {
        toast.success('Код аутентификации отправлен в ваш Telegram');
        setStep('verify');
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
        refetchAuth(); // Обновляем состояние аутентификации
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
    window.open('https://t.me/keystone_tech_bot', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Вход в аккаунт</DialogTitle>
          <DialogDescription>
            Введите ваш Telegram ID или никнейм для входа
          </DialogDescription>
        </DialogHeader>

        {step === 'login' ? (
          <form onSubmit={handleInitiateAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegramId">Telegram ID</Label>
              <Input
                id="telegramId"
                type="number"
                placeholder="Введите ваш Telegram ID"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramUsername">Telegram Никнейм</Label>
              <Input
                id="telegramUsername"
                type="text"
                placeholder="Введите ваш Telegram никнейм (без @)"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

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
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;