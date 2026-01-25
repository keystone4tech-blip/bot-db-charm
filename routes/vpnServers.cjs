const express = require('express');;
const {
  handleGetVPNServers,
} = require('../controllers/vpnServerController.cjs');;

const router = express.Router();

router.get('/vpn-servers', handleGetVPNServers);

module.exports = router;