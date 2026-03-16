const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-800',
  inprogress: 'bg-yellow-100 text-yellow-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
  recalled: 'bg-orange-100 text-orange-800',
};

const STATUS_LABELS = {
  completed: 'Completed',
  inprogress: 'In Progress',
  declined: 'Declined',
  expired: 'Expired',
  recalled: 'Recalled',
};

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase().replace(/[\s_-]/g, '');
  const style = STATUS_STYLES[key] || 'bg-gray-100 text-gray-600';
  const label = STATUS_LABELS[key] || status || 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}