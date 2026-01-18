const express = require('express');;
const { handleGetReferralStats } = require('../controllers/referralController.cjs');;

const router = express.Router();

router.get('/referral-stats/:userId', handleGetReferralStats);

module.exports = router;
