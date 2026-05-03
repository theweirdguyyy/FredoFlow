'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SERVER_BASE = API_BASE.replace('/api/v1', '');

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  // Avatar
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // ── Save name ──
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSavingName(true);
    try {
      const res = await api.patch('/auth/me', { name: name.trim() });
      setUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingName(false);
    }
  };

  // ── Upload avatar ──
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await api.post('/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      setUser(res.data.data.user);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload avatar');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ── Change password ──
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (pwForm.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    setSavingPw(true);
    try {
      await api.post('/auth/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const avatarSrc = user?.avatarUrl ? `${SERVER_BASE}${user.avatarUrl}` : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{
        height: '64px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)',
        display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0,
      }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          My Profile
        </h1>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ── SECTION 1: Profile Info ── */}
          <div style={cardSt}>
            <div style={sectionHeaderSt}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <h2 style={sectionTitleSt}>Profile Information</h2>
            </div>

            {/* Avatar Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
              <div style={{ position: 'relative' }}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1' }} />
                ) : (
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#fff',
                    fontFamily: "'Syne', sans-serif", border: '3px solid rgba(99,102,241,0.3)',
                  }}>
                    {initials}
                  </div>
                )}

                {/* Upload progress ring */}
                {uploading && (
                  <div style={{ position: 'absolute', inset: '-4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="4" />
                      <circle cx="40" cy="40" r="36" fill="none" stroke="#6366f1" strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - uploadProgress / 100)}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.2s ease' }}
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Profile Photo
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                  JPG, PNG, GIF, or WebP. Max 5MB.
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    padding: '8px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
                    borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
                    display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: uploading ? 0.6 : 1,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  {uploading ? `Uploading ${uploadProgress}%` : 'Upload Photo'}
                </button>
              </div>
            </div>

            {/* Name + Email form */}
            <form onSubmit={handleSaveName}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelSt}>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputSt} placeholder="Your name" />
                </div>
                <div>
                  <label style={labelSt}>Email Address</label>
                  <input type="email" value={user?.email || ''} readOnly style={{ ...inputSt, opacity: 0.6, cursor: 'not-allowed' }} />
                  <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'var(--text-tertiary)' }}>Email cannot be changed</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={savingName || name.trim() === user?.name}
                  style={{
                    ...submitBtnSt,
                    opacity: (savingName || name.trim() === user?.name) ? 0.5 : 1,
                    cursor: (savingName || name.trim() === user?.name) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {savingName ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* ── SECTION 2: Change Password ── */}
          <div style={cardSt}>
            <div style={sectionHeaderSt}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <h2 style={sectionTitleSt}>Change Password</h2>
            </div>

            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelSt}>Current Password</label>
                  <input
                    type="password" value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    style={inputSt} placeholder="Enter current password"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelSt}>New Password</label>
                    <input
                      type="password" value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      style={inputSt} placeholder="Min 8 characters"
                    />
                  </div>
                  <div>
                    <label style={labelSt}>Confirm New Password</label>
                    <input
                      type="password" value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      style={inputSt} placeholder="Re-enter new password"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={savingPw || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
                  style={{
                    ...submitBtnSt,
                    background: '#f59e0b',
                    opacity: (savingPw || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) ? 0.5 : 1,
                    cursor: (savingPw || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => { if (!savingPw) e.currentTarget.style.background = '#d97706' }}
                  onMouseLeave={(e) => { if (!savingPw) e.currentTarget.style.background = '#f59e0b' }}
                >
                  {savingPw ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Info */}
          <div style={{ ...cardSt, background: 'var(--bg-secondary)', border: '1px dashed var(--border-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Account created on {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Styles ──
const cardSt = { background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-primary)', padding: '24px', boxShadow: 'var(--shadow-sm)' };
const sectionHeaderSt = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' };
const sectionTitleSt = { margin: 0, fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' };
const labelSt = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputSt = { width: '100%', padding: '10px 14px', boxSizing: 'border-box', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px', outline: 'none', color: 'var(--text-primary)', transition: 'border-color 0.15s' };
const submitBtnSt = { padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s, opacity 0.15s' };
