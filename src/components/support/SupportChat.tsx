import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSupportTickets, ChatMessage, Ticket } from '@/hooks/useSupportTickets';
import { Send, X, Lock, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SupportChatProps {
  ticketId: string;
  ticket?: Ticket;
  onClose: () => void;
  isAdmin?: boolean;
}

const SupportChat = ({ ticketId, ticket, onClose, isAdmin = false }: SupportChatProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { profile } = useTelegramAuth();
  const {
    messages,
    messagesLoading,
    sendMessage,
    fetchMessages,
    updateTicketStatus,
    subscribeToChat,
    canUserReply
  } = useSupportTickets();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Загружаем сообщения при открытии чата
  useEffect(() => {
    if (ticketId) {
      fetchMessages(ticketId);
    }
  }, [ticketId, fetchMessages]);

  // Подписываемся на realtime обновления
  useEffect(() => {
    if (ticketId) {
      const unsubscribe = subscribeToChat(ticketId);
      return unsubscribe;
    }
  }, [ticketId, subscribeToChat]);

  // Прокручиваем к последнему сообщению
  useEffect(() => {
    scrollToBottom();
  }, [messages[ticketId]]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !profile || isSending) {
      return;
    }

    // Проверяем, может ли пользователь отправлять сообщения
    if (!isAdmin && !canUserReply(ticketId)) {
      return;
    }

    try {
      setIsSending(true);

      await sendMessage(
        ticketId,
        profile.id,
        isAdmin ? 'admin' : 'user',
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
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.message_type === 'system') {
      return (
        <div className="text-center py-4">
          <div className="inline-block bg-muted/50 rounded-xl px-4 py-3 max-w-md">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
          </div>
        </div>
      );
    }

    return <p className="whitespace-pre-wrap break-words">{msg.message}</p>;
  };

  const fetchedMessages = messages[ticketId] || [];
  const isMessagesLoading = messagesLoading[ticketId] ?? (fetchedMessages.length === 0);
  const ticketStatus = ticket?.status || 'open';
  const isClosed = ticketStatus === 'closed' || ticketStatus === 'resolved';

  return (
    <Card className="w-full h-full flex flex-col bg-background border-0 rounded-none sm:rounded-2xl sm:border">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              {isAdmin ? `Тикет #${ticketId.substring(0, 8)}` : 'Чат поддержки'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge 
                variant={
                  ticketStatus === 'open' ? 'secondary' : 
                  ticketStatus === 'in_progress' ? 'default' : 
                  'outline'
                }
                className="text-xs"
              >
                {ticketStatus === 'open' && 'Ожидает ответа'}
                {ticketStatus === 'in_progress' && 'В работе'}
                {ticketStatus === 'closed' && 'Закрыт'}
                {ticketStatus === 'resolved' && 'Решен'}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="py-4 space-y-3">
            <AnimatePresence>
              {isMessagesLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground py-12"
                >
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Загрузка сообщений...</p>
                </motion.div>
              ) : fetchedMessages.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Показываем “старт” чата из данных тикета, даже если в БД еще нет сообщений */}
                  <div className="text-center py-4">
                    <div className="inline-block bg-muted/50 rounded-xl px-4 py-3 max-w-md">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        📋 Тикет создан
                        {ticket?.category ? `\n\nКатегория: ${ticket.category}` : ''}
                        {ticket?.subject ? `\nТема: ${ticket.subject}` : ''}
                        {ticket?.message ? `\n\n${ticket.message}` : ''}
                        {isAdmin
                          ? '\n\nНапишите первое сообщение пользователю, чтобы перевести тикет в работу.'
                          : '\n\n⏳ Ожидайте ответа от поддержки. Вы сможете написать после первого ответа поддержки.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                fetchedMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {msg.message_type === 'system' ? (
                      renderMessageContent(msg)
                    ) : (
                      <div className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                            msg.is_admin_reply
                              ? 'bg-secondary text-secondary-foreground rounded-tl-md'
                              : 'bg-primary text-primary-foreground rounded-tr-md'
                          }`}
                        >
                          {/* Sender label for admin view */}
                          {isAdmin && (
                            <p className={`text-xs font-medium mb-1 ${msg.is_admin_reply ? 'text-primary' : 'text-primary-foreground/80'}`}>
                              {msg.is_admin_reply ? '👨‍💼 Поддержка' : '👤 Пользователь'}
                            </p>
                          )}
                          {renderMessageContent(msg)}
                          <div className={`text-xs mt-1.5 flex items-center gap-1 ${msg.is_admin_reply ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {!msg.is_admin_reply && (
                              <CheckCircle className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        {!isClosed ? (
          <div className="border-t bg-card/50 backdrop-blur-sm p-3 space-y-3">
            {(() => {
              const userCanReply = isAdmin || canUserReply(ticketId);
              if (!userCanReply && !isAdmin) {
                return (
                  <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">Ожидайте ответа от поддержки</span>
                  </div>
                );
              }
              return (
                <>
                  <div className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={isAdmin ? "Напишите ответ..." : "Напишите сообщение..."}
                      className="flex-1 resize-none min-h-[44px] max-h-[120px] rounded-xl bg-background"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      size="icon"
                      className="h-11 w-11 rounded-xl shrink-0"
                      disabled={isSending || !message.trim()}
                      onClick={handleSubmit}
                    >
                      {isSending ? (
                        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleTicketClose}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Закрыть тикет
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="border-t bg-muted/30 p-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Тикет закрыт</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupportChat;