import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestDetail, sendReminder, recallRequest, getDownloadUrl, getCertificateUrl } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import SignerProgress from '../components/SignerProgress';

function InfoItem({ label, value, mono }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">{label}</dt>
      <dd className={`text-sm text-ink-900 ${mono ? 'font-mono text-xs bg-surface-50 px-2 py-1 rounded-md inline-block' : ''}`}>
        {value || '\u2014'}
      </dd>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-6 w-32 shimmer-bg rounded animate-shimmer" />
      <div className="h-8 w-72 shimmer-bg rounded animate-shimmer" />
      <div className="section-card p-8 space-y-4">
        <div className="h-4 w-40 shimmer-bg rounded animate-shimmer" />
        <div className="h-3 w-full shimmer-bg rounded-full animate-shimmer" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <div className="w-10 h-10 shimmer-bg rounded-full animate-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 shimmer-bg rounded animate-shimmer" />
              <div className="h-3 w-48 shimmer-bg rounded animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

  if (loading) return <SkeletonDetail />;

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="section-card overflow-hidden animate-scale-in">
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-500" />
          <div className="p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary mt-4 text-sm">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-ink-400">Request not found.</p>
      </div>
    );
  }

  const isCompleted = request.request_status === 'completed';
  const isInProgress = request.request_status === 'inprogress';
  const actions = request.actions || [];
  const signActions = actions.filter((a) => a.action_type === 'SIGN');
  const signed = signActions.filter((a) => a.action_status === 'SIGNED').length;
  const pct = signActions.length > 0 ? (signed / signActions.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-brand-600 transition-colors mb-4 group"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-transform group-hover:-translate-x-0.5">
            <path d="M10 3l-5 5 5 5" />
          </svg>
          Dashboard
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-900 tracking-tight">{request.request_name}</h1>
            {request.notes && (
              <p className="text-sm text-ink-400 mt-1">{request.notes}</p>
            )}
          </div>
          <StatusBadge status={request.request_status} size="lg" />
        </div>
      </div>

      {/* Progress Card */}
      <div className="section-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink-900">Signing Progress</h2>
          <span className="text-sm font-medium text-ink-500">
            {signed} of {signActions.length} signed
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-surface-200 rounded-full h-2 mb-8 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ease-out ${
              pct >= 100
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                : 'bg-gradient-to-r from-brand-400 to-brand-600'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <SignerProgress actions={actions} />
      </div>

      {/* Request Info Card */}
      <div className="section-card p-6 sm:p-8">
        <h2 className="text-base font-semibold text-ink-900 mb-5">Request Details</h2>
        <dl className="grid grid-cols-2 gap-5">
          <InfoItem label="Request ID" value={request.request_id} mono />
          <InfoItem
            label="Created"
            value={request.created_time ? new Date(request.created_time).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : null}
          />
          {request.expiration_days && (
            <InfoItem label="Expires in" value={`${request.expiration_days} days`} />
          )}
        </dl>
      </div>

      {/* Action Buttons */}
      {(isInProgress || isCompleted) && (
        <div className="flex flex-wrap gap-3 animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          {isInProgress && (
            <>
              <button
                onClick={handleRemind}
                disabled={actionLoading === 'remind'}
                className="btn-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M8 2a4.5 4.5 0 0 1 4.5 4.5c0 2-.5 3.5-1.5 5h-6c-1-1.5-1.5-3-1.5-5A4.5 4.5 0 0 1 8 2z" />
                  <path d="M6 13.5a2 2 0 0 0 4 0" />
                </svg>
                {actionLoading === 'remind' ? 'Sending...' : 'Send Reminder'}
              </button>
              <button
                onClick={handleRecall}
                disabled={actionLoading === 'recall'}
                className="btn-danger"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M6 6l4 4M10 6l-4 4" />
                </svg>
                {actionLoading === 'recall' ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </>
          )}

          {isCompleted && (
            <>
              <a href={getDownloadUrl(id)} className="btn-success">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M8 2v9" />
                  <path d="M4.5 8L8 11.5 11.5 8" />
                  <path d="M3 14h10" />
                </svg>
                Download Signed PDF
              </a>
              <a href={getCertificateUrl(id)} className="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="2" width="12" height="12" rx="2" />
                  <path d="M5 6h6M5 9h4" />
                </svg>
                Download Certificate
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}