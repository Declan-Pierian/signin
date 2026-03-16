const STATUS_MAP = {
  SIGNED: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3.5 8.5l3 3 6-6" className="animate-check-draw" style={{ strokeDasharray: 16 }} />
      </svg>
    ),
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 ring-1 ring-emerald-200',
    label: 'Signed',
    labelColor: 'text-emerald-600',
  },
  VIEWED: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="3" />
        <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
      </svg>
    ),
    color: 'text-amber-600',
    bg: 'bg-amber-50 ring-1 ring-amber-200',
    label: 'Viewed',
    labelColor: 'text-amber-600',
  },
  UNOPENED: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="5" strokeDasharray="3 3" />
      </svg>
    ),
    color: 'text-ink-300',
    bg: 'bg-surface-100 ring-1 ring-surface-200',
    label: 'Waiting',
    labelColor: 'text-ink-400',
  },
  NOACTION: {
    icon: <span className="text-xs">&mdash;</span>,
    color: 'text-ink-200',
    bg: 'bg-surface-50 ring-1 ring-surface-200',
    label: 'No action',
    labelColor: 'text-ink-300',
  },
};

export default function SignerProgress({ actions }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-[19px] top-6 bottom-6 w-px bg-surface-200" />

      <div className="space-y-1">
        {actions.map((action, i) => {
          const isViewOnly = action.action_type === 'VIEW';
          const statusInfo = STATUS_MAP[action.action_status] || STATUS_MAP.UNOPENED;

          return (
            <div
              key={action.action_id || i}
              className={`relative flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 animate-fade-in-up opacity-0 ${
                isViewOnly
                  ? 'opacity-60'
                  : 'hover:bg-surface-50'
              }`}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
            >
              {/* Status icon */}
              <div
                className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${statusInfo.bg} ${statusInfo.color}`}
              >
                {statusInfo.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${isViewOnly ? 'text-ink-400 italic' : 'text-ink-900'}`}>
                    {action.recipient_name}
                  </p>
                  {isViewOnly && (
                    <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-400 bg-surface-100 rounded-md">
                      View only
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-400 mt-0.5">
                  {action.recipient_email}
                </p>
              </div>

              {/* Status label */}
              <div className="flex-shrink-0">
                <span className={`text-xs font-semibold ${statusInfo.labelColor}`}>
                  {isViewOnly ? 'Receives copy' : statusInfo.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}