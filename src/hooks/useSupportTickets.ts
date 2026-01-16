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
  const [messagesFetched, setMessagesFetched] = useState<Record<string, boolean>>({});
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
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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

      const response = await fetch(`${SUPABASE_URL}/functions/v1/support-tickets?admin=true`, {
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
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

  type FetchMessagesOptions = {
    background?: boolean; // не показываем "Загрузка сообщений..." при авто-обновлениях
  };

  // Загрузка сообщений для тикета
  const fetchMessages = useCallback(async (ticketId: string, options: FetchMessagesOptions = {}) => {
    const { background = false } = options;

    try {
      if (!background) {
        setMessagesLoading((prev) => ({ ...prev, [ticketId]: true }));
      }
      setError(null);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/support-chat?ticket_id=${ticketId}`, {
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch messages');

      const incoming: ChatMessage[] = (result.messages || []).map((m: ChatMessage) => ({
        ...m,
        message_type: m.message_type ?? 'text',
      }));

      setMessages((prev) => {
        const existing = prev[ticketId] || [];
        const systemMessages = existing.filter((m) => m.message_type === 'system');

        // Если из бэка пришло пусто, не затираем локальные системные сообщения ("Тикет создан")
        if (incoming.length === 0) {
          return {
            ...prev,
            [ticketId]: systemMessages.length ? systemMessages : existing,
          };
        }

        // Сливаем: системные сверху + сообщения из бэка (без дублей)
        const byId = new Map<string, ChatMessage>();
        for (const m of systemMessages) byId.set(m.id, m);
        for (const m of incoming) byId.set(m.id, m);

        return {
          ...prev,
          [ticketId]: Array.from(byId.values()),
        };
      });

      setMessagesFetched((prev) => ({ ...prev, [ticketId]: true }));
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Ошибка загрузки сообщений');
      setMessagesFetched((prev) => ({ ...prev, [ticketId]: true }));
    } finally {
      if (!background) {
        setMessagesLoading((prev) => ({ ...prev, [ticketId]: false }));
      }
    }
  }, []);

  // Создание нового тикета
  const createTicket = async (userId: string, category: string, subject: string, message: string): Promise<Ticket> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/support-tickets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, category, subject, message }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create ticket');

      const newTicket = result.ticket;

      // Добавляем тикет в список
      setTickets((prev) => [newTicket, ...prev]);

      // Локальное системное сообщение о создании тикета (может быть затёрто fetchMessages — мы это предотвращаем)
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        ticket_id: newTicket.id,
        sender_id: 'system',
        is_admin_reply: false,
        message: `📋 Тикет создан\n\nКатегория: ${getCategoryLabel(category)}\nТема: ${subject}\n\n${message}\n\n⏳ Ожидайте ответа от службы поддержки. Вы сможете написать сообщение после того, как поддержка ответит.`,
        message_type: 'system',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => ({
        ...prev,
        [newTicket.id]: [systemMessage],
      }));
      setMessagesFetched((prev) => ({ ...prev, [newTicket.id]: true }));

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
        (m) => m.is_admin_reply && (m.message_type ?? 'text') !== 'system'
      );

      const response = await fetch(`${SUPABASE_URL}/functions/v1/support-chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send message');

      const saved: ChatMessage = {
        ...result.message,
        message_type: result.message?.message_type ?? messageType,
      };

      // Добавляем сообщение в список
      setMessages((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), saved],
      }));

      // Если это первое сообщение от админа — переводим тикет в in_progress (через API статуса)
      if (senderType === 'admin' && !hadAdminReplyBefore) {
        try {
          await updateTicketStatus(ticketId, 'in_progress');
        } catch (e) {
          console.warn('Failed to update ticket status to in_progress:', e);
        }
      }

      return saved;
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
      const response = await fetch(`${SUPABASE_URL}/functions/v1/support-tickets`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticket_id: ticketId, status }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update ticket status');

      // Обновляем статус в локальном состоянии
      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: result.ticket.status } : ticket))
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
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => ({
          ...prev,
          [ticketId]: [...(prev[ticketId] || []), systemMessage],
        }));
      }

      toast.success(status === 'closed' ? 'Тикет закрыт' : 'Статус обновлен');
      return result.ticket as Ticket;
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError('Ошибка обновления статуса тикета');
      toast.error('Ошибка обновления статуса');
      throw err;
    }
  };

  // Подписка на обновления чата (без "вечной" загрузки)
  const subscribeToChat = useCallback(
    (ticketId: string) => {
      let cancelled = false;
      let lastSeenId: string | null = null;

      // начальная загрузка
      fetchMessages(ticketId).then(() => {
        const arr = (messages[ticketId] || []).filter((m) => (m.message_type ?? 'text') !== 'system');
        lastSeenId = arr.length ? arr[arr.length - 1].id : null;
      });

      const interval = setInterval(async () => {
        if (cancelled) return;

        // фон: без спиннера
        await fetchMessages(ticketId, { background: true });

        const arr = (messages[ticketId] || []).filter((m) => (m.message_type ?? 'text') !== 'system');
        const latestId = arr.length ? arr[arr.length - 1].id : null;

        if (latestId && latestId !== lastSeenId) {
          lastSeenId = latestId;
          // тут ничего не нужно — setMessages уже обновил состояние
        }
      }, 2000);

      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchMessages]
  );

  // Проверка, может ли пользователь писать (только если админ уже ответил)
  const canUserReply = useCallback(
    (ticketId: string): boolean => {
      const ticketMessages = messages[ticketId] || [];
      return ticketMessages.some((msg) => msg.is_admin_reply && (msg.message_type ?? 'text') !== 'system');
    },
    [messages]
  );

  return {
    tickets,
    messages,
    messagesLoading,
    messagesFetched,
    loading,
    error,
    fetchTickets,
    fetchAllTickets,
    fetchMessages,
    createTicket,
    sendMessage,
    updateTicketStatus,
    subscribeToChat,
    canUserReply,
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