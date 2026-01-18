const express = require('express');;
const {
  handleGetBalance,
  handleUpdateBalance,
} = require('../controllers/balanceController.cjs');;

const router = express.Router();

router.get('/balances/:userId', handleGetBalance);
router.put('/balances/:userId', handleUpdateBalance);

module.exports = router;
