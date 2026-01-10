-- Добавляем таблицу для сообщений в чате поддержки
CREATE TABLE IF NOT EXISTS support_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'admin')),
    message TEXT NOT NULL,
    file_url TEXT,
    file_type VARCHAR(100),
    file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска сообщений по тикету
CREATE INDEX IF NOT EXISTS idx_support_chat_messages_ticket_id ON support_chat_messages(ticket_id);

-- Индекс для быстрого поиска сообщений по дате создания
CREATE INDEX IF NOT EXISTS idx_support_chat_messages_created_at ON support_chat_messages(created_at);

-- Включаем Row Level Security для таблицы сообщений
ALTER TABLE support_chat_messages ENABLE ROW LEVEL SECURITY;

-- Создаем политики доступа для таблицы сообщений
-- Пользователи могут видеть только сообщения в своих тикетах
CREATE POLICY select_support_chat_messages_policy ON support_chat_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = support_chat_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Пользователи могут вставлять сообщения только в свои тикеты
CREATE POLICY insert_support_chat_messages_policy ON support_chat_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = support_chat_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Пользователи могут обновлять и удалять только свои сообщения
CREATE POLICY update_support_chat_messages_policy ON support_chat_messages
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = support_chat_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

CREATE POLICY delete_support_chat_messages_policy ON support_chat_messages
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = support_chat_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );