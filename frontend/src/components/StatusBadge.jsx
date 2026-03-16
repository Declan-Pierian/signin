const STATUS_CONFIG = {
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
  inprogress: {
    label: 'In Progress',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-600/20',
    dot: 'bg-amber-500 animate-pulse-soft',
  },
  declined: {
    label: 'Declined',
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-600/20',
    dot: 'bg-red-500',
  },
  expired: {
    label: 'Expired',
    bg: 'bg-surface-100',
    text: 'text-ink-500',
    ring: 'ring-ink-300/20',
    dot: 'bg-ink-400',
  },
  recalled: {
    label: 'Recalled',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-600/20',
    dot: 'bg-orange-500',
  },
};

const FALLBACK = {
  label: 'Unknown',
  bg: 'bg-surface-100',
  text: 'text-ink-500',
  ring: 'ring-ink-300/20',
  dot: 'bg-ink-400',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const key = (status || '').toLowerCase().replace(/[\s_-]/g, '');
  const cfg = STATUS_CONFIG[key] || FALLBACK;

  const sizeClasses = size === 'lg'
    ? 'px-3.5 py-1.5 text-sm'
    : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ring-1 ring-inset ${cfg.bg} ${cfg.text} ${cfg.ring} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}