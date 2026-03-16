const ACTION_STATUS_ICON = {
  SIGNED: { icon: '\u2713', color: 'text-green-600', bg: 'bg-green-100' },
  VIEWED: { icon: '\u25CB', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  UNOPENED: { icon: '\u2022', color: 'text-gray-400', bg: 'bg-gray-100' },
  NOACTION: { icon: '\u2014', color: 'text-gray-300', bg: 'bg-gray-50' },
};

export default function SignerProgress({ actions }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="space-y-3">
      {actions.map((action, i) => {
        const isViewOnly = action.action_type === 'VIEW';
        const statusInfo = ACTION_STATUS_ICON[action.action_status] || ACTION_STATUS_ICON.UNOPENED;

        return (
          <div
            key={action.action_id || i}
            className={`flex items-center space-x-3 p-3 rounded-lg ${
              isViewOnly ? 'bg-gray-50 opacity-70' : 'bg-white border border-gray-200'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isViewOnly ? 'text-gray-500 italic' : 'text-gray-900'}`}>
                {action.recipient_name}
              </p>
              <p className="text-xs text-gray-500">
                {action.recipient_email}
                {isViewOnly && ' — View only (receives signed copy)'}
              </p>
            </div>
            <div className="flex-shrink-0">
              {isViewOnly ? (
                <span className="text-xs text-gray-400 italic">VIEW</span>
              ) : (
                <span className={`text-xs font-medium ${statusInfo.color}`}>
                  {action.action_status}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}