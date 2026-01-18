const express = require('express');;
const {
  handleGetUserVpnKeys,
  handleCreateVpnKey,
} = require('../controllers/vpnController.cjs');;

const router = express.Router();

router.get('/vpn-keys/:userId', handleGetUserVpnKeys);
router.post('/vpn-keys', handleCreateVpnKey);

module.exports = router;
