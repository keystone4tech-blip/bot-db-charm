const {
  createTicket,
  getUserTickets,
  getAllTickets,
  updateTicketStatus,
  getChatMessages,
  sendChatMessage,
} = require('../services/supportService.cjs');;
const log = require('../utils/logger.cjs');;

async function handleCreateTicket(req, res, next) {
  try {
    log.info('Received support ticket request:', req.body);
    const ticket = await createTicket(req.body);

    res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
}

async function handleGetUserTickets(req, res, next) {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const tickets = await getUserTickets(userId, status);

    res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    next(error);
  }
}

async function handleGetAllTickets(req, res, next) {
  try {
    const { status } = req.query;
    const tickets = await getAllTickets(status);

    res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    next(error);
  }
}

async function handleUpdateTicketStatus(req, res, next) {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const ticket = await updateTicketStatus(ticketId, status);

    res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
}

async function handleGetChatMessages(req, res, next) {
  try {
    const { ticketId } = req.params;
    const messages = await getChatMessages(ticketId);

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
}

async function handleSendChatMessage(req, res, next) {
  try {
    const message = await sendChatMessage(req.body);

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleCreateTicket,
  handleGetUserTickets,
  handleGetAllTickets,
  handleUpdateTicketStatus,
  handleGetChatMessages,
  handleSendChatMessage,
};
