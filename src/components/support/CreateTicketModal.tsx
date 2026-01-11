import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import SupportChat from './SupportChat';

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

  const { profile } = useTelegramAuth();
  const { createTicket } = useSupportTickets();

  console.log('CreateTicketModal render - profile:', profile, 'isOpen:', isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile || !category || !subject || !message || isSubmitting) {
      console.log('Validation failed:', { profile, category, subject, message, isSubmitting });
      return;
    }

    // Устанавливаем флаг, чтобы предотвратить повторные нажатия
    setIsSubmitting(true);

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

      // Закрываем модальное окно после успешного создания тикета
      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      // Сбрасываем флаг в любом случае
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