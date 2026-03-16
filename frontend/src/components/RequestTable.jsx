import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

function getProgress(actions) {
  if (!actions) return { signed: 0, total: 0, currentSigner: null };
  const signActions = actions.filter((a) => a.action_type === 'SIGN');
  const signed = signActions.filter((a) => a.action_status === 'SIGNED').length;
  const current = signActions.find(
    (a) => a.action_status !== 'SIGNED' && a.action_type === 'SIGN'
  );
  return { signed, total: signActions.length, currentSigner: current?.recipient_name || null };
}

function ProgressRing({ signed, total }) {
  const pct = total > 0 ? (signed / total) * 100 : 0;
  const r = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex items-center gap-2.5">
      <svg width="36" height="36" className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#e8ecf4" strokeWidth="3" />
        <circle
          cx="18" cy="18" r={r} fill="none"
          stroke={pct >= 100 ? '#10b981' : '#4c6ef5'}
          strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="text-sm font-medium text-ink-700">
        {signed}/{total}
      </span>
    </div>
  );
}

export default function RequestTable({ requests }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-ink-300" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-ink-500 font-medium mb-1">No signing requests yet</p>
        <p className="text-ink-400 text-sm mb-5">Create your first request to get started</p>
        <Link to="/new" className="btn-primary text-sm">
          Create Request
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-200">
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-ink-400 uppercase tracking-wider">Request</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-ink-400 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-ink-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-ink-400 uppercase tracking-wider">Progress</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-ink-400 uppercase tracking-wider">Current Signer</th>
            <th className="px-6 py-3.5 text-right text-xs font-semibold text-ink-400 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, i) => {
            const { signed, total, currentSigner } = getProgress(req.actions);
            return (
              <tr
                key={req.request_id}
                className="border-b border-surface-100 hover:bg-brand-50/30 transition-colors duration-150 animate-fade-in-up opacity-0"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-ink-900">{req.request_name}</p>
                </td>
                <td className="px-6 py-4 text-sm text-ink-500">
                  {req.created_time
                    ? new Date(req.created_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '\u2014'}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={req.request_status} />
                </td>
                <td className="px-6 py-4">
                  <ProgressRing signed={signed} total={total} />
                </td>
                <td className="px-6 py-4">
                  {currentSigner ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-brand-700">
                          {currentSigner.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-ink-700">{currentSigner}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-ink-400">
                      {req.request_status === 'completed' ? 'All signed' : '\u2014'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/request/${req.request_id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors group"
                  >
                    View
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-transform group-hover:translate-x-0.5">
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}