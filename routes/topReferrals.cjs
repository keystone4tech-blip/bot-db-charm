const express = require('express');;
const {
  handleGetTopReferrals,
} = require('../controllers/referralTopController.cjs');;

const router = express.Router();

router.get('/top-referrals', handleGetTopReferrals);

module.exports = router;