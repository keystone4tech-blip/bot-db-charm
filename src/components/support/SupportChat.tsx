import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSupportTickets, ChatMessage } from '@/hooks/useSupportTickets';
import { Send, X } from 'lucide-react';

interface SupportChatProps {
  ticketId: string;
  onClose: () => void;
}

const SupportChat = ({ ticketId, onClose }: SupportChatProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useTelegramAuth();
  const { messages, sendMessage, fetchMessages, updateTicketStatus } = useSupportTickets();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загружаем сообщения при открытии чата
  useEffect(() => {
    if (ticketId) {
      fetchMessages(ticketId);
    }
  }, [ticketId, fetchMessages]);

  // Прокручиваем к последнему сообщению
  useEffect(() => {
    scrollToBottom();
  }, [messages[ticketId]]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !user || isSending) {
      return;
    }

    try {
      setIsSending(true);

      await sendMessage(
        ticketId,
        user.id,
        'user',
        message
      );

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTicketClose = async () => {
    try {
      await updateTicketStatus(ticketId, 'closed');
      onClose();
    } catch (error) {
      console.error('Error closing ticket:', error);
      // Даже если произошла ошибка при обновлении статуса, все равно закрываем чат
      onClose();
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    // В Supabase структура сообщений может отличаться
    // В текущей реализации файлы могут не поддерживаться в этой таблице
    // Но если они есть, обрабатываем их

    return <p className="whitespace-pre-wrap">{msg.message}</p>;
  };

  const ticketMessages = messages[ticketId] || [];

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Чат поддержки</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {ticketMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Начните переписку с поддержкой
              </div>
            ) : (
              ticketMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender_type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {renderMessageContent(msg)}
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 resize-none"
              rows={2}
            />
            <Button type="submit" size="sm" disabled={isSending}>
              {isSending ? (
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-between mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTicketClose}
            >
              Закрыть тикет
            </Button>
            <div className="text-xs text-muted-foreground">
              Поддерживается отправка сообщений
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupportChat;