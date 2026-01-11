import { useState, useEffect, useCallback } from 'react';

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
}

export interface ChatMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  is_admin_reply: boolean;
  message: string;
  created_at: string;
}

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка тикетов пользователя
  const fetchTickets = useCallback(async (userId: string) => {
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

      setTickets(result.tickets || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Ошибка загрузки тикетов');
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

      // Добавляем тикет в список
      setTickets(prev => [result.ticket, ...prev]);

      return result.ticket;
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Ошибка создания тикета');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Отправка сообщения в чат
  const sendMessage = async (ticketId: string, senderId: string, senderType: 'user' | 'admin', message: string): Promise<ChatMessage> => {
    try {
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

      return result.message;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка отправки сообщения');
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
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError('Ошибка обновления статуса тикета');
      throw err;
    }
  };

  // Подписка на обновления чата (polling)
  useEffect(() => {
    const ticketIds = Object.keys(messages);
    if (ticketIds.length === 0) return;

    const interval = setInterval(() => {
      ticketIds.forEach(ticketId => {
        fetchMessages(ticketId);
      });
    }, 5000); // Обновляем каждые 5 секунд

    return () => {
      clearInterval(interval);
    };
  }, [messages, fetchMessages]);

  return {
    tickets,
    messages,
    loading,
    error,
    fetchTickets,
    fetchAllTickets,
    fetchMessages,
    createTicket,
    sendMessage,
    updateTicketStatus
  };
};
