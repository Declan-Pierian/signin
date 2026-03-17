import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendForSigning } from '../api/client';

export default function NewRequest() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please upload the appointment letter PDF'); return; }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendForSigning({ file });
      setSuccess({ message: result.message, requestId: result.requestId });
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : 0;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900 tracking-tight">New Signing Request</h1>
        <p className="text-ink-400 mt-1">Upload an appointment letter and send it for signing</p>
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
        {/* Upload Card */}
        <div className="section-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-600" strokeLinecap="round">
                <path d="M14 10v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3" />
                <path d="M8 10V2" />
                <path d="M4.5 5.5L8 2l3.5 3.5" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-ink-900">Appointment Letter</h2>
          </div>

          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
                dragOver
                  ? 'border-brand-400 bg-brand-50/50'
                  : 'border-surface-300 hover:border-brand-300 hover:bg-surface-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  dragOver ? 'bg-brand-100' : 'bg-surface-100'
                }`}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={dragOver ? 'text-brand-600' : 'text-ink-300'}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M12 18v-6" />
                    <path d="M9 15l3-3 3 3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-700">
                    Drop your PDF here or <span className="text-brand-600">browse</span>
                  </p>
                  <p className="text-xs text-ink-400 mt-1">PDF files only, up to 20MB</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl border border-surface-200 animate-scale-in">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-500">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" />
                  <text x="12" y="17" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="700">PDF</text>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{file.name}</p>
                <p className="text-xs text-ink-400 mt-0.5">{fileSizeMB} MB</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading || !file} className="btn-primary w-full py-4 text-base">
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