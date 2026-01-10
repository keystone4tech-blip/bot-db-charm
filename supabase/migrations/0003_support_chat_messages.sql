-- Добавляем таблицу для сообщений в чате поддержки
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска сообщений по тикету
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- Индекс для быстрого поиска сообщений по дате создания
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);

-- Включаем Row Level Security для таблицы сообщений
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Создаем политики доступа для таблицы сообщений
-- Пользователи могут видеть только сообщения в своих тикетах
CREATE POLICY select_ticket_messages_policy ON ticket_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = public.get_profile_id()
        )
        OR
        public.has_role(auth.uid(), 'admin')
    );

-- Пользователи могут вставлять сообщения только в свои тикеты
CREATE POLICY insert_ticket_messages_policy ON ticket_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = public.get_profile_id()
        )
        OR
        public.has_role(auth.uid(), 'admin')
    );

-- Пользователи могут обновлять и удалять только свои сообщения
CREATE POLICY update_ticket_messages_policy ON ticket_messages
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = public.get_profile_id()
        )
        AND NOT ticket_messages.is_admin_reply
    );

CREATE POLICY delete_ticket_messages_policy ON ticket_messages
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = public.get_profile_id()
        )
        AND NOT ticket_messages.is_admin_reply
    );