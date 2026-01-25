import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSupportTickets, Ticket, ChatMessage } from '@/hooks/useSupportTickets';
import { Send, X, MessageCircle } from 'lucide-react';

interface SupportChatViewProps {
  activeTicket: Ticket | null;
  onCloseChat: () => void;
  newlyCreatedTicket?: Ticket; // Новый тикет для отображения уведомления
}

const SupportChatView = ({ activeTicket, onCloseChat, newlyCreatedTicket }: SupportChatViewProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { profile } = useTelegramAuth();
  const { messages, sendMessage, fetchMessages, updateTicketStatus } = useSupportTickets();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загружаем сообщения при открытии чата
  useEffect(() => {
    if (activeTicket) {
      fetchMessages(activeTicket.id);
    }
  }, [activeTicket, fetchMessages]);

  // Состояние для отображения уведомления о создании тикета
  const [showCreationNotification, setShowCreationNotification] = useState(false);
  const [creationNotificationMessage, setCreationNotificationMessage] = useState('');

  // Показываем уведомление о создании тикета
  useEffect(() => {
    if (newlyCreatedTicket && activeTicket && newlyCreatedTicket.id === activeTicket.id && !showCreationNotification) {
      setCreationNotificationMessage(`Ваш тикет #${newlyCreatedTicket.id.substring(0, 8)} создан. Ожидайте ответа.`);
      setShowCreationNotification(true);

      // Автоматически скрываем уведомление через 3 секунды
      const timer = setTimeout(() => {
        setShowCreationNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [newlyCreatedTicket, activeTicket, showCreationNotification]);

  // Прокручиваем к последнему сообщению
  useEffect(() => {
    scrollToBottom();
  }, [messages[activeTicket?.id || '']?.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !profile || !activeTicket || isSending) {
      return;
    }

    try {
      setIsSending(true);

      await sendMessage(
        activeTicket.id,
        profile.id,
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
    if (!activeTicket) return;

    try {
      await updateTicketStatus(activeTicket.id, 'closed');
      // Вызываем onCloseChat, который в ProfileView теперь обновляет статус тикета
      onCloseChat();
    } catch (error) {
      console.error('Error closing ticket:', error);
      // Даже если произошла ошибка при обновлении статуса, все равно закрываем чат
      onCloseChat();
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    return <p className="whitespace-pre-wrap">{msg.message}</p>;
  };

  if (!activeTicket) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет активных обращений</h3>
            <p className="text-muted-foreground mb-4">
              Создайте тикет в службу поддержки, чтобы начать общение
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ticketMessages = messages[activeTicket.id] || [];

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Чат поддержки #{activeTicket.id.substring(0, 8)}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCloseChat}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {/* Уведомление о создании тикета */}
        {showCreationNotification && (
          <div className="m-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center">
            <p className="text-blue-700 dark:text-blue-300">{creationNotificationMessage}</p>
          </div>
        )}
        <div className="border rounded-lg m-4">
          <ScrollArea className="h-64 p-4">
            <div className="space-y-4">
              {ticketMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Начните переписку с поддержкой
                </div>
              ) : (
                ticketMessages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.2), ease: [0.22, 1, 0.36, 1] }}
                    className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        msg.is_admin_reply
                          ? 'glass glass-border text-foreground'
                          : 'text-white bg-[var(--gradient-gold)] shadow-card-gold'
                      }`}
                    >
                      <div className="text-[11px] opacity-70 mb-1">
                        {msg.is_admin_reply ? 'Техподдержка' : 'Вы'}
                      </div>
                      {renderMessageContent(msg)}
                      <div className="text-[11px] opacity-70 mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </motion.div>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportChatView;