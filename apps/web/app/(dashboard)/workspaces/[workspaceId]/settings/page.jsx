'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../../../lib/api';
import { useAuthStore } from '../../../../../store/authStore';
import { useWorkspaceStore } from '../../../../../store/workspaceStore';
import { usePermissions } from '../../../../../hooks/usePermissions';

export default function SettingsPage() {
  const { workspaceId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { members, currentWorkspace, setCurrentWorkspace, fetchWorkspaces } = useWorkspaceStore();

  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);

  // General form
  const [form, setForm] = useState({ name: '', description: '', accentColor: '#6366f1' });
  const [saving, setSaving] = useState(false);

  // Danger zone
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const { isAdmin, canDeleteWorkspace } = usePermissions();
  
  // Audit log
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actorFilter, setActorFilter] = useState('');

  useEffect(() => {
    if (!workspaceId) return;

    const fetchWorkspace = async () => {
      try {
        const res = await api.get(`/workspaces/${workspaceId}`);
        const ws = res.data.data.workspace;
        setWorkspace(ws);
        setForm({ name: ws.name || '', description: ws.description || '', accentColor: ws.accentColor || '#6366f1' });
      } catch (err) {
        toast.error('Failed to load workspace settings');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  const fetchLogs = async (page = 1, actorId = '') => {
    setLogsLoading(true);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/analytics/audit-log`, {
        params: { page, limit: 15, actorId }
      });
      setLogs(res.data.data.logs);
      setTotalPages(res.data.data.pagination.totalPages);
      setLogsPage(page);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId && isAdmin) {
      fetchLogs(1, actorFilter);
    }
  }, [workspaceId, isAdmin, actorFilter]);

  // Redirect non-admins
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace(`/workspaces/${workspaceId}`);
    }
  }, [loading, isAdmin, workspaceId, router]);

  // Live accent color preview
  useEffect(() => {
    if (form.accentColor) {
      document.documentElement.style.setProperty('--accent-live-preview', form.accentColor);
    }
  }, [form.accentColor]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Workspace name is required');
    setSaving(true);
    try {
      const res = await api.patch(`/workspaces/${workspaceId}`, {
        name: form.name.trim(),
        description: form.description.trim(),
        accentColor: form.accentColor,
      });
      const updated = res.data.data.workspace;
      setWorkspace(updated);
      setCurrentWorkspace({ ...currentWorkspace, ...updated });
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      toast.success('Workspace deleted');
      // Clear store and redirect
      setCurrentWorkspace(null);
      await fetchWorkspaces();
      router.replace('/workspaces');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workspace');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const exportAuditCSV = () => {
    if (!logs.length) return;
    
    const headers = ['Timestamp', 'Actor', 'Action', 'Metadata'];
    const rows = logs.map(l => [
      new Date(l.createdAt).toISOString(),
      l.actor?.name || 'Unknown',
      l.action,
      JSON.stringify(l.metadata || {})
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_log_${workspaceId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatAction = (action) => {
    const map = {
      'GOAL_CREATED': 'created a new goal',
      'GOAL_DELETED': 'deleted a goal',
      'ANNOUNCEMENT_CREATED': 'posted a new announcement',
      'ANNOUNCEMENT_DELETED': 'deleted an announcement',
      'MEMBER_INVITED': 'invited a new member',
      'MEMBER_REMOVED': 'removed a member',
      'WORKSPACE_UPDATED': 'updated workspace settings',
    };
    return map[action] || action.toLowerCase().replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse" style={{ height: i === 1 ? '320px' : '160px', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-primary)', marginBottom: '24px' }} />
          ))}
        </div>
      </div>
    );
  }

  const PRESET_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{
        height: '64px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)',
        display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0,
      }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          Workspace Settings
        </h1>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ── SECTION 1: General ── */}
          <div style={cardSt}>
            <div style={sectionHeaderSt}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
              <h2 style={sectionTitleSt}>General</h2>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelSt}>Workspace Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputSt} placeholder="My Workspace" />
                </div>
                <div>
                  <label style={labelSt}>Description</label>
                  <textarea
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ ...inputSt, minHeight: '80px', resize: 'vertical' }} placeholder="What is this workspace about?"
                  />
                </div>
                <div>
                  <label style={labelSt}>Accent Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Color presets */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color} type="button"
                          onClick={() => setForm({ ...form, accentColor: color })}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px', background: color,
                            border: form.accentColor === color ? '3px solid var(--text-primary)' : '3px solid transparent',
                            cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s',
                            transform: form.accentColor === color ? 'scale(1.1)' : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>

                    {/* Custom color picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                      <input
                        type="color" value={form.accentColor}
                        onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                        style={{ width: '24px', height: '24px', border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {form.accentColor}
                      </span>
                    </div>
                  </div>

                  {/* Live preview */}
                  <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '8px', background: form.accentColor + '15', border: `1px solid ${form.accentColor}30`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: form.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', fontFamily: "'Syne', sans-serif" }}>
                      {form.name?.slice(0, 2).toUpperCase() || 'WS'}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: form.accentColor }}>{form.name || 'Workspace'}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>Live preview</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={saving} style={{ ...submitBtnSt, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* ── SECTION 2: Audit Log ── */}
          <div style={cardSt}>
            <div style={{ ...sectionHeaderSt, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <h2 style={sectionTitleSt}>Audit Log</h2>
              </div>
              <button 
                onClick={exportAuditCSV}
                style={{ background: 'none', border: '1px solid var(--border-primary)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Export CSV
              </button>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <select 
                value={actorFilter} 
                onChange={(e) => setActorFilter(e.target.value)}
                style={{ ...inputSt, width: 'auto', padding: '6px 10px', fontSize: '12px' }}
              >
                <option value="">All Actors</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logsLoading && logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>Loading logs...</div>
              ) : logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>No audit logs found.</div>
              ) : (
                <>
                  {logs.map((log) => (
                    <div key={log.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                        {log.actor?.name?.slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          <strong style={{ fontWeight: 600 }}>{log.actor?.name || 'Unknown'}</strong> {formatAction(log.action)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                      <button 
                        disabled={logsPage === 1}
                        onClick={() => fetchLogs(logsPage - 1, actorFilter)}
                        style={{ background: 'none', border: '1px solid var(--border-primary)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', opacity: logsPage === 1 ? 0.5 : 1, cursor: logsPage === 1 ? 'default' : 'pointer' }}
                      >
                        Previous
                      </button>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
                        Page {logsPage} of {totalPages}
                      </span>
                      <button 
                        disabled={logsPage === totalPages}
                        onClick={() => fetchLogs(logsPage + 1, actorFilter)}
                        style={{ background: 'none', border: '1px solid var(--border-primary)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', opacity: logsPage === totalPages ? 0.5 : 1, cursor: logsPage === totalPages ? 'default' : 'pointer' }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── SECTION 3: Danger Zone ── */}
          {canDeleteWorkspace && (
            <div style={{ ...cardSt, borderColor: 'rgba(239,68,68,0.3)' }}>
              <div style={sectionHeaderSt}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <h2 style={{ ...sectionTitleSt, color: '#ef4444' }}>Danger Zone</h2>
              </div>

              <div style={{ padding: '16px', background: 'rgba(239,68,68,0.04)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Delete this workspace</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                      Once deleted, all goals, action items, announcements, and members will be permanently removed. This action cannot be undone.
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    style={{
                      padding: '8px 20px', background: '#ef4444', color: '#fff', border: 'none',
                      borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                  >
                    Delete Workspace
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalOpen && (
        <div style={modalOverlaySt}>
          <div style={modalBoxSt}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>
                Delete Workspace
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This will permanently delete <strong style={{ color: 'var(--text-primary)' }}>{workspace?.name}</strong> and all of its data. This action is irreversible.
              </p>

              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <label style={{ ...labelSt, textTransform: 'none', letterSpacing: 0 }}>
                  Type <strong style={{ color: '#ef4444' }}>{workspace?.name}</strong> to confirm:
                </label>
                <input
                  type="text" value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  style={{ ...inputSt, borderColor: deleteConfirmText === workspace?.name ? '#10b981' : 'var(--border-primary)' }}
                  placeholder={workspace?.name}
                  autoFocus
                />
              </div>
            </div>

            <div style={modalFooterSt}>
              <button onClick={() => { setDeleteModalOpen(false); setDeleteConfirmText(''); }} style={cancelBtnSt}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== workspace?.name || deleting}
                style={{
                  ...submitBtnSt, background: '#ef4444', flex: 1,
                  opacity: (deleteConfirmText !== workspace?.name || deleting) ? 0.4 : 1,
                  cursor: (deleteConfirmText !== workspace?.name || deleting) ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? 'Deleting...' : 'I understand, delete this workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ──
const cardSt = { background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-primary)', padding: '24px', boxShadow: 'var(--shadow-sm)' };
const sectionHeaderSt = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' };
const sectionTitleSt = { margin: 0, fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' };
const labelSt = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputSt = { width: '100%', padding: '10px 14px', boxSizing: 'border-box', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px', outline: 'none', color: 'var(--text-primary)', transition: 'border-color 0.15s' };
const submitBtnSt = { padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s, opacity 0.15s' };
const modalOverlaySt = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' };
const modalBoxSt = { background: 'var(--bg-primary)', width: '100%', maxWidth: '480px', borderRadius: '16px', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' };
const modalFooterSt = { padding: '16px 24px', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: '12px', background: 'var(--bg-secondary)' };
const cancelBtnSt = { padding: '10px 20px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flex: 1 };
