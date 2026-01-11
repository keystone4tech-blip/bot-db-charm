import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import SupportChat from './SupportChat';
import { toast } from 'sonner';

console.log('CreateTicketModal component loaded');

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticket: any) => void; // Колбэк, вызываемый при создании тикета
}

const CreateTicketModal = ({ isOpen, onClose }: CreateTicketModalProps) => {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInProgress = useRef(false); // Для предотвращения повторных вызовов

  const { profile } = useTelegramAuth();
  const { createTicket, fetchTickets } = useSupportTickets();

  console.log('CreateTicketModal render - profile:', profile, 'isOpen:', isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем, не выполняется ли уже отправка
    if (submitInProgress.current) {
      return; // Если отправка уже в процессе, выходим
    }

    if (!profile || !category || !subject || !message) {
      console.log('Validation failed:', { profile, category, subject, message });
      return;
    }

    // Проверяем, есть ли уже активный тикет у пользователя
    try {
      const userTickets = await fetchTickets(profile.id);
      const activeTicket = userTickets.find(ticket => ticket.status !== 'closed');

      if (activeTicket) {
        toast.error('У вас уже есть активное обращение в поддержку. Пожалуйста, дождитесь ответа или закройте текущее обращение.');
        return;
      }
    } catch (error) {
      console.error('Error checking for active tickets:', error);
      // Продолжаем создание тикета, если не удалось проверить
    }

    // Устанавливаем флаг, чтобы предотвратить повторные нажатия
    submitInProgress.current = true;
    setIsSubmitting(true);

    // Закрываем окно ДО отправки для предотвращения повторных нажатий
    onClose();

    try {
      console.log('Creating ticket with data:', { userId: profile.id, category, subject, message });

      const newTicket = await createTicket(
        profile.id,
        category,
        subject,
        message
      );

      console.log('Ticket created successfully:', newTicket);

      // Вызываем колбэк при создании тикета
      if (onTicketCreated) {
        onTicketCreated(newTicket);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Ошибка создания тикета. Попробуйте еще раз.');
    } finally {
      // Сбрасываем флаги в любом случае
      submitInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'technical', label: 'Технические вопросы' },
    { value: 'billing', label: 'Платежи и подписки' },
    { value: 'vpn', label: 'VPN / ключи' },
    { value: 'referral', label: 'Рефералы' },
    { value: 'other', label: 'Другое' },
  ];

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
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={!category || !subject || !message || isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать тикет'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketModal;