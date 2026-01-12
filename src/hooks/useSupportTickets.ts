import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface Ticket {
  id: string;
  user_id: string;
  category: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed' | 'resolved';
  priority: string;
  created_at: string;
  updated_at: string;
  // User profile info for admin view
  user_profile?: {
    id: string;
    telegram_id: number;
    telegram_username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: string | null;
    phone: string | null;
  };
}

export interface ChatMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  is_admin_reply: boolean;
  message: string;
  message_type?: 'text' | 'system' | 'file' | 'voice';
  file_url?: string;
  file_name?: string;
  created_at: string;
}

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [messagesLoading, setMessagesLoading] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка тикетов пользователя - возвращает массив
  const fetchTickets = useCallback(async (userId: string): Promise<Ticket[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/support-tickets?user_id=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch tickets');

      const ticketsList = result.tickets || [];
      setTickets(ticketsList);
      return ticketsList;
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Ошибка загрузки тикетов');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка всех тикетов (для администратора)
  const fetchAllTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/support-tickets?admin=true`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch tickets');

      setTickets(result.tickets || []);
    } catch (err) {
      console.error('Error fetching all tickets:', err);
      setError('Ошибка загрузки тикетов');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка сообщений для тикета
  const fetchMessages = useCallback(async (ticketId: string) => {
    try {
      setMessagesLoading((prev) => ({ ...prev, [ticketId]: true }));
      setError(null);

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/support-chat?ticket_id=${ticketId}`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch messages');

      setMessages(prev => ({
        ...prev,
        [ticketId]: result.messages || []
      }));
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Ошибка загрузки сообщений');
    } finally {
      setMessagesLoading((prev) => ({ ...prev, [ticketId]: false }));
    }
  }, []);

  // Создание нового тикета
  const createTicket = async (userId: string, category: string, subject: string, message: string): Promise<Ticket> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Sending ticket creation request:', { user_id: userId, category, subject, message });
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/support-tickets`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId, category, subject, message }),
        }
      );

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (!response.ok) throw new Error(result.error || 'Failed to create ticket');

      const newTicket = result.ticket;

      // Добавляем тикет в список
      setTickets(prev => [newTicket, ...prev]);

      // Добавляем системное сообщение о создании тикета
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        ticket_id: newTicket.id,
        sender_id: 'system',
        is_admin_reply: false,
        message: `📋 Тикет создан\n\n**Категория:** ${getCategoryLabel(category)}\n**Тема:** ${subject}\n\n${message}\n\n⏳ Ожидайте ответа от службы поддержки. Вы сможете написать сообщение после того, как поддержка ответит.`,
        message_type: 'system',
        created_at: new Date().toISOString()
      };

      setMessages(prev => ({
        ...prev,
        [newTicket.id]: [systemMessage]
      }));

      toast.success('Тикет успешно создан!');
      return newTicket;
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Ошибка создания тикета');
      toast.error('Ошибка создания тикета');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Отправка сообщения в чат
  const sendMessage = async (
    ticketId: string,
    senderId: string,
    senderType: 'user' | 'admin',
    message: string,
    messageType: 'text' | 'file' | 'voice' = 'text',
    fileUrl?: string,
    fileName?: string
  ): Promise<ChatMessage> => {
    try {
      const hadAdminReplyBefore = (messages[ticketId] || []).some(
        (m) => m.is_admin_reply && m.message_type !== 'system'
      );

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/support-chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticket_id: ticketId,
            sender_id: senderId,
            is_admin_reply: senderType === 'admin',
            message,
            message_type: messageType,
            file_url: fileUrl,
            file_name: fileName,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to send message');

      // Добавляем сообщение в список
      setMessages(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), result.message]
      }));

      // Если это первое сообщение от админа — переводим тикет в in_progress на бэкенде
      if (senderType === 'admin' && !hadAdminReplyBefore) {
        try {
          const statusResp = await fetch(
            `${SUPABASE_URL}/functions/v1/support-tickets`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ticket_id: ticketId, status: 'in_progress' }),
            }
          );
          const statusResult = await statusResp.json();

          if (statusResp.ok && statusResult?.ticket) {
            setTickets(prev =>
              prev.map(ticket =>
                ticket.id === ticketId ? { ...ticket, status: statusResult.ticket.status } : ticket
              )
            );
          }
        } catch (e) {
          // Не блокируем отправку сообщения из-за обновления статуса
          console.warn('Failed to update ticket status to in_progress:', e);
        }
      }

      return result.message;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка отправки сообщения');
      toast.error('Ошибка отправки сообщения');
      throw err;
    }
  };

  // Обновление статуса тикета
  const updateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'closed' | 'resolved') => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/support-tickets`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticket_id: ticketId, status }),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to update ticket status');

      // Обновляем статус в локальном состоянии
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status: result.ticket.status } : ticket
        )
      );

      // Добавляем системное сообщение о закрытии тикета
      if (status === 'closed') {
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          ticket_id: ticketId,
          sender_id: 'system',
          is_admin_reply: false,
          message: '✅ Тикет закрыт. Спасибо за обращение!',
          message_type: 'system',
          created_at: new Date().toISOString()
        };

        setMessages(prev => ({
          ...prev,
          [ticketId]: [...(prev[ticketId] || []), systemMessage]
        }));
      }

      toast.success(status === 'closed' ? 'Тикет закрыт' : 'Статус обновлен');
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError('Ошибка обновления статуса тикета');
      toast.error('Ошибка обновления статуса');
      throw err;
    }
  };

  // Подписка на realtime обновления чата (polling fallback)
  const subscribeToChat = useCallback((ticketId: string) => {
    // Используем polling каждые 3 секунды
    const interval = setInterval(() => {
      fetchMessages(ticketId);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Проверка, может ли пользователь писать (только если админ уже ответил)
  const canUserReply = useCallback((ticketId: string): boolean => {
    const ticketMessages = messages[ticketId] || [];
    // Пользователь может писать, если админ уже ответил
    return ticketMessages.some(msg => msg.is_admin_reply && msg.message_type !== 'system');
  }, [messages]);

  return {
    tickets,
    messages,
    messagesLoading,
    loading,
    error,
    fetchTickets,
    fetchAllTickets,
    fetchMessages,
    createTicket,
    sendMessage,
    updateTicketStatus,
    subscribeToChat,
    canUserReply
  };
};

// Helper function
function getCategoryLabel(category: string): string {
  const categories: Record<string, string> = {
    'technical': 'Технические вопросы',
    'billing': 'Платежи и подписки',
    'vpn': 'VPN / ключи',
    'referral': 'Рефералы',
    'other': 'Другое',
  };
  return categories[category] || category;
}