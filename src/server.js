const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const signingRoutes = require('./routes/signing');
const webhookRoutes = require('./routes/webhook');

const app = express();

// Ensure downloads directory exists
const downloadsDir = path.join(__dirname, '..', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Middleware
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());

// Routes
app.use('/api', signingRoutes);
app.use('/api/webhook', webhookRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`[SERVER] Pierian Zoho Sign backend running on port ${config.port}`);
  console.log(`[SERVER] Frontend URL: ${config.frontendUrl}`);
});