import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendForSigning } from '../api/client';

const FIXED_PARTIES = [
  { name: 'Abhishek', role: 'Authorized Signatory', page: 'Page 1', type: 'SIGN' },
  { name: 'Chetan', role: 'HR Head', page: 'Page 2', type: 'SIGN' },
  { name: null, role: 'New Employee', page: 'Page 3', type: 'SIGN' },
  { name: 'Jagdish', role: 'Management', page: 'Receives signed copy', type: 'VIEW' },
];

export default function NewRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employeeName: '',
    employeeEmail: '',
    designation: '',
    joiningDate: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendForSigning(form);
      setSuccess({
        message: result.message,
        requestId: result.requestId,
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Signing Request</h1>

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">{success.message}</p>
          <button
            onClick={() => navigate(`/request/${success.requestId}`)}
            className="mt-2 text-sm text-green-700 underline hover:text-green-900"
          >
            Track this request
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Employee Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="employeeName"
                value={form.employeeName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Rahul Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="employeeEmail"
                value={form.employeeEmail}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. rahul@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation / Role *</label>
              <input
                type="text"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Engineering (optional)"
              />
            </div>
          </div>
        </div>

        {/* Signing Parties */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Signing Parties</h2>
          <div className="space-y-3">
            {FIXED_PARTIES.map((party, i) => {
              const isView = party.type === 'VIEW';
              const displayName = party.name || form.employeeName || '(Employee name)';
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isView
                      ? 'bg-gray-50 border-gray-200 opacity-70'
                      : 'bg-indigo-50 border-indigo-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isView ? 'bg-gray-200 text-gray-500' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isView ? 'text-gray-500 italic' : 'text-gray-900'}`}>
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {party.role} — {party.page}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      isView
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {party.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Sending for Signing...</span>
            </span>
          ) : (
            'Send for Signing'
          )}
        </button>
      </form>
    </div>
  );
}