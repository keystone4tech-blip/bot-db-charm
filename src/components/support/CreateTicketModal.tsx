import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSupportTickets, Ticket } from '@/hooks/useSupportTickets';
import { toast } from 'sonner';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticket: Ticket) => void;
}

const CreateTicketModal = ({ isOpen, onClose, onTicketCreated }: CreateTicketModalProps) => {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInProgress = useRef(false);

  const { profile } = useTelegramAuth();
  const { createTicket, fetchTickets } = useSupportTickets();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitInProgress.current) {
      return;
    }

    if (!profile || !category || !subject || !message) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    // Проверяем, есть ли уже активный тикет у пользователя
    try {
      const userTickets = await fetchTickets(profile.id);
      const activeTicket = userTickets.find((ticket: Ticket) => 
        ticket.status !== 'closed' && ticket.status !== 'resolved'
      );

      if (activeTicket) {
        toast.error('У вас уже есть активное обращение. Дождитесь ответа или закройте текущее обращение.');
        return;
      }
    } catch (error) {
      console.error('Error checking for active tickets:', error);
    }

    submitInProgress.current = true;
    setIsSubmitting(true);

    try {
      const newTicket = await createTicket(
        profile.id,
        category,
        subject,
        message
      );

      // Сбрасываем форму
      setCategory('');
      setSubject('');
      setMessage('');

      // Вызываем колбэк
      if (onTicketCreated) {
        onTicketCreated(newTicket);
      }

      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
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
      <DialogContent className="max-w-lg mx-4 sm:mx-auto max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Создать обращение</DialogTitle>
          <DialogDescription>
            Опишите вашу проблему, и мы ответим как можно скорее
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Категория
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl">
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
              className="rounded-xl"
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
              rows={4}
              className="rounded-xl resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={!category || !subject || !message || isSubmitting}
              className="flex-1 rounded-xl"
            >
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketModal;