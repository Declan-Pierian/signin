const express = require('express');
const path = require('path');
const fs = require('fs');
const zoho = require('../zohoSignClient');

const router = express.Router();

/**
 * POST /api/send-for-signing
 * Body: { employeeName, employeeEmail, designation, joiningDate }
 */
router.post('/send-for-signing', async (req, res) => {
  try {
    const { employeeName, employeeEmail, designation, joiningDate } = req.body;

    if (!employeeName || !employeeEmail || !designation || !joiningDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeName, employeeEmail, designation, joiningDate',
      });
    }

    // Verify template exists
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'appointment_letter.docx');
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({
        success: false,
        error: 'Appointment letter template not found. Place it at templates/appointment_letter.docx',
      });
    }

    const result = await zoho.sendForSigning({ employeeName, employeeEmail, designation, joiningDate });

    const requestId = result.requests?.request_id;
    res.json({
      success: true,
      requestId,
      message: `Signing request created for ${employeeName}. Abhishek will receive the document first.`,
      data: result,
    });
  } catch (err) {
    console.error('[ROUTE] send-for-signing error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data?.message || err.message,
    });
  }
});

/**
 * GET /api/requests
 * List all signing requests.
 */
router.get('/requests', async (req, res) => {
  try {
    const result = await zoho.getRequests();
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[ROUTE] get requests error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/requests/:requestId
 * Get detailed status of a single request.
 */
router.get('/requests/:requestId', async (req, res) => {
  try {
    const result = await zoho.getRequestDetail(req.params.requestId);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[ROUTE] get request detail error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/requests/:requestId/download
 * Download the signed PDF.
 */
router.get('/requests/:requestId/download', async (req, res) => {
  try {
    const filePath = await zoho.downloadPdf(req.params.requestId);
    res.download(filePath);
  } catch (err) {
    console.error('[ROUTE] download error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/requests/:requestId/certificate
 * Download the completion certificate.
 */
router.get('/requests/:requestId/certificate', async (req, res) => {
  try {
    const filePath = await zoho.downloadCertificate(req.params.requestId);
    res.download(filePath);
  } catch (err) {
    console.error('[ROUTE] certificate error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/requests/:requestId/remind
 * Send reminder to current pending signer.
 */
router.post('/requests/:requestId/remind', async (req, res) => {
  try {
    const result = await zoho.sendReminder(req.params.requestId);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[ROUTE] remind error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/requests/:requestId/recall
 * Recall (cancel) a signing request.
 */
router.post('/requests/:requestId/recall', async (req, res) => {
  try {
    const result = await zoho.recallRequest(req.params.requestId);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[ROUTE] recall error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;