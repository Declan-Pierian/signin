const axios = require('axios');
const config = require('./config');

let tokenCache = { accessToken: null, expiresAt: 0 };

/**
 * Get a valid Zoho OAuth access token.
 * Caches the token in memory and auto-refreshes when < 5 min remaining.
 * @returns {Promise<string>} access token
 */
async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt - now > 5 * 60 * 1000) {
    return tokenCache.accessToken;
  }

  console.log('[AUTH] Refreshing access token...');

  const { tokenUrl, clientId, clientSecret, refreshToken } = config.zoho;

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const res = await axios.post(tokenUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (res.data.error) {
    throw new Error(`[AUTH] Token refresh failed: ${res.data.error}`);
  }

  const expiresIn = res.data.expires_in || 3600;
  tokenCache = {
    accessToken: res.data.access_token,
    expiresAt: now + expiresIn * 1000,
  };

  console.log(`[AUTH] Token refreshed, expires in ${expiresIn}s`);
  return tokenCache.accessToken;
}

module.exports = { getAccessToken };