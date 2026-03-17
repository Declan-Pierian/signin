const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const zoho = require('../zohoSignClient');

const router = express.Router();

// Configure multer to store uploaded PDFs in a temp folder
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

/**
 * POST /api/send-for-signing
 * Multipart form: file (PDF), employeeName, employeeEmail
 */
router.post('/send-for-signing', upload.single('file'), async (req, res) => {
  try {
    // employeeName and employeeEmail are optional for POC (falls back to .env values)
    // For production: these will be passed dynamically
    const { employeeName, employeeEmail } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded',
      });
    }

    // Rename temp file to original name so Zoho gets a proper filename
    const originalName = req.file.originalname || 'appointment_letter.pdf';
    const properPath = path.join(uploadsDir, originalName);
    fs.renameSync(req.file.path, properPath);

    const result = await zoho.sendForSigning({
      employeeName,
      employeeEmail,
      filePath: properPath,
    });

    // Clean up uploaded file after sending
    try { fs.unlinkSync(properPath); } catch (_) {}

    const requestId = result.requests?.request_id;
    res.json({
      success: true,
      requestId,
      message: `Signing request created. Abhishek will receive the document first.`,
      data: result,
    });
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
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
 * Download the signed PDF with "Appointment Letter - <name>" prefix.
 */
router.get('/requests/:requestId/download', async (req, res) => {
  try {
    const detail = await zoho.getRequestDetail(req.params.requestId);
    const requestName = detail.requests?.request_name || req.params.requestId;
    // request_name is already "Appointment Letter - <name>", so use it directly
    const downloadName = `${requestName}.pdf`;

    const filePath = await zoho.downloadPdf(req.params.requestId);
    res.download(filePath, downloadName);
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