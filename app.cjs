const express = require('express');
const corsMiddleware = require('./middleware/cors.cjs');
const errorHandler = require('./middleware/errorHandler.cjs');
const log = require('./utils/logger.cjs');

const authRoutes = require('./routes/auth.cjs');
const emailAuthRoutes = require('./routes/emailAuth.cjs');
const profileRoutes = require('./routes/profiles.cjs');
const balanceRoutes = require('./routes/balances.cjs');
const referralRoutes = require('./routes/referrals.cjs');
const channelRoutes = require('./routes/channels.cjs');
const botRoutes = require('./routes/bots.cjs');
const vpnRoutes = require('./routes/vpn.cjs');
const subscriptionRoutes = require('./routes/subscriptions.cjs');
const supportRoutes = require('./routes/support.cjs');
const adminRoutes = require('./routes/admin.cjs');

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', emailAuthRoutes);
app.use('/api', profileRoutes);
app.use('/api', balanceRoutes);
app.use('/api', referralRoutes);
app.use('/api', channelRoutes);
app.use('/api', botRoutes);
app.use('/api', vpnRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', supportRoutes);
app.use('/api', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

module.exports = app;
