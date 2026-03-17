# Pierian Sign — Appointment Letter Signing Portal

A full-stack web application that automates the appointment letter signing workflow at **Pierian Services Private Limited** using the **Zoho Sign REST API**. HR uploads a PDF appointment letter through a web portal and the system handles the entire multi-party digital signing process.

---

## Table of Contents

1. [Business Context](#business-context)
2. [Original Requirements](#original-requirements)
3. [Revised Requirements](#revised-requirements)
4. [Current State (POC)](#current-state-poc)
5. [Production Roadmap](#production-roadmap)
6. [Signing Flow](#signing-flow)
7. [Tech Stack](#tech-stack)
8. [Project Structure](#project-structure)
9. [Architecture Overview](#architecture-overview)
10. [Backend API Reference](#backend-api-reference)
11. [Frontend Pages](#frontend-pages)
12. [Zoho Sign Integration Details](#zoho-sign-integration-details)
13. [Text Tags in Documents](#text-tags-in-documents)
14. [Environment Variables](#environment-variables)
15. [Setup & Installation](#setup--installation)
16. [Usage](#usage)
17. [Known Limitations & Issues Encountered](#known-limitations--issues-encountered)
18. [Troubleshooting](#troubleshooting)

---

## Business Context

Pierian Services issues appointment letters to new employees. These letters require signatures from multiple parties in a specific order before the employee officially joins. Previously this was done manually — printing, signing, scanning, and emailing back. This portal digitizes the entire process using Zoho Sign's e-signature capabilities.

---

## Original Requirements

The initial specification defined the following:

### Business Flow (Original)
1. **HR** opens the web portal and enters the new employee's details (name, email, designation, joining date).
2. HR uploads a **Word document (.docx)** template of the appointment letter.
3. The system populates the template with employee details and sends it for signing via Zoho Sign.
4. **Four parties** are involved in sequential order:
   - **Abhishek** (Authorized Signatory) — signs on Page 1 (signing_order: 0)
   - **Chetan** (HR Head) — signs on Page 2 (signing_order: 1)
   - **Employee** (New Joiner) — signs on Page 3 to accept (signing_order: 2)
   - **Jagdish** (Management) — **view only**, receives the fully signed copy (signing_order: 3)

### Frontend (Original)
- **Dashboard** (`/dashboard`): Shows all signing requests with status, auto-refreshes every 30 seconds.
- **New Request** (`/new`): Form with fields for Employee Name, Employee Email, Designation, Joining Date + a "Signing Flow" section showing the 4-party flow visually + Submit button.
- **Request Detail** (`/request/:id`): Shows detailed per-signer progress, action buttons (remind, recall, download, certificate).

### Backend (Original)
- Express.js server with Zoho Sign API integration.
- Hardcoded `.docx` template at `templates/appointment_letter.docx` with Zoho Sign text tags.
- OAuth 2.0 token refresh with in-memory caching.
- Sequential signing via `is_sequential: true`.

### Document Template (Original)
- Word document (`.docx`) with Zoho Sign text tags embedded:
  - `{{Signature:Recipient1*}}`, `{{Fullname:Recipient1}}`, `{{Date:Recipient1*}}` — Page 1 (Abhishek)
  - `{{Signature:Recipient2*}}` — Page 2 (Chetan)
  - `{{Signature:Recipient3*}}`, `{{Email:Recipient3}}` — Page 3 (Employee)
  - No tags for Recipient 4 (Jagdish) — view only.

---

## Revised Requirements

Multiple rounds of revisions were made based on client feedback and Zoho API limitations:

### Revision 1 — Zoho Plan Recipient Limit

**Problem**: The Zoho Sign plan in use only allows a **maximum of 2 recipients** per signing request.

**Change**: Reduced from 4 recipients to 2:
- Removed Jagdish (VIEW recipient) first → still hit the limit (3 signers).
- Removed Chetan as a separate signer → left with Abhishek + Employee only.
- Added production-ready comments in code showing how to re-enable all 4 parties when the Zoho plan is upgraded.

### Revision 2 — Text Tag Auto-Parsing

**Problem**: Initial implementation tried to pass `is_texttags: true` in the API request, but Zoho returned error `9043: Extra key found`.

**Discovery**: Zoho Sign **automatically parses text tags** in documents during draft creation. No special flag is needed. The draft response already contains the detected fields in the `actions` array.

**Change**: Updated the two-step API flow:
1. **Step 1**: Create draft (POST `/requests`) — Zoho auto-detects text tags.
2. **Step 2**: Submit for signing (POST `/requests/{id}/submit`) — pass `action_id`s from the draft response instead of overriding with our own action definitions.

### Revision 3 — Date Tag Format

**Problem**: The date tag `{{Date:Recipient1*}}` was not being parsed by Zoho. It appeared as raw text in the signed document.

**Attempts**:
- `{{Date:Recipient1*}}` — Not recognized by Zoho (appeared as plain text).
- `{{Textfield:Recipient1:Date*}}` — Worked but gave a **text input** instead of a date picker.
- `{{D:Recipient1*}}` — **Correct format**. Gave a proper date picker control.

**Change**: Updated all date tags in the document template from `{{Date:RecipientN*}}` to `{{D:RecipientN*}}`.

### Revision 4 — PDF Upload Instead of DOCX Template

**Problem**: Client requested that the user should upload a **PDF** document directly instead of using a hardcoded Word template.

**Changes**:
- **Backend**: Installed `multer` for multipart file upload handling. The `/api/send-for-signing` endpoint now accepts a PDF file via `multipart/form-data` instead of reading from `templates/`.
- **Frontend**: Replaced the form-based UI with a **drag-and-drop PDF upload zone**. Removed the "Signing Flow" visual component from the `/new` page.
- **API Client**: Updated to send `FormData` with the file instead of JSON body.

### Revision 5 — Download Filename Prefix

**Problem**: Client wanted downloaded signed PDFs to have a descriptive filename.

**Change**: The download endpoint now returns the file as `Appointment Letter - <employee_name>.pdf`. The Zoho request is named `Appointment Letter - <name>` during creation, and the download route uses this name directly as the filename.

### Revision 6 — POC Hardcoding (Current State)

**Problem**: Client said employee details will be passed dynamically via Zoho API in production. For the **POC demo**, all signing parties should be hardcoded from `.env`.

**Changes**:
- **Removed** Employee Name and Employee Email input fields from the frontend entirely.
- **Frontend** (`/new` page) now only has: PDF upload + "Send for Signing" button.
- **Backend** falls back to **Chetan** (from `.env`) as the employee/second signer when `employeeName`/`employeeEmail` are not provided.
- **Signing parties for POC**:
  - **Abhishek** (from `.env`) — 1st signer (signing_order: 0)
  - **Chetan** (from `.env`) — 2nd signer, acting as "employee" (signing_order: 1)
  - **Jagdish** (from `.env`) — viewer (commented out due to plan limit)
- **API client** conditionally appends employee details only when provided (avoids sending `"undefined"` strings).

---

## Current State (POC)

### What works right now:
- HR uploads a PDF appointment letter (with Zoho Sign text tags embedded).
- The document is sent to **Abhishek** (1st signer), then to **Chetan** (2nd signer, acting as employee).
- Both receive email notifications with links to sign.
- Signing is sequential — Chetan receives the document only after Abhishek signs.
- Dashboard shows all requests with real-time status.
- Request detail page shows per-signer progress.
- Signed PDFs can be downloaded with proper naming: `Appointment Letter - <name>.pdf`.
- Completion certificates can be downloaded.
- Reminders can be sent to pending signers.
- Requests can be recalled (cancelled).
- Auto-refresh every 30 seconds on the dashboard.

### What is hardcoded for POC:
- All signer emails come from `.env` (Abhishek, Chetan).
- No employee input fields on the frontend.
- Only 2 recipients due to Zoho plan limit.

---

## Production Roadmap

When moving from POC to production, the following changes are needed:

### 1. Upgrade Zoho Sign Plan
Upgrade to a plan that supports **4+ recipients** per signing request.

### 2. Enable All 4 Parties
Uncomment the production code in `src/zohoSignClient.js` (lines 65-88) to add:
- **Chetan** as a separate signer (signing_order: 1)
- **Employee** as the 3rd signer with dynamic email (signing_order: 2)
- **Jagdish** as view-only recipient (signing_order: 3)

### 3. Accept Dynamic Employee Details
- Re-add Employee Name and Employee Email fields to the frontend `/new` page.
- Or, accept employee details via Zoho API integration (as client mentioned).
- The backend already supports this — just pass `employeeName` and `employeeEmail` in the request body.

### 4. Webhook Integration
- Configure the webhook URL in Zoho Sign settings.
- The backend already has a webhook handler at `POST /api/webhook/zoho-sign`.
- Can be extended to trigger notifications, update a database, etc.

---

## Signing Flow

### POC Flow (2 recipients):
```
HR uploads PDF
      │
      ▼
┌─────────────┐     ┌─────────────┐
│  Abhishek   │────▶│   Chetan    │────▶ Done
│  (Signer 1) │     │  (Signer 2) │
│  Signs P1   │     │ Acts as Emp │
└─────────────┘     └─────────────┘
```

### Production Flow (4 recipients):
```
HR uploads PDF
      │
      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Abhishek   │────▶│   Chetan    │────▶│  Employee   │────▶│  Jagdish    │
│  (Signer 1) │     │  (Signer 2) │     │  (Signer 3) │     │ (View Only) │
│  Auth. Sig. │     │  HR Head    │     │  Acceptance  │     │ Mgmt Copy   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite 5, Tailwind CSS 3   |
| Backend   | Node.js 18+, Express.js 4          |
| API       | Zoho Sign REST API v1               |
| Auth      | OAuth 2.0 (refresh token flow)      |
| HTTP      | Axios (both frontend and backend)   |
| Upload    | Multer (multipart file handling)    |
| Styling   | Tailwind CSS + custom design system |

---

## Project Structure

```
Sign/
├── src/                              # Backend (Node.js + Express)
│   ├── config.js                     # Environment config & signer details
│   ├── auth.js                       # OAuth token refresh with caching
│   ├── server.js                     # Express app, middleware, routes
│   ├── zohoSignClient.js             # Zoho Sign API client (core logic)
│   └── routes/
│       ├── signing.js                # All signing & request endpoints
│       └── webhook.js                # Zoho Sign webhook handler
│
├── frontend/                         # React frontend (Vite)
│   ├── index.html                    # HTML shell with Inter font & favicon
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite config + API proxy
│   ├── tailwind.config.js            # Custom theme (brand, surface, ink)
│   ├── postcss.config.js             # PostCSS + Tailwind
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Routes & page transitions
│       ├── index.css                 # Tailwind + custom component classes
│       ├── api/
│       │   └── client.js             # Axios API client
│       ├── pages/
│       │   ├── Dashboard.jsx         # Request list + stat cards
│       │   ├── NewRequest.jsx        # PDF upload + submit
│       │   └── RequestDetail.jsx     # Per-signer tracking + actions
│       └── components/
│           ├── Navbar.jsx            # Sticky nav with blur effect
│           ├── StatusBadge.jsx       # Status indicator (dot + label)
│           ├── SignerProgress.jsx    # Vertical signer timeline
│           └── RequestTable.jsx      # Requests table with progress rings
│
├── uploads/                          # Temp folder for uploaded PDFs (auto-created)
├── downloads/                        # Temp folder for downloaded PDFs (auto-created)
├── templates/                        # Document templates (legacy, no longer used)
│   ├── appointment_letter.docx       # Original template with text tags
│   └── appointment_letter_backup.docx
│
├── .env                              # Environment variables (secrets)
├── .env.example                      # Template for .env
├── package.json                      # Backend dependencies
└── README.md                         # This file
```

---

## Architecture Overview

### Data Flow: Creating a Signing Request

```
User (Browser)                    Backend (Express)                 Zoho Sign API
      │                                  │                                │
      │  1. Upload PDF                   │                                │
      │─────────────────────────────────▶│                                │
      │  POST /api/send-for-signing      │                                │
      │  (multipart/form-data)           │                                │
      │                                  │  2. Create draft                │
      │                                  │───────────────────────────────▶│
      │                                  │  POST /v1/requests              │
      │                                  │  (file + actions JSON)          │
      │                                  │                                │
      │                                  │  3. Draft response              │
      │                                  │◀───────────────────────────────│
      │                                  │  (auto-parsed text tags,        │
      │                                  │   action_ids assigned)          │
      │                                  │                                │
      │                                  │  4. Submit for signing          │
      │                                  │───────────────────────────────▶│
      │                                  │  POST /v1/requests/{id}/submit  │
      │                                  │  (action_ids from draft)        │
      │                                  │                                │
      │                                  │  5. Emails sent to signers     │
      │                                  │◀───────────────────────────────│
      │                                  │                                │
      │  6. Success response             │                                │
      │◀─────────────────────────────────│                                │
      │  { requestId, message }          │                                │
```

### Authentication Flow

```
Backend                              Zoho OAuth
   │                                     │
   │  1. POST /oauth/v2/token            │
   │  (refresh_token + client creds)     │
   │────────────────────────────────────▶│
   │                                     │
   │  2. { access_token, expires_in }    │
   │◀────────────────────────────────────│
   │                                     │
   │  3. Cache token in memory           │
   │  4. Reuse until < 5 min remaining   │
   │  5. Auto-refresh when expired       │
```

---

## Backend API Reference

| Method | Endpoint                            | Description                              |
|--------|-------------------------------------|------------------------------------------|
| `POST` | `/api/send-for-signing`             | Upload PDF and create signing request    |
| `GET`  | `/api/requests`                     | List all signing requests                |
| `GET`  | `/api/requests/:id`                | Get request detail with signer statuses  |
| `GET`  | `/api/requests/:id/download`       | Download signed PDF                      |
| `GET`  | `/api/requests/:id/certificate`    | Download completion certificate          |
| `POST` | `/api/requests/:id/remind`         | Send reminder to current pending signer  |
| `POST` | `/api/requests/:id/recall`         | Cancel/recall a signing request          |
| `POST` | `/api/webhook/zoho-sign`           | Receive Zoho Sign webhook events         |
| `GET`  | `/api/health`                      | Health check                             |

### POST `/api/send-for-signing`

**Content-Type**: `multipart/form-data`

| Field           | Type   | Required | Description                                    |
|-----------------|--------|----------|------------------------------------------------|
| `file`          | File   | Yes      | PDF file (max 20MB)                            |
| `employeeName`  | String | No       | Employee name (POC: falls back to Chetan)      |
| `employeeEmail` | String | No       | Employee email (POC: falls back to Chetan)     |

**Response**:
```json
{
  "success": true,
  "requestId": "12345678901234567",
  "message": "Signing request created. Abhishek will receive the document first.",
  "data": { ... }
}
```

---

## Frontend Pages

### Dashboard (`/dashboard`)
- **4 stat cards**: Total Requests, In Progress, Completed, Needs Attention.
- **Request table** with columns: Name, Date, Status (badge), Progress (ring), Current Signer, View link.
- **Auto-refresh**: Fetches latest data every 30 seconds.
- **Manual refresh** button.
- **Skeleton loading** with shimmer animation.
- **Empty state** with "Create First Request" button.

### New Request (`/new`)
- **PDF upload zone**: Drag-and-drop or click to browse.
- **PDF validation**: Only `.pdf` files accepted, up to 20MB.
- **File preview**: Shows filename, size, and remove button after selection.
- **Submit button**: "Send for Signing" with loading spinner.
- **Success toast**: Shows confirmation with link to track the request.
- **Error toast**: Shows error message if submission fails.
- **No employee fields** (POC mode — hardcoded to Chetan from `.env`).

### Request Detail (`/request/:id`)
- **Gradient progress bar** showing signing completion percentage.
- **Signer timeline**: Vertical timeline showing each signer's status (Signed, Waiting, Viewed).
- **Request details**: ID, creation date, expiration, notes.
- **Action buttons**:
  - Send Reminder (for pending signers)
  - Cancel Request (recall)
  - Download Signed PDF (when completed)
  - Download Certificate (when completed)
- **Skeleton loading** while data loads.

---

## Zoho Sign Integration Details

### API Base URL
Depends on datacenter configured in `ZOHO_DC`:
- India: `https://sign.zoho.in/api/v1`
- US: `https://sign.zoho.com/api/v1`
- EU: `https://sign.zoho.eu/api/v1`

### Two-Step Signing Flow
Zoho Sign requires a two-step process:

1. **Create Draft** — `POST /api/v1/requests`
   - Sends the PDF file + request metadata (signers, order, etc.) as multipart form data.
   - Zoho auto-parses text tags in the document and assigns fields to signers.
   - Returns the draft with `request_id` and `actions` array (with detected fields).

2. **Submit for Signing** — `POST /api/v1/requests/{request_id}/submit`
   - Sends the `action_id`s from the draft response.
   - **Critical**: Must use the action definitions from the draft response (which include auto-detected fields), NOT the original action definitions we sent during creation.
   - Triggers email notifications to the first signer.

### Rate Limiting
- Zoho Sign enforces rate limits (HTTP 429).
- The backend implements **exponential backoff retry** (up to 3 retries).
- Wait times: 2s, 4s, 8s.

### Request Configuration
```json
{
  "requests": {
    "request_name": "Appointment Letter - <employee_name>",
    "is_sequential": true,
    "expiration_days": 15,
    "email_reminders": true,
    "reminder_period": 3,
    "notes": "Appointment letter for <employee_name>",
    "actions": [ ... ]
  }
}
```

---

## Text Tags in Documents

Zoho Sign text tags are special placeholders embedded in the PDF/document that Zoho automatically converts into signing fields (signature boxes, date pickers, text fields, etc.).

### Supported Tag Formats

| Tag                          | Type           | Description                        |
|------------------------------|----------------|------------------------------------|
| `{{Signature:RecipientN*}}`  | Signature      | Signature field (required)         |
| `{{Fullname:RecipientN}}`    | Full Name      | Auto-filled signer name            |
| `{{Email:RecipientN}}`       | Email          | Auto-filled signer email           |
| `{{D:RecipientN*}}`          | Date Picker    | Date field with calendar picker    |
| `{{Textfield:RecipientN:Label*}}` | Text Field | Custom text input                 |

### Important Notes on Text Tags

1. **`RecipientN`** maps to the signer at `signing_order: N-1` (i.e., Recipient1 = signing_order 0).
2. **Asterisk `*`** marks a field as required.
3. **`{{Date:RecipientN*}}`** does NOT work — use **`{{D:RecipientN*}}`** for date picker.
4. **`{{Textfield:RecipientN:Date*}}`** gives a text input (not a date picker).
5. Tags are **auto-parsed by Zoho** during draft creation — no special API flag needed.
6. Tags must be **intact** in the document (not split across formatting runs in the XML).

### Current Document Tags (POC — 2 recipients)

| Tag                         | Assigned To            | Page |
|-----------------------------|------------------------|------|
| `{{Signature:Recipient1*}}` | Abhishek (Signer 1)   | 1    |
| `{{Fullname:Recipient1}}`   | Abhishek (Signer 1)   | 1    |
| `{{D:Recipient1*}}`         | Abhishek (Signer 1)   | 1    |
| `{{Signature:Recipient2*}}` | Chetan/Employee (Signer 2) | 3 |
| `{{Email:Recipient2}}`      | Chetan/Employee (Signer 2) | 3 |

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Zoho OAuth — obtain from https://api-console.zoho.in/
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_DC=in                          # in | com | eu (Zoho datacenter)

# Fixed Signers
ABHISHEK_NAME=Abhishek
ABHISHEK_EMAIL=abhishek@pierian.com
CHETAN_NAME=Chetan
CHETAN_EMAIL=chetan@pierian.com

# Fixed Viewer (view-only — does NOT sign)
JAGDISH_NAME=Jagdish
JAGDISH_EMAIL=jagdish@pierian.com

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### How to get Zoho OAuth credentials:

1. Go to [Zoho API Console](https://api-console.zoho.in/).
2. Create a **Server-based Application**.
3. Set the redirect URI (e.g., `https://sign.zoho.in`).
4. Note the **Client ID** and **Client Secret**.
5. Generate a grant token with these scopes:
   ```
   ZohoSign.documents.CREATE,ZohoSign.documents.READ,ZohoSign.documents.UPDATE,ZohoSign.templates.READ,ZohoSign.templates.CREATE,ZohoSign.account.READ
   ```
6. Exchange the grant token for a **Refresh Token**:
   ```
   POST https://accounts.zoho.in/oauth/v2/token
     ?code=GRANT_TOKEN
     &client_id=CLIENT_ID
     &client_secret=CLIENT_SECRET
     &grant_type=authorization_code
   ```

---

## Setup & Installation

### Prerequisites
- **Node.js 18+** installed
- **Zoho Sign paid plan** with API access enabled
- Zoho OAuth credentials (Client ID, Client Secret, Refresh Token)

### 1. Clone and configure

```bash
git clone <repository-url>
cd Sign
cp .env.example .env
# Edit .env with your credentials
```

### 2. Install and run the backend

```bash
npm install
npm run dev
```

The backend starts on `http://localhost:3001`.

### 3. Install and run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

### 4. Open the application

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

### Creating a Signing Request (POC)
1. Click **"New Request"** in the navigation bar.
2. Drag-and-drop a PDF file or click to browse.
3. Click **"Send for Signing"**.
4. The system sends the document to Abhishek first, then Chetan.
5. A success message appears with a link to track the request.

### Tracking Requests
1. Go to the **Dashboard** to see all requests.
2. Click **"View"** on any request to see detailed signer progress.
3. The dashboard auto-refreshes every 30 seconds.

### Actions on a Request
- **Send Reminder**: Nudge the current pending signer via email.
- **Cancel Request**: Recall the document (cancels the signing process).
- **Download PDF**: Available after all parties have signed.
- **Download Certificate**: Zoho Sign completion certificate.

---

## Known Limitations & Issues Encountered

### 1. Zoho Plan Recipient Limit
- **Issue**: Current Zoho Sign plan allows **maximum 2 recipients** per request.
- **Error**: `Code 9108: "You have exceeded the maximum number of recipients - 3"`
- **Impact**: Cannot add Chetan as a separate signer or Jagdish as viewer.
- **Resolution**: Reduced to 2 recipients for POC. Production requires plan upgrade.

### 2. Text Tag `is_texttags` Not Supported
- **Issue**: Passing `is_texttags: true` in the API request body causes an error.
- **Error**: `Code 9043: "Extra key found: is_texttags"`
- **Resolution**: Removed the flag. Zoho auto-parses text tags during draft creation. The submit step uses `action_id`s from the draft response which already contain detected fields.

### 3. Signer Field Requirement
- **Issue**: Submitting a request without any detected fields for a signer causes an error.
- **Error**: `Code 9101: "Add at least one field for a signer"`
- **Resolution**: Ensured text tags are properly embedded in the PDF and that the submit step passes the actions from the draft response (which include auto-detected fields).

### 4. Date Tag Format
- **Issue**: `{{Date:Recipient1*}}` is not recognized by Zoho Sign — appears as plain text in the signed document.
- **Resolution**: Use the short form `{{D:Recipient1*}}` which renders as a proper date picker. The long form `{{Textfield:Recipient1:Date*}}` works but gives a plain text input instead of a date picker.

### 5. Download Filename Duplication
- **Issue**: The download filename was `"Appointment Letter - Appointment Letter - <name>.pdf"` (double prefix).
- **Cause**: The Zoho request name was already set to `"Appointment Letter - <name>"`, and the download route was adding the prefix again.
- **Resolution**: The download route now uses the request name directly as the filename without adding an extra prefix.

---

## Troubleshooting

| Problem                         | Possible Cause                                    | Solution                                                             |
|---------------------------------|---------------------------------------------------|----------------------------------------------------------------------|
| 401 Unauthorized                | Invalid or expired Zoho OAuth credentials         | Check `.env` credentials. Ensure refresh token is valid.             |
| 429 Rate Limited                | Too many API calls                                | Built-in retry handles this. If persistent, reduce request frequency.|
| CORS errors                     | Frontend URL mismatch                             | Ensure `FRONTEND_URL` in `.env` matches the frontend dev server URL. |
| "No PDF file uploaded"          | Missing file in request                           | Ensure the file input is properly sending the PDF.                   |
| Text tags not parsed            | Tags split across formatting runs in the document | Re-type the tags in the document or use a plain text editor.         |
| Date shows as text input        | Using `{{Date:...}}` format                       | Use `{{D:RecipientN*}}` format instead.                              |
| "exceeded maximum recipients"   | Zoho plan limit                                   | Upgrade Zoho Sign plan or reduce number of recipients.               |
| Download filename wrong         | Request name already has prefix                   | Fixed — download route uses request name directly.                   |

---

## Dependencies

### Backend (`package.json`)
| Package     | Version  | Purpose                        |
|-------------|----------|--------------------------------|
| express     | ^4.21.0  | HTTP server framework          |
| axios       | ^1.7.0   | HTTP client for Zoho API       |
| cors        | ^2.8.5   | Cross-origin request handling  |
| dotenv      | ^16.4.0  | Environment variable loading   |
| form-data   | ^4.0.0   | Multipart form encoding        |
| multer      | ^2.1.1   | File upload handling            |

### Frontend (`frontend/package.json`)
| Package         | Version  | Purpose                      |
|-----------------|----------|------------------------------|
| react           | ^18.3.0  | UI framework                 |
| react-dom       | ^18.3.0  | DOM rendering                |
| react-router-dom| ^6.26.0  | Client-side routing          |
| axios           | ^1.7.0   | HTTP client                  |
| tailwindcss     | ^3.4.0   | Utility-first CSS framework  |
| vite            | ^5.4.0   | Build tool & dev server      |
| autoprefixer    | ^10.4.0  | CSS vendor prefixing         |
| postcss         | ^8.4.0   | CSS processing               |

---

*Documentation last updated: March 2026*