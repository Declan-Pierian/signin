import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export async function sendForSigning({ file, employeeName, employeeEmail }) {
  const formData = new FormData();
  formData.append('file', file);
  // Only append employee details when provided (production use).
  // For POC, these are omitted and the backend falls back to .env values.
  if (employeeName) formData.append('employeeName', employeeName);
  if (employeeEmail) formData.append('employeeEmail', employeeEmail);
  const res = await api.post('/send-for-signing', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getRequests() {
  const res = await api.get('/requests');
  return res.data;
}

export async function getRequestDetail(requestId) {
  const res = await api.get(`/requests/${requestId}`);
  return res.data;
}

export async function sendReminder(requestId) {
  const res = await api.post(`/requests/${requestId}/remind`);
  return res.data;
}

export async function recallRequest(requestId) {
  const res = await api.post(`/requests/${requestId}/recall`);
  return res.data;
}

export function getDownloadUrl(requestId) {
  return `/api/requests/${requestId}/download`;
}

export function getCertificateUrl(requestId) {
  return `/api/requests/${requestId}/certificate`;
}

export default api;