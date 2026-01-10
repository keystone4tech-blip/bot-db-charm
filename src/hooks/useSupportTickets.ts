import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Инициализация Supabase клиента
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export interface Ticket {
  id: string;
  user_id: string;
  category: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  message: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
  created_at: string;
}

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка тикетов пользователя
  const fetchTickets = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Ошибка загрузки тикетов');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка всех тикетов (для администратора)
  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching all tickets:', err);
      setError('Ошибка загрузки тикетов');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка сообщений для тикета
  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [ticketId]: data || []
      }));
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Ошибка загрузки сообщений');
    }
  };

  // Создание нового тикета
  const createTicket = async (userId: string, category: string, subject: string, message: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating ticket with data:', { userId, category, subject, message });

      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: userId,
          category,
          subject,
          message,
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      // Добавляем тикет в список
      setTickets(prev => [data, ...prev]);

      console.log('Ticket created successfully:', data);
      return data;
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Ошибка создания тикета');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Отправка сообщения в чат
  const sendMessage = async (ticketId: string, senderId: string, senderType: 'user' | 'admin', message: string, file?: File) => {
    try {
      // В текущей реализации Supabase мы отправляем только текстовое сообщение
      // Поддержка файлов может быть добавлена позже

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id: ticketId,
          sender_id: senderId,
          message,
          is_admin_reply: senderType === 'admin',
        }])
        .select()
        .single();

      if (error) throw error;

      // Добавляем сообщение в список
      setMessages(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), data]
      }));

      // Обновляем статус тикета на "в процессе"
      await updateTicketStatus(ticketId, 'in_progress');

      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка отправки сообщения');
      throw err;
    }
  };

  // Обновление статуса тикета
  const updateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'closed') => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;

      // Обновляем статус в локальном состоянии
      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === ticketId ? { ...ticket, status: data.status } : ticket
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError('Ошибка обновления статуса тикета');
      throw err;
    }
  };

  // Подписка на обновления чата
  useEffect(() => {
    // Подписка на изменения в чате
    const channel = supabase
      .channel('ticket-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => ({
            ...prev,
            [newMessage.ticket_id]: [...(prev[newMessage.ticket_id] || []), newMessage]
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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