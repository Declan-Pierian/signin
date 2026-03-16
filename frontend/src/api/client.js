import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export async function sendForSigning(data) {
  const res = await api.post('/send-for-signing', data);
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