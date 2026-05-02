'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      setUser(res.data.data.user);
      toast.success('Welcome back to FredoFlow!');
      router.push('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* ── shared input style ── */
  const inputStyle = {
    width: '100%',
    padding: '11px 42px 11px 14px',
    boxSizing: 'border-box',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    color: '#111827',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 500,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '6px',
  };

  return (
    <div>
      {/* ── HEADING ── */}
      <div style={{ marginBottom: '32px' }}>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '26px',
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 6px',
            letterSpacing: '-0.4px',
          }}
        >
          Welcome back
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          New to FredoFlow?{' '}
          <Link
            href="/register"
            style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}
          >
            Create an account
          </Link>
        </p>
      </div>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#dc2626',
          }}
        >
          {error}
        </div>
      )}

      {/* ── FORM ── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Email */}
        <div>
          <label htmlFor="email" style={labelStyle}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
              }}
            />
            {/* Envelope icon */}
            <svg
              style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
              }}
            />
            {/* Lock icon */}
            <svg
              style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
        </div>

        {/* Remember me + Forgot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              defaultChecked
              style={{ width: '14px', height: '14px', accentColor: '#6366f1', cursor: 'pointer', margin: 0 }}
            />
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Remember me</span>
          </label>
          <Link
            href="#"
            style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '4px',
            background: loading ? '#818cf8' : '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#4f46e5'; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#6366f1'; }}
        >
          {loading ? (
            /* Spinner */
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round"
              style={{ animation: 'spin 0.8s linear infinite' }}
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M15 3h6v18h-6" />
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
            </svg>
          )}
          {loading ? 'Signing in...' : 'Sign in to FredoFlow'}
        </button>
      </form>

      {/* ── DIVIDER ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '22px 0',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        <span style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
          or continue with
        </span>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
      </div>

      {/* ── GOOGLE BUTTON ── */}
      <button
        type="button"
        style={{
          width: '100%',
          padding: '11px',
          background: '#ffffff',
          color: '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}