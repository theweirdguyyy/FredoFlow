'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../../../lib/api';
import { useAuthStore } from '../../../../../store/authStore';
import { useWorkspaceStore } from '../../../../../store/workspaceStore';
import { usePermissions } from '../../../../../hooks/usePermissions';

export default function MembersPage() {
  const { workspaceId } = useParams();
  const { user } = useAuthStore();
  const { onlineUserIds } = useWorkspaceStore();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'MEMBER' });
  const [inviting, setInviting] = useState(false);

  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const { canInviteMember, canRemoveMember, canChangeRole, isAdmin } = usePermissions();

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}`);
      setMembers(res.data.data.workspace.members || []);
    } catch (err) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchMembers();
    }
  }, [workspaceId]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      // Optimistic update
      setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, role: newRole } : m));
      await api.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role: newRole });
      toast.success('Role updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
      fetchMembers(); // revert
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${memberToRemove}`);
      toast.success('Member removed');
      setMembers((prev) => prev.filter((m) => m.userId !== memberToRemove));
      setRemoveModalOpen(false);
      setMemberToRemove(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return toast.error('Email is required');
    setInviting(true);
    try {
      await api.post(`/workspaces/${workspaceId}/invites`, inviteForm);
      toast.success('Invitation sent successfully');
      setInviteModalOpen(false);
      setInviteForm({ email: '', role: 'MEMBER' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const openRemoveModal = (userId) => {
    setMemberToRemove(userId);
    setRemoveModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{
        height: '64px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0
      }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          Workspace Members
        </h1>

        {canInviteMember && (
          <button onClick={() => setInviteModalOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#6366f1',
            color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Invite Member
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading members...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <tr>
                  <th style={thSt}>User</th>
                  <th style={thSt}>Role</th>
                  <th style={thSt}>Joined</th>
                  {isAdmin && <th style={{ ...thSt, textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const isOnline = onlineUserIds.includes(member.userId);
                  const isSelf = member.userId === user?.id;
                  const canEdit = isAdmin && member.role !== 'OWNER' && !isSelf;
                  const initials = member.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

                  let badgeCfg = { bg: '#f1f5f9', color: '#64748b' };
                  if (member.role === 'OWNER') badgeCfg = { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' };
                  else if (member.role === 'ADMIN') badgeCfg = { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' };

                  return (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border-primary)', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ position: 'relative' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%', background: '#818cf8',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '13px', fontWeight: 700, color: '#fff'
                            }}>
                              {initials}
                            </div>
                            {/* Online Indicator */}
                            <div style={{
                              position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px',
                              background: isOnline ? '#10b981' : '#94a3b8', border: '2px solid var(--bg-primary)',
                              borderRadius: '50%', transition: 'background 0.3s'
                            }} title={isOnline ? 'Online' : 'Offline'} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {member.user?.name}
                              {isSelf && <span style={{ fontSize: '10px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-tertiary)' }}>You</span>}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{member.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {(canChangeRole && member.role !== 'OWNER' && !isSelf) ? (
                          <select 
                            value={member.role} 
                            onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                            style={{
                              padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                              fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer'
                            }}
                          >
                            <option value="MEMBER">MEMBER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: badgeCfg.bg, color: badgeCfg.color }}>
                            {member.role}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {(canRemoveMember && member.role !== 'OWNER' && !isSelf) ? (
                            <button
                              onClick={() => openRemoveModal(member.userId)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', transition: 'background 0.15s' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              Remove
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div style={modalOverlaySt}>
          <div className="animate-scale-in" style={modalBoxSt}>
            <div style={modalHeaderSt}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>Invite Member</h2>
              <button onClick={() => setInviteModalOpen(false)} style={closeBtnSt}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleInvite}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelSt}>Email Address</label>
                  <input
                    type="email" required value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    style={inputSt} placeholder="colleague@example.com"
                  />
                </div>
                <div>
                  <label style={labelSt}>Role</label>
                  <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })} style={inputSt}>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    Admins can manage goals, announcements, and invite other members.
                  </p>
                </div>
              </div>
              
              <div style={modalFooterSt}>
                <button type="button" onClick={() => setInviteModalOpen(false)} style={cancelBtnSt}>Cancel</button>
                <button type="submit" disabled={inviting} style={{ ...submitBtnSt, opacity: inviting ? 0.7 : 1 }}>
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {removeModalOpen && (
        <div style={modalOverlaySt}>
          <div className="animate-scale-in" style={{ ...modalBoxSt, maxWidth: '400px' }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>Remove Member?</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to remove this member from the workspace? They will lose access to all goals, action items, and announcements.
              </p>
            </div>
            <div style={modalFooterSt}>
              <button onClick={() => setRemoveModalOpen(false)} style={{ ...cancelBtnSt, flex: 1 }}>Cancel</button>
              <button onClick={handleRemoveMember} disabled={removing} style={{ ...submitBtnSt, background: '#ef4444', flex: 1, opacity: removing ? 0.7 : 1 }}>
                {removing ? 'Removing...' : 'Yes, remove them'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Styles
const thSt = { padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const modalOverlaySt = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' };
const modalBoxSt = { background: 'var(--bg-primary)', width: '100%', maxWidth: '500px', borderRadius: '16px', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const modalHeaderSt = { padding: '20px 24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtnSt = { background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' };
const labelSt = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' };
const inputSt = { width: '100%', padding: '10px 14px', boxSizing: 'border-box', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px', outline: 'none' };
const modalFooterSt = { padding: '16px 24px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-secondary)' };
const cancelBtnSt = { padding: '10px 20px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' };
const submitBtnSt = { padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' };
