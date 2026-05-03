'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

const inputBase = {
  width: '100%', padding: '11px 14px', boxSizing: 'border-box',
  fontSize: '14px', fontFamily: "'DM Sans', sans-serif", color: '#111827',
  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px',
  outline: 'none', transition: 'border-color 0.15s, background 0.15s',
};
const labelBase = {
  display: 'block', fontSize: '11px', fontWeight: 500, color: '#6b7280',
  textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px',
};

function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Strong', 'Very strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#10b981', '#10b981'];

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const strength = getStrength(form.password);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const focusStyle = (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; };
  const blurStyle = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
      });
      setUser(res.data.data.user);
      toast.success('Account created! Welcome to FredoFlow.');
      router.push('/workspaces');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 'clamp(22px, 4vw, 28px)',
          fontWeight: 800, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.4px',
        }}>Create your account</h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Already have one?{' '}
          <Link href="/login" style={{ color: '#6366f1', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: '16px', padding: '10px 14px',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '8px', fontSize: '13px', color: '#dc2626',
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelBase}>First name</label>
            <input name="firstName" type="text" placeholder="John"
              value={form.firstName} onChange={handleChange} style={inputBase}
              onFocus={focusStyle} onBlur={blurStyle} disabled={loading} />
          </div>
          <div>
            <label style={labelBase}>Last name</label>
            <input name="lastName" type="text" placeholder="Doe"
              value={form.lastName} onChange={handleChange} style={inputBase}
              onFocus={focusStyle} onBlur={blurStyle} disabled={loading} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label style={labelBase}>Work email</label>
          <div style={{ position: 'relative' }}>
            <input name="email" type="email" placeholder="john@company.com"
              value={form.email} onChange={handleChange}
              style={{ ...inputBase, paddingRight: '42px' }}
              onFocus={focusStyle} onBlur={blurStyle} disabled={loading} />
            <svg style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
            </svg>
          </div>
        </div>

        {/* Password + strength */}
        <div>
          <label style={labelBase}>Password</label>
          <input name="password" type="password" placeholder="Min. 8 characters"
            value={form.password} onChange={handleChange} style={inputBase}
            onFocus={focusStyle} onBlur={blurStyle} disabled={loading} />
          {form.password && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    flex: 1, height: '3px', borderRadius: '2px',
                    background: i <= strength ? STRENGTH_COLORS[strength] : '#e5e7eb',
                    transition: 'background 0.2s',
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: STRENGTH_COLORS[strength] || '#9ca3af' }}>
                {STRENGTH_LABELS[strength] || 'Enter a password'}
              </span>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div>
          <label style={labelBase}>Confirm password</label>
          <input name="confirm" type="password" placeholder="Repeat password"
            value={form.confirm} onChange={handleChange}
            style={{
              ...inputBase,
              borderColor: form.confirm && form.confirm !== form.password ? '#ef4444' : '#e5e7eb',
            }}
            onFocus={focusStyle} onBlur={blurStyle} disabled={loading} />
        </div>

        {/* Terms */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" required
            style={{ width: '14px', height: '14px', accentColor: '#6366f1', marginTop: '2px', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
            I agree to the{' '}
            <Link href="#" style={{ color: '#6366f1' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" style={{ color: '#6366f1' }}>Privacy Policy</Link>
          </span>
        </label>

        {/* Submit */}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '12px', marginTop: '4px',
          background: loading ? '#818cf8' : '#6366f1',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '14px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', transition: 'background 0.15s',
        }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#4f46e5'; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#6366f1'; }}
        >
          {loading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="animate-spin">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M16 21v-2a4 4 0 00-8 0v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          )}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
