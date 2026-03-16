import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

/**
 * Parse signing progress from actions array.
 * Only counts SIGN actions (not VIEW).
 */
function getProgress(actions) {
  if (!actions) return { signed: 0, total: 0, currentSigner: null };
  const signActions = actions.filter((a) => a.action_type === 'SIGN');
  const signed = signActions.filter((a) => a.action_status === 'SIGNED').length;
  const current = signActions.find(
    (a) => a.action_status !== 'SIGNED' && a.action_type === 'SIGN'
  );
  return { signed, total: signActions.length, currentSigner: current?.recipient_name || null };
}

export default function RequestTable({ requests }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No signing requests yet.{' '}
        <Link to="/new" className="text-indigo-600 hover:underline">
          Create one
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Signer</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((req) => {
            const { signed, total, currentSigner } = getProgress(req.actions);
            return (
              <tr key={req.request_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{req.request_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {req.created_time ? new Date(req.created_time).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={req.request_status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {signed} of {total} signed
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {currentSigner || (req.request_status === 'completed' ? 'All done' : '—')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Link
                    to={`/request/${req.request_id}`}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                  >
                    View Details
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