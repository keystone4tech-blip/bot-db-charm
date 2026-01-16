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
import { UserProfilePopup } from '@/components/admin/UserProfilePopup';

interface SupportChatProps {
  ticketId: string;
  ticket?: Ticket;
  onClose: () => void;
  onStatusChange?: (status: 'open' | 'in_progress' | 'closed' | 'resolved') => void;
  isAdmin?: boolean;
}

const SupportChat = ({ ticketId, ticket, onClose, isAdmin = false }: SupportChatProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { profile } = useTelegramAuth();
  const {
    messages,
    messagesLoading,
    messagesFetched,
    sendMessage,
    fetchMessages,
    updateTicketStatus,
    subscribeToChat,
    canUserReply,
  } = useSupportTickets();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Загружаем сообщения при открытии чата
  useEffect(() => {
    if (ticketId) {
      fetchMessages(ticketId);
    }
  }, [ticketId, fetchMessages]);

  // Подписываемся на обновления
  useEffect(() => {
    if (ticketId) {
      const unsubscribe = subscribeToChat(ticketId);
      return unsubscribe;
    }
  }, [ticketId, subscribeToChat]);

  // Прокручиваем к последнему сообщению
  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages[ticketId]?.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault?.();

    if (!message.trim() || !profile || isSending) {
      return;
    }

    // Проверяем, может ли пользователь отправлять сообщения
    if (!isAdmin && !canUserReply(ticketId)) {
      return;
    }

    try {
      setIsSending(true);

      await sendMessage(ticketId, profile.id, isAdmin ? 'admin' : 'user', message);

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTicketClose = async () => {
    try {
      const updatedTicket = await updateTicketStatus(ticketId, 'closed');
      if (updatedTicket) {
        // Уведомляем родительский компонент об изменении статуса
        onStatusChange?.(updatedTicket.status);
      }
      onClose();
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    if ((msg.message_type ?? 'text') === 'system') {
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

  const fetchedMessages = (messages[ticketId] || []).map((m) => ({
    ...m,
    message_type: m.message_type ?? 'text',
  }));

  const hasFetched = Boolean(messagesFetched?.[ticketId]);
  const isMessagesLoading = Boolean(messagesLoading[ticketId]) && !hasFetched;

  const ticketStatus = ticket?.status || 'open';
  const isClosed = ticketStatus === 'closed' || ticketStatus === 'resolved';

  // Get user display name for admin view
  const getUserDisplayName = () => {
    if (!ticket?.user_profile) return 'Пользователь';
    const { first_name, last_name, telegram_username } = ticket.user_profile;
    if (first_name || last_name) {
      return [first_name, last_name].filter(Boolean).join(' ');
    }
    return telegram_username ? `@${telegram_username}` : 'Пользователь';
  };

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
              {isAdmin ? (
                <span 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => ticket?.user_id && setShowUserProfile(true)}
                >
                  💬 {getUserDisplayName()}
                </span>
              ) : (
                'Чат поддержки'
              )}
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
              {isAdmin && (
                <span className="text-xs text-muted-foreground">
                  #{ticketId.substring(0, 8)}
                </span>
              )}
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
                fetchedMessages.map((msg, index) => {
                  const isSystem = (msg.message_type ?? 'text') === 'system';
                  const isOwn = isAdmin ? msg.is_admin_reply : !msg.is_admin_reply;
                  const showSenderLabel = isAdmin || msg.is_admin_reply; // пользователю показываем хотя бы "Поддержка" для ответов

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {isSystem ? (
                        renderMessageContent(msg)
                      ) : (
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-tr-md'
                                : 'bg-secondary text-secondary-foreground rounded-tl-md'
                            }`}
                          >
                            {showSenderLabel && (
                              <p 
                                className={`text-xs font-medium mb-1 ${isOwn ? 'text-primary-foreground/80' : 'text-primary'} ${isAdmin && !msg.is_admin_reply ? 'cursor-pointer hover:underline' : ''}`}
                                onClick={() => {
                                  if (isAdmin && !msg.is_admin_reply && ticket?.user_id) {
                                    setShowUserProfile(true);
                                  }
                                }}
                              >
                                {msg.is_admin_reply ? '👨‍💼 Поддержка' : `👤 ${isAdmin ? getUserDisplayName() : 'Вы'}`}
                              </p>
                            )}
                            {renderMessageContent(msg)}
                            <div className={`text-xs mt-1.5 flex items-center gap-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {!msg.is_admin_reply && <CheckCircle className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
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
                <form onSubmit={handleSubmit} className="flex gap-2">
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
                    type="submit"
                    size="icon"
                    className="h-11 w-11 rounded-xl shrink-0"
                    disabled={isSending || !message.trim()}
                  >
                    {isSending ? (
                      <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              );
            })()}

            {(!isClosed && (isAdmin || canUserReply(ticketId))) && (
              <div className="flex justify-center pt-3">
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
            )}
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

      {/* User Profile Popup for Admin */}
      {isAdmin && ticket?.user_id && (
        <UserProfilePopup
          userId={ticket.user_id}
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          userName={getUserDisplayName()}
        />
      )}
    </Card>
  );
};

export default SupportChat;