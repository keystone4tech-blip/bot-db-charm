const express = require('express');;
const {
  handleGetUserSubscriptions,
  handleCreateSubscription,
} = require('../controllers/subscriptionController.cjs');;

const router = express.Router();

router.get('/subscriptions/:userId', handleGetUserSubscriptions);
router.post('/subscriptions', handleCreateSubscription);

module.exports = router;
