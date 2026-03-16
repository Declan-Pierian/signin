import { useState, useEffect, useCallback } from 'react';
import { getRequests } from '../api/client';
import RequestTable from '../components/RequestTable';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const result = await getRequests();
      setRequests(result.data?.requests || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Signing Dashboard</h1>
        <button
          onClick={() => { setLoading(true); fetchRequests(); }}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading requests...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <RequestTable requests={requests} />
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400 text-center">Auto-refreshes every 30 seconds</p>
    </div>
  );
}