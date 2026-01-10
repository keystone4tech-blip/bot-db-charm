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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Вспомогательная функция для выполнения запросов к Supabase функции
  const callSupabaseFunction = async (endpoint: string, method: string, body?: any) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('Supabase function call attempt:', {
      endpoint,
      method,
      body,
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!anonKey,
      supabaseUrl: supabaseUrl ? 'PROVIDED' : 'MISSING',
      anonKey: anonKey ? 'PROVIDED' : 'MISSING'
    });

    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL не определен в переменных окружения');
    }

    if (!anonKey) {
      throw new Error('VITE_SUPABASE_ANON_KEY не определен в переменных окружения');
    }

    try {
      const fullUrl = `${supabaseUrl}/functions/v1/${endpoint}`;
      console.log('Making request to:', fullUrl);

      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        ...(body && { body: JSON.stringify(body) }),
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl
      });

      const result = await response.json();
      console.log('Response parsed:', result);

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}, message: ${response.statusText}`);
      }

      return result;
    } catch (error) {
      console.error('Network or parsing error in callSupabaseFunction:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Ошибка соединения с сервером. Проверьте подключение к интернету и настройки Supabase.');
      }
      throw error;
    }
  };

  // Загрузка тикетов пользователя
  const fetchTickets = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await callSupabaseFunction(`support-tickets/${userId}`, 'GET');

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

      // Для администратора нужно будет создать отдельную функцию
      // Пока используем тот же endpoint, но в реальности нужна отдельная функция
      // с проверкой прав администратора
      const result = await callSupabaseFunction('support-tickets', 'GET');

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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Supabase URL или ANON ключ не определены в переменных окружения');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/support-chat-messages/${ticketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

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

      console.log('Starting ticket creation process...', {
        userId,
        category,
        subject,
        messageLength: message.length
      });

      // Проверяем, что все необходимые данные присутствуют
      if (!userId || !category || !subject || !message) {
        throw new Error(`Отсутствуют обязательные поля: userId=${!!userId}, category=${!!category}, subject=${!!subject}, message=${!!message}`);
      }

      console.log('Calling Supabase function for ticket creation...');
      const result = await callSupabaseFunction('support-tickets', 'POST', {
        user_id: userId,
        category,
        subject,
        message
      });

      console.log('Supabase function response received:', result);

      if (!result.success || !result.ticket) {
        throw new Error(result.error || 'Некорректный ответ от сервера');
      }

      console.log('Ticket created successfully in database:', result.ticket);

      // Добавляем тикет в список
      setTickets(prev => [result.ticket, ...prev]);

      return result.ticket;
    } catch (err) {
      console.error('Error creating ticket:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при создании тикета';
      setError(`Ошибка создания тикета: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Отправка сообщения в чат
  const sendMessage = async (ticketId: string, senderId: string, senderType: 'user' | 'admin', message: string, file?: File) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Supabase URL или ANON ключ не определены в переменных окружения');
      }

      // Если есть файл, загружаем его сначала
      let fileUrl = '';
      let fileType = '';
      let fileName = '';

      if (file) {
        // Загрузка файла в Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileNameWithExt = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `support/${ticketId}/${fileNameWithExt}`;

        const { error: uploadError } = await supabase
          .storage
          .from('support-files')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase
          .storage
          .from('support-files')
          .getPublicUrl(filePath);

        fileUrl = publicUrlData?.publicUrl || '';
        fileType = file.type;
        fileName = file.name;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/support-chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          sender_id: senderId,
          sender_type: senderType,
          message,
          file_url: fileUrl,
          file_type: fileType,
          file_name: fileName
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

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
      const result = await callSupabaseFunction(`support-tickets/${ticketId}`, 'PUT', { status });

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