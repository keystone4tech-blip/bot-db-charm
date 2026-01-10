import { useState, useEffect } from 'react';

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

      const response = await fetch(`/api/support-tickets/${userId}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch tickets');

      setTickets(result.tickets || []);
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

      const response = await fetch('/api/support-tickets');
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch tickets');

      setTickets(result.tickets || []);
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
      const response = await fetch(`/api/support-chat/${ticketId}`);
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
  };

  // Создание нового тикета
  const createTicket = async (userId: string, category: string, subject: string, message: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, category, subject, message }),
      });

      const result = await response.json();

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
  const sendMessage = async (ticketId: string, senderId: string, senderType: 'user' | 'admin', message: string, file?: File) => {
    try {
      // Если есть файл, загружаем его сначала
      let fileUrl = '';
      let fileType = '';
      let fileName = '';

      if (file) {
        // В реальной реализации нужно загрузить файл на сервер
        // или в облачное хранилище, и получить URL
        // Пока используем заглушку для демонстрации

        // В реальной реализации:
        // 1. Загрузить файл на сервер или в облачное хранилище
        // 2. Получить URL файла
        // 3. Сохранить URL в базе данных

        // Для демонстрации используем Data URL
        const reader = new FileReader();
        fileUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        fileType = file.type;
        fileName = file.name;
      }

      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          sender_id: senderId,
          sender_type,
          message,
          file_url: fileUrl,
          file_type: fileType,
          file_name: fileName
        }),
      });

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
  const updateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'closed') => {
    try {
      const response = await fetch(`/api/support-tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

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

  // Подписка на обновления чата
  useEffect(() => {
    // В реальной реализации здесь будет WebSocket или Server-Sent Events
    // для получения обновлений в реальном времени

    // Пример с WebSocket:
    // const ws = new WebSocket('ws://your-websocket-url');
    //
    // ws.onmessage = (event) => {
    //   const newMessage = JSON.parse(event.data);
    //   setMessages(prev => ({
    //     ...prev,
    //     [newMessage.ticket_id]: [...(prev[newMessage.ticket_id] || []), newMessage]
    //   }));
    // };
    //
    // return () => {
    //   ws.close();
    // };

    // Пока используем опрос (polling) для получения новых сообщений
    const interval = setInterval(() => {
      // Обновляем только те тикеты, для которых уже загружены сообщения
      Object.keys(messages).forEach(ticketId => {
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