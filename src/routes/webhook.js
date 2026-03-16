const express = require('express');

const router = express.Router();

/**
 * POST /api/webhook/zoho-sign
 * Receives webhook events from Zoho Sign.
 * Configure this URL in Zoho Sign > Settings > Webhooks.
 */
router.post('/zoho-sign', (req, res) => {
  try {
    const payload = req.body;
    console.log('[WEBHOOK] Received event:', JSON.stringify(payload, null, 2));

    const { requests } = payload;
    if (requests) {
      const { request_id, request_name, request_status } = requests;
      console.log(`[WEBHOOK] Request: ${request_name} (${request_id}) — Status: ${request_status}`);

      if (requests.actions) {
        for (const action of requests.actions) {
          console.log(
            `[WEBHOOK]   ${action.recipient_name} (${action.action_type}): ${action.action_status}`
          );
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[WEBHOOK] Error processing event:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;