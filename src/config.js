require('dotenv').config();

const dc = process.env.ZOHO_DC || 'in';

/** @type {import('./types').Config} */
const config = {
  zoho: {
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN,
    apiBase: `https://sign.zoho.${dc}/api/v1`,
    tokenUrl: `https://accounts.zoho.${dc}/oauth/v2/token`,
  },
  signers: {
    abhishek: { name: process.env.ABHISHEK_NAME || 'Abhishek', email: process.env.ABHISHEK_EMAIL },
    chetan: { name: process.env.CHETAN_NAME || 'Chetan', email: process.env.CHETAN_EMAIL },
    jagdish: { name: process.env.JAGDISH_NAME || 'Jagdish', email: process.env.JAGDISH_EMAIL },
  },
  port: parseInt(process.env.PORT, 10) || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

module.exports = config;