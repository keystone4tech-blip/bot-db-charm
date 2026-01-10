import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSupportTickets } from '@/hooks/useSupportTickets';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTicketModal = ({ isOpen, onClose }: CreateTicketModalProps) => {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { user } = useTelegramAuth();
  const { createTicket, error: hookError, loading: hookLoading } = useSupportTickets();

  // Объединяем ошибки из хука и локальные ошибки
  const combinedError = hookError || error;

  // Сброс состояния при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setCategory('');
      setSubject('');
      setMessage('');
      setError(null);
      setProgress(0);
      setCurrentStep('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !category || !subject || !message || isSubmitting) {
      console.log('Validation failed:', {
        hasUser: !!user,
        hasCategory: !!category,
        hasSubject: !!subject,
        hasMessage: !!message,
        isSubmitting
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setProgress(0);
      setCurrentStep('Проверка данных...');

      // Имитация прогресса
      setProgress(20);
      setCurrentStep('Подготовка запроса...');

      await new Promise(resolve => setTimeout(resolve, 500)); // Имитация задержки

      setProgress(50);
      setCurrentStep('Создание тикета...');

      const newTicket = await createTicket(
        user.id,
        category,
        subject,
        message
      );

      setProgress(80);
      setCurrentStep('Открытие чата...');

      await new Promise(resolve => setTimeout(resolve, 300)); // Имитация задержки

      setProgress(100);
      setCurrentStep('Готово!');

      // После успешного создания тикета открываем чат
      setActiveTicketId(newTicket.id);
    } catch (err) {
      console.error('Error creating ticket:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при создании тикета';
      setError(`Ошибка создания тикета: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatClose = () => {
    setActiveTicketId(null);
    // Закрываем модальное окно при закрытии чата
    onClose();
  };

  const categories = [
    { value: 'technical', label: 'Технические вопросы' },
    { value: 'billing', label: 'Платежи и подписки' },
    { value: 'account', label: 'Проблемы с аккаунтом' },
    { value: 'feature-request', label: 'Предложения по улучшению' },
    { value: 'other', label: 'Другое' },
  ];

  // Если активен чат, показываем его
  if (activeTicketId) {
    // Здесь должен быть компонент SupportChat, но мы его импортируем в основном компоненте
    return null; // Возвращаем null, так как чат будет отображаться в основном компоненте
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать обращение в поддержку</DialogTitle>
          <DialogDescription>
            Заполните форму, чтобы создать тикет в службу поддержки
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {combinedError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription className="break-words">
                {combinedError}
              </AlertDescription>
            </Alert>
          )}

          {isSubmitting && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Создание тикета</CardTitle>
                <CardDescription>
                  {currentStep || 'Обработка запроса...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <div className="text-sm text-muted-foreground text-center">
                    {progress}% завершено
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Категория
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Тема обращения
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Кратко опишите проблему"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Сообщение
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Подробно опишите вашу проблему или вопрос..."
              rows={5}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button type="submit" disabled={!category || !subject || !message || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                'Создать тикет'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketModal;