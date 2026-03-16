import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendForSigning } from '../api/client';

const FIXED_PARTIES = [
  { name: 'Abhishek', role: 'Authorized Signatory', page: 'Page 1', type: 'SIGN' },
  { name: 'Chetan', role: 'HR Head', page: 'Page 2', type: 'SIGN' },
  { name: null, role: 'New Employee', page: 'Page 3', type: 'SIGN' },
  { name: 'Jagdish', role: 'Management', page: 'Receives signed copy', type: 'VIEW' },
];

function FormField({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function PartyCard({ party, index, employeeName }) {
  const isView = party.type === 'VIEW';
  const displayName = party.name || employeeName || 'Employee name';
  const isEmployee = party.name === null;

  return (
    <div
      className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 animate-fade-in-up opacity-0 ${
        isView
          ? 'bg-surface-50 border-surface-200 border-dashed'
          : 'bg-white border-surface-200 hover:border-brand-300 hover:shadow-soft'
      }`}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      {/* Order number */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 ${
          isView
            ? 'bg-surface-200 text-ink-400'
            : 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-soft group-hover:shadow-glow'
        }`}
      >
        {index + 1}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-semibold ${isView ? 'text-ink-400' : 'text-ink-900'}`}>
            {isEmployee && !employeeName ? (
              <span className="text-ink-300 italic">Enter employee name above</span>
            ) : (
              displayName
            )}
          </p>
          {isEmployee && employeeName && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium text-brand-600 bg-brand-50 rounded-md ring-1 ring-brand-200">
              New joiner
            </span>
          )}
        </div>
        <p className="text-xs text-ink-400 mt-0.5">
          {party.role} &middot; {party.page}
        </p>
      </div>

      {/* Type badge */}
      <div
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide ${
          isView
            ? 'bg-surface-200 text-ink-400'
            : 'bg-brand-50 text-brand-600 ring-1 ring-brand-200'
        }`}
      >
        {isView ? 'View' : 'Sign'}
      </div>
    </div>
  );
}

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
      setSuccess({ message: result.message, requestId: result.requestId });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900 tracking-tight">New Signing Request</h1>
        <p className="text-ink-400 mt-1">Send an appointment letter for signing</p>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-8 section-card overflow-hidden animate-scale-in">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
          <div className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
                <path d="M5 10.5l3.5 3.5 6.5-7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">{success.message}</p>
              <button
                onClick={() => navigate(`/request/${success.requestId}`)}
                className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors inline-flex items-center gap-1 group"
              >
                Track this request
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="mb-8 section-card overflow-hidden animate-scale-in">
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-500" />
          <div className="p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                <circle cx="10" cy="10" r="7" />
                <path d="M10 7v4" />
                <circle cx="10" cy="13.5" r="0.5" fill="#ef4444" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">Something went wrong</p>
              <p className="text-sm text-ink-500 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Details Card */}
        <div className="section-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-600">
                <circle cx="8" cy="5" r="3" />
                <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-ink-900">Employee Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Full Name" required>
              <input
                type="text"
                name="employeeName"
                value={form.employeeName}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g. Rahul Sharma"
              />
            </FormField>
            <FormField label="Email Address" required>
              <input
                type="email"
                name="employeeEmail"
                value={form.employeeEmail}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g. rahul@example.com"
              />
            </FormField>
            <FormField label="Designation / Role" required>
              <input
                type="text"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g. Software Engineer"
              />
            </FormField>
            <FormField label="Joining Date" required>
              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                required
                className="input-field"
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Department">
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g. Engineering (optional)"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Signing Flow Card */}
        <div className="section-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-600">
                <path d="M8.5 1.5l4 4-8 8H1v-3.5l8-8z" />
                <path d="M6.5 3.5l4 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink-900">Signing Flow</h2>
              <p className="text-xs text-ink-400">Sequential order — each party signs after the previous</p>
            </div>
          </div>

          <div className="space-y-2">
            {FIXED_PARTIES.map((party, i) => (
              <PartyCard
                key={i}
                party={party}
                index={i}
                employeeName={form.employeeName}
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending for Signing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Send for Signing
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 10h14" />
                <path d="M11 4l6 6-6 6" />
              </svg>
            </span>
          )}
        </button>
      </form>
    </div>
  );
}