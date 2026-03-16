const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { getAccessToken } = require('./auth');

const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'appointment_letter.docx');
const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');

/** Build Authorization header */
async function authHeader() {
  const token = await getAccessToken();
  return { Authorization: `Zoho-oauthtoken ${token}` };
}

/**
 * Retry wrapper with exponential backoff for 429 rate-limit responses.
 */
async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.response?.status === 429 && i < retries - 1) {
        const wait = Math.pow(2, i + 1) * 1000;
        console.log(`[API] Rate limited, retrying in ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Create and submit a signing request for an appointment letter.
 * @param {{ employeeName: string, employeeEmail: string, designation: string, joiningDate: string }} details
 * @returns {Promise<object>} Zoho Sign response
 */
async function sendForSigning({ employeeName, employeeEmail, designation, joiningDate }) {
  const { abhishek, chetan, jagdish } = config.signers;

  const data = {
    requests: {
      request_name: `Appointment Letter - ${employeeName}`,
      is_sequential: true,
      expiration_days: 15,
      email_reminders: true,
      reminder_period: 3,
      notes: `Appointment letter for ${employeeName} — ${designation}, joining ${joiningDate}`,
      actions: [
        {
          recipient_name: abhishek.name,
          recipient_email: abhishek.email,
          action_type: 'SIGN',
          signing_order: 0,
          verify_recipient: true,
          verification_type: 'EMAIL',
        },
        // NOTE: Chetan commented out for testing — plan allows max 2 recipients.
        // Uncomment when on a higher plan:
        // {
        //   recipient_name: chetan.name,
        //   recipient_email: chetan.email,
        //   action_type: 'SIGN',
        //   signing_order: 1,
        //   verify_recipient: true,
        //   verification_type: 'EMAIL',
        // },
        {
          recipient_name: employeeName,
          recipient_email: employeeEmail,
          action_type: 'SIGN',
          signing_order: 1,
          verify_recipient: true,
          verification_type: 'EMAIL',
        },
        // NOTE: Jagdish (VIEW-only) removed — Zoho plan limits to 3 recipients.
        // Uncomment below when on a plan that supports 4+ recipients:
        // {
        //   recipient_name: jagdish.name,
        //   recipient_email: jagdish.email,
        //   action_type: 'VIEW',
        //   signing_order: 3,
        // },
      ],
    },
  };

  return withRetry(async () => {
    const headers = await authHeader();
    const form = new FormData();
    form.append('file', fs.createReadStream(TEMPLATE_PATH));
    form.append('data', JSON.stringify(data));

    console.log(`[SEND] Creating signing request for ${employeeName}...`);

    // Step 1: Create the draft document
    const createRes = await axios.post(`${config.zoho.apiBase}/requests`, form, {
      headers: { ...headers, ...form.getHeaders() },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const reqData = createRes.data.requests;
    const requestId = reqData?.request_id;
    if (!requestId) {
      console.error('[SEND] Create response:', JSON.stringify(createRes.data, null, 2));
      throw new Error('Failed to create signing request — no request_id returned');
    }

    console.log(`[SEND] Document created: ${requestId}`);
    console.log('[SEND] Draft response:', JSON.stringify(reqData, null, 2));

    // Step 2: Submit for signing.
    // Text tags ({{Signature:Recipient1*}} etc.) in the document are auto-parsed
    // by Zoho during draft creation. The draft response actions already contain
    // the detected fields. We pass the actions from the draft response as-is.
    const submitPayload = {
      requests: {
        actions: (reqData.actions || []).map((action) => ({
          action_id: action.action_id,
          action_type: action.action_type,
          signing_order: action.signing_order,
          verify_recipient: action.verify_recipient,
          verification_type: action.verification_type,
        })),
      },
    };

    console.log('[SEND] Submitting:', JSON.stringify(submitPayload, null, 2));

    const submitRes = await axios.post(
      `${config.zoho.apiBase}/requests/${requestId}/submit`,
      JSON.stringify(submitPayload),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    );

    console.log(`[SEND] Document submitted for signing: ${requestId}`);
    return submitRes.data;
  });
}

/**
 * Get all signing requests.
 * @returns {Promise<object>}
 */
async function getRequests() {
  return withRetry(async () => {
    const headers = await authHeader();
    const res = await axios.get(`${config.zoho.apiBase}/requests`, { headers });
    return res.data;
  });
}

/**
 * Get detailed status of a specific request.
 * @param {string} requestId
 * @returns {Promise<object>}
 */
async function getRequestDetail(requestId) {
  return withRetry(async () => {
    const headers = await authHeader();
    const res = await axios.get(`${config.zoho.apiBase}/requests/${requestId}`, { headers });
    return res.data;
  });
}

/**
 * Download the signed PDF for a completed request.
 * @param {string} requestId
 * @returns {Promise<string>} file path of saved PDF
 */
async function downloadPdf(requestId) {
  return withRetry(async () => {
    const headers = await authHeader();
    const res = await axios.get(`${config.zoho.apiBase}/requests/${requestId}/pdf`, {
      headers,
      responseType: 'arraybuffer',
    });

    const filePath = path.join(DOWNLOADS_DIR, `signed_${requestId}.pdf`);
    fs.writeFileSync(filePath, res.data);
    console.log(`[DOWNLOAD] Signed PDF saved: ${filePath}`);
    return filePath;
  });
}

/**
 * Download the completion certificate for a request.
 * @param {string} requestId
 * @returns {Promise<string>} file path
 */
async function downloadCertificate(requestId) {
  return withRetry(async () => {
    const headers = await authHeader();
    const res = await axios.get(`${config.zoho.apiBase}/requests/${requestId}/completioncertificate`, {
      headers,
      responseType: 'arraybuffer',
    });

    const filePath = path.join(DOWNLOADS_DIR, `certificate_${requestId}.pdf`);
    fs.writeFileSync(filePath, res.data);
    console.log(`[DOWNLOAD] Certificate saved: ${filePath}`);
    return filePath;
  });
}

/**
 * Send a reminder to the current pending signer.
 * @param {string} requestId
 * @returns {Promise<object>}
 */
async function sendReminder(requestId) {
  return withRetry(async () => {
    const headers = await authHeader();
    const res = await axios.post(
      `${config.zoho.apiBase}/requests/${requestId}/remind`,
      {},
      { headers }
    );
    console.log(`[REMIND] Reminder sent for request ${requestId}`);
    return res.data;
  });
}

/**
 * Recall (cancel) a signing request.
 * @param {string} requestId
 * @returns {Promise<object>}
 */
async function recallRequest(requestId) {
  return withRetry(async () => {
    const headers = await authHeader();
    const res = await axios.post(
      `${config.zoho.apiBase}/requests/${requestId}/recall`,
      {},
      { headers }
    );
    console.log(`[RECALL] Request ${requestId} recalled`);
    return res.data;
  });
}

module.exports = {
  sendForSigning,
  getRequests,
  getRequestDetail,
  downloadPdf,
  downloadCertificate,
  sendReminder,
  recallRequest,
};