import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchTickets = useCallback(async (userId: string): Promise<Ticket[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      const ticketsList = (data || []) as unknown as Ticket[];
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

  const fetchAllTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      setTickets((data || []) as unknown as Ticket[]);
    } catch (err) {
      console.error('Error fetching all tickets:', err);
      setError('Ошибка загрузки тикетов');
    } finally {
      setLoading(false);
    }
  }, []);

  type FetchMessagesOptions = {
    background?: boolean;
  };

  const fetchMessages = useCallback(async (ticketId: string, options: FetchMessagesOptions = {}) => {
    const { background = false } = options;

    try {
      if (!background) {
        setMessagesLoading((prev) => ({ ...prev, [ticketId]: true }));
      }
      setError(null);

      const { data, error: dbError } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (dbError) throw dbError;

      const incoming: ChatMessage[] = (data || []).map((m: any) => ({
        ...m,
        message_type: m.message_type ?? 'text',
      }));

      setMessages((prev) => {
        const existing = prev[ticketId] || [];
        const systemMessages = existing.filter((m) => m.message_type === 'system');

        if (incoming.length === 0) {
          return {
            ...prev,
            [ticketId]: systemMessages.length ? systemMessages : existing,
          };
        }

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

  const createTicket = async (userId: string, category: string, subject: string, message: string): Promise<Ticket> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: userId,
          category,
          subject,
          message,
          priority: 'medium',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const newTicket = data as unknown as Ticket;
      setTickets((prev) => [newTicket, ...prev]);

      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        ticket_id: newTicket.id,
        sender_id: 'system',
        is_admin_reply: false,
        message: `📋 Тикет создан\n\nКатегория: ${getCategoryLabel(category)}\nТема: ${subject}\n\n${message}\n\n⏳ Ожидайте ответа от службы поддержки.`,
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
      const { data, error: dbError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: senderId,
          is_admin_reply: senderType === 'admin',
          message,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const saved: ChatMessage = {
        ...data,
        message_type: messageType,
      } as unknown as ChatMessage;

      setMessages((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), saved],
      }));

      return saved;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка отправки сообщения');
      toast.error('Ошибка отправки сообщения');
      throw err;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'closed' | 'resolved') => {
    try {
      const { data, error: dbError } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId)
        .select()
        .single();

      if (dbError) throw dbError;

      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket))
      );

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
      return data as unknown as Ticket;
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError('Ошибка обновления статуса тикета');
      toast.error('Ошибка обновления статуса');
      throw err;
    }
  };

  const subscribeToChat = useCallback(
    (ticketId: string) => {
      let cancelled = false;

      fetchMessages(ticketId);

      const interval = setInterval(async () => {
        if (cancelled) return;
        await fetchMessages(ticketId, { background: true });
      }, 3000);

      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    },
    [fetchMessages]
  );

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
