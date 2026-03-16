# Pierian Sign — Appointment Letter Signing Portal

Automates the appointment letter signing workflow at Pierian Services using the Zoho Sign API.

HR enters new employee details in a web portal and clicks one button. The system handles the entire signing flow:

1. **Abhishek** (Authorized Signatory) — signs on Page 1
2. **Chetan** (HR Head) — signs on Page 2
3. **Employee** (new joiner) — signs on Page 3 to accept
4. **Jagdish** (Management) — **view only** — receives the fully signed copy

## Prerequisites

- **Node.js 18+**
- **Zoho Sign paid plan** (with API access enabled)
- Zoho OAuth client credentials (Client ID, Client Secret, Refresh Token)

## Setup

### 1. Zoho OAuth Credentials

1. Go to [Zoho API Console](https://api-console.zoho.in/)
2. Create a **Server-based Application**
3. Set the redirect URI (e.g. `https://sign.zoho.in`)
4. Note the **Client ID** and **Client Secret**
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

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_DC=in

ABHISHEK_EMAIL=abhishek@pierian.com
CHETAN_EMAIL=chetan@pierian.com
JAGDISH_EMAIL=jagdish@pierian.com

PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Prepare the Appointment Letter Template

Place your `.docx` file at `templates/appointment_letter.docx`.

The template must contain Zoho Sign text tags:

| Tag | Assigned To | Page |
|-----|-------------|------|
| `{{Signature:Recipient1*}}` | Abhishek | 1 |
| `{{Fullname:Recipient1}}` | Abhishek | 1 |
| `{{Date:Recipient1*}}` | Abhishek | 1 |
| `{{Signature:Recipient2*}}` | Chetan | 2 |
| `{{Signature:Recipient3*}}` | Employee | 3 |
| `{{Email:Recipient3}}` | Employee | 3 |

No tags for Recipient4 (Jagdish) — he is view-only.

### 4. Install & Run

**Backend:**
```bash
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Usage

1. **New Request** — Fill in employee name, email, designation, and joining date. Click "Send for Signing".
2. **Dashboard** — View all signing requests with live status. Auto-refreshes every 30 seconds.
3. **Request Detail** — Track per-signer progress, send reminders, download signed PDFs, or cancel requests.

## Backend API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/send-for-signing` | Create and submit a signing request |
| `GET` | `/api/requests` | List all signing requests |
| `GET` | `/api/requests/:id` | Get request detail with signer status |
| `GET` | `/api/requests/:id/download` | Download signed PDF |
| `GET` | `/api/requests/:id/certificate` | Download completion certificate |
| `POST` | `/api/requests/:id/remind` | Send reminder to current signer |
| `POST` | `/api/requests/:id/recall` | Cancel/recall a signing request |
| `POST` | `/api/webhook/zoho-sign` | Receive Zoho Sign webhook events |
| `GET` | `/api/health` | Health check |

### POST `/api/send-for-signing` body:

```json
{
  "employeeName": "Rahul Sharma",
  "employeeEmail": "rahul@example.com",
  "designation": "Software Engineer",
  "joiningDate": "2026-04-01"
}
```

## Troubleshooting

- **401 Unauthorized**: Check your Zoho OAuth credentials in `.env`. Ensure the refresh token is valid and scopes are correct.
- **Template not found**: Ensure `templates/appointment_letter.docx` exists with proper text tags.
- **CORS errors**: The backend allows requests from `FRONTEND_URL` (default `http://localhost:5173`). Make sure the frontend runs on that port.
- **429 Rate Limited**: The backend has built-in exponential backoff retry. If persistent, reduce request frequency.
- **Wrong datacenter**: If your Zoho account is US-based, change `ZOHO_DC=com` in `.env`. For EU, use `ZOHO_DC=eu`.