const pool = require('../config/database.cjs');;
const log = require('../utils/logger.cjs');;
const { NotFoundError, ValidationError } = require('../utils/errors.cjs');;
const { SUPPORT_TICKET_STATUS } = require('../config/constants.cjs');;

async function createTicket(ticketData) {
  const { user_id, category, subject, message } = ticketData;

  if (!user_id || !category || !subject || !message) {
    log.error('Missing required fields:', { user_id, category, subject, message });
    throw new ValidationError('Missing required fields');;
  }

  const tableExistsQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'support_tickets'
    ) AS table_exists;
  `;

  const tableCheckResult = await pool.query(tableExistsQuery);

  if (!tableCheckResult.rows[0].table_exists) {
    log.error('Table support_tickets does not exist');;
    throw new Error('Table support_tickets does not exist');;
  }

  const query = `
    INSERT INTO support_tickets (user_id, category, subject, message, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(query, [
    user_id,
    category,
    subject,
    message,
    SUPPORT_TICKET_STATUS.OPEN
  ]);

  log.info('Ticket created successfully:', result.rows[0]);
  return result.rows[0];
}

async function getUserTickets(userId, status = null) {
  let query = 'SELECT * FROM support_tickets WHERE user_id = $1';
  const queryParams = [userId];
  let paramIndex = 2;

  if (status) {
    query += ` AND status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, queryParams);
  return result.rows;
}

async function getAllTickets(status = null) {
  let query = 'SELECT * FROM support_tickets';
  const queryParams = [];
  let paramIndex = 1;

  if (status) {
    query += ` WHERE status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, queryParams);
  return result.rows;
}

async function updateTicketStatus(ticketId, status) {
  const query = `
    UPDATE support_tickets
    SET status = $1, updated_at = $2
    WHERE id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [status, new Date().toISOString(), ticketId]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Ticket not found');;
  }

  return result.rows[0];
}

async function getChatMessages(ticketId) {
  const query = `
    SELECT * FROM support_chat_messages
    WHERE ticket_id = $1
    ORDER BY created_at ASC
  `;
  const result = await pool.query(query, [ticketId]);
  return result.rows;
}

async function sendChatMessage(messageData) {
  const { ticket_id, sender_id, sender_type, message, file_url, file_type, file_name } = messageData;

  const query = `
    INSERT INTO support_chat_messages (
      ticket_id, sender_id, sender_type, message, file_url, file_type, file_name
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const result = await pool.query(query, [
    ticket_id,
    sender_id,
    sender_type,
    message,
    file_url,
    file_type,
    file_name
  ]);

  await pool.query(
    'UPDATE support_tickets SET status = $1, updated_at = $2 WHERE id = $3',
    [SUPPORT_TICKET_STATUS.IN_PROGRESS, new Date().toISOString(), ticket_id]
  );

  return result.rows[0];
}

module.exports = {
  createTicket,
  getUserTickets,
  getAllTickets,
  updateTicketStatus,
  getChatMessages,
  sendChatMessage,
};
