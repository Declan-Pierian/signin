import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestDetail, sendReminder, recallRequest, getDownloadUrl, getCertificateUrl } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import SignerProgress from '../components/SignerProgress';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getRequestDetail(id);
        setRequest(result.data?.requests || null);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleRemind = async () => {
    setActionLoading('remind');
    try {
      await sendReminder(id);
      alert('Reminder sent successfully.');
    } catch (err) {
      alert('Failed to send reminder: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecall = async () => {
    if (!confirm('Are you sure you want to cancel this signing request?')) return;
    setActionLoading('recall');
    try {
      await recallRequest(id);
      alert('Request recalled successfully.');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to recall: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading request details...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {error}
      </div>
    );
  }

  if (!request) {
    return <div className="text-center py-12 text-gray-500">Request not found.</div>;
  }

  const isCompleted = request.request_status === 'completed';
  const isInProgress = request.request_status === 'inprogress';
  const actions = request.actions || [];
  const signActions = actions.filter((a) => a.action_type === 'SIGN');
  const signed = signActions.filter((a) => a.action_status === 'SIGNED').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-indigo-600 hover:underline mb-2 inline-block"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{request.request_name}</h1>
        </div>
        <StatusBadge status={request.request_status} />
      </div>

      {/* Progress summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Signing Progress</h2>
        <p className="text-sm text-gray-600 mb-4">
          {signed} of {signActions.length} signers completed
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all"
            style={{ width: `${signActions.length > 0 ? (signed / signActions.length) * 100 : 0}%` }}
          />
        </div>

        <SignerProgress actions={actions} />
      </div>

      {/* Request info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Request Info</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Request ID</dt>
            <dd className="font-mono text-gray-900">{request.request_id}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Created</dt>
            <dd className="text-gray-900">
              {request.created_time ? new Date(request.created_time).toLocaleString() : '—'}
            </dd>
          </div>
          {request.expiration_days && (
            <div>
              <dt className="text-gray-500">Expiration</dt>
              <dd className="text-gray-900">{request.expiration_days} days</dd>
            </div>
          )}
          {request.notes && (
            <div className="col-span-2">
              <dt className="text-gray-500">Notes</dt>
              <dd className="text-gray-900">{request.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {isInProgress && (
          <>
            <button
              onClick={handleRemind}
              disabled={actionLoading === 'remind'}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 text-sm font-medium"
            >
              {actionLoading === 'remind' ? 'Sending...' : 'Send Reminder'}
            </button>
            <button
              onClick={handleRecall}
              disabled={actionLoading === 'recall'}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 text-sm font-medium"
            >
              {actionLoading === 'recall' ? 'Cancelling...' : 'Recall / Cancel'}
            </button>
          </>
        )}

        {isCompleted && (
          <>
            <a
              href={getDownloadUrl(id)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium inline-block"
            >
              Download Signed PDF
            </a>
            <a
              href={getCertificateUrl(id)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium inline-block"
            >
              Download Certificate
            </a>
          </>
        )}
      </div>
    </div>
  );
}