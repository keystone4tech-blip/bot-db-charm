-- Миграция для обновления структуры таблицы support_tickets
-- Убедимся, что все необходимые поля и индексы существуют

-- Создаем таблицу support_tickets, если она не существует
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создаем индекс для быстрого поиска тикетов по пользователю
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);

-- Создаем индекс для сортировки по дате создания
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Создаем индекс для поиска по статусу
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- Создаем таблицу сообщений чата поддержки, если она не существует
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
    message TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT,
    file_name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем индекс для быстрого поиска сообщений по тикету
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- Создаем индекс для сортировки сообщений по дате создания
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);

-- Включаем Row Level Security для таблиц
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Создаем политики доступа для таблицы тикетов
-- Пользователи могут видеть только свои тикеты
CREATE POLICY user_tickets_select_policy ON support_tickets
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- Пользователи могут создавать тикеты только для себя
CREATE POLICY user_tickets_insert_policy ON support_tickets
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Пользователи могут обновлять только свои тикеты
CREATE POLICY user_tickets_update_policy ON support_tickets
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Создаем политики доступа для таблицы сообщений
-- Пользователи могут видеть сообщения только в своих тикетах
CREATE POLICY user_messages_select_policy ON ticket_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND (support_tickets.user_id = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM user_roles 
                     WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
                 ))
        )
    );

-- Пользователи могут отправлять сообщения только в свои тикеты
CREATE POLICY user_messages_insert_policy ON ticket_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Пользователи могут обновлять и удалять только свои сообщения
CREATE POLICY user_messages_update_policy ON ticket_messages
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
        AND ticket_messages.sender_type = 'user'
    );

CREATE POLICY user_messages_delete_policy ON ticket_messages
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
        AND ticket_messages.sender_type = 'user'
    );