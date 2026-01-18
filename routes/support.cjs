const express = require('express');;
const {
  handleCreateTicket,
  handleGetUserTickets,
  handleGetAllTickets,
  handleUpdateTicketStatus,
  handleGetChatMessages,
  handleSendChatMessage,
} = require('../controllers/supportController.cjs');;

const router = express.Router();

router.post('/support-tickets', handleCreateTicket);
router.get('/support-tickets/:userId', handleGetUserTickets);
router.get('/support-tickets', handleGetAllTickets);
router.put('/support-tickets/:ticketId', handleUpdateTicketStatus);
router.get('/support-chat/:ticketId', handleGetChatMessages);
router.post('/support-chat', handleSendChatMessage);

module.exports = router;
