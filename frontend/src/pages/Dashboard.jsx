import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getRequests } from '../api/client';
import RequestTable from '../components/RequestTable';

function StatCard({ label, value, color, icon, delay }) {
  return (
    <div
      className="section-card p-5 animate-fade-in-up opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center text-ink-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="px-6 py-5 flex items-center gap-6">
      <div className="h-4 w-48 shimmer-bg rounded animate-shimmer" />
      <div className="h-4 w-20 shimmer-bg rounded animate-shimmer" />
      <div className="h-5 w-24 shimmer-bg rounded-full animate-shimmer" />
      <div className="h-4 w-16 shimmer-bg rounded animate-shimmer" />
      <div className="flex-1" />
      <div className="h-4 w-12 shimmer-bg rounded animate-shimmer" />
    </div>
  );
}

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const result = await getRequests();
      setRequests(result.data?.requests || []);
      setError(null);
      setLastRefresh(new Date());
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

  const totalRequests = requests.length;
  const completedCount = requests.filter((r) => r.request_status === 'completed').length;
  const inProgressCount = requests.filter((r) => r.request_status === 'inprogress').length;
  const pendingAction = requests.filter(
    (r) => r.request_status === 'declined' || r.request_status === 'expired'
  ).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Dashboard</h1>
          <p className="text-ink-400 mt-1">Track all appointment letter signing requests</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-ink-300 hidden sm:block">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => { setLoading(true); fetchRequests(); }}
            className="btn-secondary text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={loading ? 'animate-spin' : ''}>
              <path d="M1 8a7 7 0 0 1 13.2-3.2" />
              <path d="M15 8a7 7 0 0 1-13.2 3.2" />
              <path d="M14.2 4.8V1.5h-3.3" />
              <path d="M1.8 11.2v3.3h3.3" />
            </svg>
            Refresh
          </button>
          <Link to="/new" className="btn-primary text-sm">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="8" y1="3" x2="8" y2="13" />
              <line x1="3" y1="8" x2="13" y2="8" />
            </svg>
            New Request
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total" value={totalRequests} color="text-ink-900" delay={50}
          icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M7 8h6M7 12h4" /></svg>}
        />
        <StatCard
          label="In Progress" value={inProgressCount} color="text-amber-600" delay={100}
          icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="7" /><path d="M10 6v4l2.5 2.5" /></svg>}
        />
        <StatCard
          label="Completed" value={completedCount} color="text-emerald-600" delay={150}
          icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="7" /><path d="M7 10l2 2 4-4" /></svg>}
        />
        <StatCard
          label="Needs Attention" value={pendingAction} color="text-red-600" delay={200}
          icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3l7.5 13H2.5L10 3z" /><path d="M10 9v3" /><circle cx="10" cy="14.5" r="0.5" fill="currentColor" /></svg>}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 section-card overflow-hidden animate-scale-in">
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-500" />
          <div className="p-4 flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <circle cx="9" cy="9" r="7" />
              <path d="M9 6v4" />
              <circle cx="9" cy="12.5" r="0.5" fill="#ef4444" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="section-card overflow-hidden">
          <div className="px-6 py-3.5 border-b border-surface-200 flex gap-6">
            {[120, 60, 80, 60, 90, 40].map((w, i) => (
              <div key={i} className="h-3 shimmer-bg rounded animate-shimmer" style={{ width: w }} />
            ))}
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-surface-100 last:border-0">
              <SkeletonRow />
            </div>
          ))}
        </div>
      ) : (
        <div className="section-card overflow-hidden">
          <RequestTable requests={requests} />
        </div>
      )}

      <p className="mt-5 text-xs text-ink-300 text-center">
        Auto-refreshes every 30 seconds
      </p>
    </div>
  );
}