'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import { useWorkspaceStore } from '../../../store/workspaceStore';

const ACCENT_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6','#f97316'];

export default function WorkspacesPage() {
  const router = useRouter();
  const { workspaces, fetchWorkspaces, setCurrentWorkspace } = useWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', accentColor: '#6366f1' });

  useEffect(() => {
    fetchWorkspaces().finally(() => setLoading(false));
  }, [fetchWorkspaces]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Workspace name is required.'); return; }
    setCreating(true);
    try {
      await api.post('/workspaces', form);
      await fetchWorkspaces();
      setModalOpen(false);
      setForm({ name: '', description: '', accentColor: '#6366f1' });
      toast.success('Workspace created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create workspace.');
    } finally { setCreating(false); }
  };

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 36px)', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.4px' }}>
            Your workspaces
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            Pick a workspace or create a new one to get started.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', background: '#6366f1', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '13px',
            fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'background 0.15s', flexShrink: 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New workspace
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {[1,2,3].map((i) => (
            <div key={i} style={{ height: '180px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }} className="animate-pulse" />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws.id} ws={ws} onSelect={() => { setCurrentWorkspace(ws); router.push(`/workspaces/${ws.id}`); }} />
          ))}
          {/* Add card */}
          <div
            onClick={() => setModalOpen(true)}
            style={{
              background: 'var(--bg-primary)', border: '1.5px dashed var(--border-secondary)',
              borderRadius: '12px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
              minHeight: '160px', cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>New workspace</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Invite your team and set goals</div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {modalOpen && (
        <Modal title="Create workspace" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Workspace name">
              <input
                type="text" placeholder="e.g. Product Team"
                value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
              />
            </FormField>
            <FormField label="Description (optional)">
              <input
                type="text" placeholder="What does this workspace do?"
                value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
              />
            </FormField>
            <FormField label="Accent colour">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                {ACCENT_COLORS.map((c) => (
                  <div key={c} onClick={() => setForm((p) => ({ ...p, accentColor: c }))}
                    style={{
                      width: '28px', height: '28px', borderRadius: '7px',
                      background: c, cursor: 'pointer',
                      border: form.accentColor === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                      transition: 'border-color 0.15s',
                    }} />
                ))}
              </div>
            </FormField>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button type="button" onClick={() => setModalOpen(false)} style={ghostBtnStyle}>Cancel</button>
              <button type="submit" disabled={creating} style={primaryBtnStyle}>
                {creating ? 'Creating...' : 'Create workspace'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function WorkspaceCard({ ws, onSelect }) {
  const members = ws._count?.members || ws.memberCount || 0;
  const goals = ws._count?.goals || 0;
  const items = ws._count?.actionItems || 0;

  return (
    <div
      onClick={onSelect}
      style={{
        background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
        borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-secondary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ height: '5px', background: ws.accentColor || '#6366f1' }} />
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '9px',
            background: ws.accentColor || '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 800, color: '#fff',
          }}>
            {ws.name?.slice(0, 2).toUpperCase()}
          </div>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{ws.name}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {ws.description || 'No description yet.'}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{members} member{members !== 1 ? 's' : ''}</div>
      </div>
      <div style={{ borderTop: '1px solid var(--border-primary)', padding: '10px 16px', background: 'var(--bg-secondary)', display: 'flex', gap: '14px' }}>
        {[['Goals', goals], ['Tasks', items]].map(([label, val]) => (
          <div key={label} style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> {label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */
function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: '16px',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: '12px',
        width: '100%', maxWidth: '440px',
        boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 12px', boxSizing: 'border-box',
  fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
  color: 'var(--text-primary)', background: 'var(--bg-secondary)',
  border: '1px solid var(--border-primary)', borderRadius: '8px', outline: 'none',
  transition: 'border-color 0.15s',
};
const primaryBtnStyle = {
  padding: '9px 18px', background: '#6366f1', color: '#fff',
  border: 'none', borderRadius: '8px', fontSize: '13px',
  fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
};
const ghostBtnStyle = {
  padding: '9px 16px', background: 'var(--bg-secondary)',
  color: 'var(--text-secondary)', border: '1px solid var(--border-primary)',
  borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
};
