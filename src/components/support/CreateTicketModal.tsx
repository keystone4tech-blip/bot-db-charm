import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import SupportChat from './SupportChat';

console.log('CreateTicketModal component loaded');

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

  const { user, refetch } = useTelegramAuth();
  const { createTicket, error, loading: ticketLoading } = useSupportTickets();

  console.log('CreateTicketModal render - user:', user, 'isOpen:', isOpen, 'error:', error);

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
      // Ошибки теперь обрабатываются в хуке, поэтому не нужно устанавливать setError здесь

      console.log('Starting ticket creation process...', {
        userId: user.id,
        category,
        subject,
        messageLength: message.length
      });

      const newTicket = await createTicket(
        user.id,
        category,
        subject,
        message
      );

      console.log('Ticket created successfully:', newTicket);

      // После успешного создания тикета открываем чат
      setActiveTicketId(newTicket.id);
    } catch (error) {
      console.error('Error creating ticket:', error);
      // Ошибки обрабатываются в хуке, но мы можем дополнительно логировать их здесь
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatClose = () => {
    console.log('handleChatClose called');
    setActiveTicketId(null);
    // Не закрываем модальное окно при закрытии чата, а возвращаемся к форме
    // onClose(); // Закрываем модальное окно при закрытии чата
  };

  const categories = [
    { value: 'technical', label: 'Технические вопросы' },
    { value: 'billing', label: 'Платежи и подписки' },
    { value: 'account', label: 'Проблемы с аккаунтом' },
    { value: 'feature-request', label: 'Предложения по улучшению' },
    { value: 'other', label: 'Другое' },
  ];

  if (activeTicketId) {
    return (
      <Dialog open={true} onOpenChange={(open) => {
        // При закрытии диалога (например, через клавишу Escape), возвращаемся к форме
        if (!open) {
          handleChatClose();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden p-0">
          <SupportChat ticketId={activeTicketId} onClose={handleChatClose} />
        </DialogContent>
      </Dialog>
    );
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
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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