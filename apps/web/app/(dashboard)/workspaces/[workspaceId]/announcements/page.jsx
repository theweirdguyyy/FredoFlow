'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import api from '../../../../../lib/api';
import { getSocket } from '../../../../../lib/socket';
import { useAuthStore } from '../../../../../store/authStore';
import { useWorkspaceStore } from '../../../../../store/workspaceStore';
import { usePermissions } from '../../../../../hooks/usePermissions';
import AnnouncementCard from '../../../../../components/announcements/AnnouncementCard';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function AnnouncementsPage() {
  const { workspaceId } = useParams();
  const { user } = useAuthStore();
  const { members } = useWorkspaceStore();
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [creating, setCreating] = useState(false);

  const { canPostAnnouncement, canPinAnnouncement, isAdmin } = usePermissions();

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/announcements`);
      const data = res.data.data.announcements || [];
      // Sort: pinned first, then by date descending
      data.sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.isPinned ? -1 : 1;
      });
      setAnnouncements(data);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchAnnouncements();
    }

    const socket = getSocket();
    socket.connect();
    socket.emit('JOIN_WORKSPACE', workspaceId);

    const handleNewAnnouncement = (data) => {
      setAnnouncements((prev) => {
        const newArr = [data.announcement, ...prev];
        return newArr.sort((a, b) => (a.isPinned === b.isPinned ? new Date(b.createdAt) - new Date(a.createdAt) : a.isPinned ? -1 : 1));
      });
    };

    const handleNewReaction = (data) => {
      setAnnouncements((prev) => prev.map((ann) => {
        if (ann.id === data.announcementId) {
          const reactions = [...(ann.reactions || []), { userId: data.userId, emoji: data.emoji }];
          return { ...ann, reactions };
        }
        return ann;
      }));
    };

    const handleNewComment = (data) => {
      // The socket doesn't pass the full comment immediately, so we just refetch or rely on the comment fetch.
      // For simplicity in a robust app, a refetch is safe, but optimistic is better. Let's just refetch.
      fetchAnnouncements();
    };

    const handlePinned = () => {
      fetchAnnouncements();
    };

    socket.on('NEW_ANNOUNCEMENT', handleNewAnnouncement);
    socket.on('NEW_REACTION', handleNewReaction);
    socket.on('NEW_COMMENT', handleNewComment);
    socket.on('ANNOUNCEMENT_PINNED', handlePinned);

    return () => {
      socket.off('NEW_ANNOUNCEMENT', handleNewAnnouncement);
      socket.off('NEW_REACTION', handleNewReaction);
      socket.off('NEW_COMMENT', handleNewComment);
      socket.off('ANNOUNCEMENT_PINNED', handlePinned);
    };
  }, [workspaceId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setCreating(true);
    try {
      await api.post(`/workspaces/${workspaceId}/announcements`, form);
      toast.success('Announcement posted');
      setModalOpen(false);
      setForm({ title: '', content: '' });
      // Socket will broadcast and update local state automatically!
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePin = async (announcementId) => {
    try {
      // Optimistic update
      setAnnouncements((prev) => {
        const arr = prev.map(a => a.id === announcementId ? { ...a, isPinned: !a.isPinned } : a);
        return arr.sort((a, b) => (a.isPinned === b.isPinned ? new Date(b.createdAt) - new Date(a.createdAt) : a.isPinned ? -1 : 1));
      });
      await api.post(`/workspaces/${workspaceId}/announcements/${announcementId}/pin`);
    } catch (err) {
      toast.error('Failed to pin announcement');
      fetchAnnouncements(); // revert
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      // Optimistic delete
      setAnnouncements((prev) => prev.filter(a => a.id !== announcementId));
      await api.delete(`/workspaces/${workspaceId}/announcements/${announcementId}`);
      toast.success('Announcement deleted');
    } catch (err) {
      toast.error('Failed to delete announcement');
      fetchAnnouncements(); // revert
    }
  };

  const handleToggleReaction = async (announcementId, emoji, hasReacted) => {
    try {
      // Optimistic update
      setAnnouncements((prev) => prev.map(ann => {
        if (ann.id !== announcementId) return ann;
        let newReactions = [...(ann.reactions || [])];
        if (hasReacted) {
          newReactions = newReactions.filter(r => !(r.userId === user?.id && r.emoji === emoji));
        } else {
          newReactions.push({ userId: user?.id, emoji });
        }
        return { ...ann, reactions: newReactions };
      }));

      if (hasReacted) {
        await api.delete(`/workspaces/${workspaceId}/announcements/${announcementId}/reactions`, { data: { emoji } });
      } else {
        await api.post(`/workspaces/${workspaceId}/announcements/${announcementId}/reactions`, { emoji });
      }
    } catch (err) {
      toast.error('Failed to update reaction');
      fetchAnnouncements(); // revert
    }
  };

  const handleAddComment = async (announcementId, content, mentionedUserIds = []) => {
    try {
      // Optimistic update (simplified)
      setAnnouncements((prev) => prev.map(ann => {
        if (ann.id !== announcementId) return ann;
        const tempComment = { id: Date.now().toString(), userId: user?.id, content, createdAt: new Date().toISOString(), user: { name: user?.name } };
        return { ...ann, comments: [...(ann.comments || []), tempComment] };
      }));
      await api.post(`/workspaces/${workspaceId}/announcements/${announcementId}/comments`, { content, mentionedUserIds });
    } catch (err) {
      toast.error('Failed to add comment');
      fetchAnnouncements();
    }
  };

  const handleDeleteComment = async (announcementId, commentId) => {
    try {
      // Optimistic update
      setAnnouncements((prev) => prev.map(ann => {
        if (ann.id !== announcementId) return ann;
        return { ...ann, comments: (ann.comments || []).filter(c => c.id !== commentId) };
      }));
      await api.delete(`/workspaces/${workspaceId}/announcements/${announcementId}/comments/${commentId}`);
    } catch (err) {
      toast.error('Failed to delete comment');
      fetchAnnouncements();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Topbar */}
      <div style={{
        height: '64px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0
      }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          Announcements
        </h1>
        {canPostAnnouncement && (
          <button onClick={() => setModalOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#6366f1',
            color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Announcement
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div style={{
              background: 'var(--bg-primary)', border: '1px dashed var(--border-secondary)',
              borderRadius: '12px', padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <p style={{ margin: 0, fontWeight: 500 }}>No announcements yet.</p>
              {canPostAnnouncement && (
                <div style={{ marginTop: '20px' }}>
                  <button onClick={() => setModalOpen(true)} style={{
                    padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none',
                    borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Post Announcement
                  </button>
                </div>
              )}
            </div>
          ) : (
            announcements.map((ann) => (
              <AnnouncementCard 
                key={ann.id}
                announcement={ann}
                currentUserId={user?.id}
                canPin={canPinAnnouncement}
                onTogglePin={handleTogglePin}
                onToggleReaction={handleToggleReaction}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onDelete={() => handleDeleteAnnouncement(ann.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div className="animate-scale-in" style={{
            background: 'var(--bg-primary)', width: '100%', maxWidth: '700px', borderRadius: '16px',
            boxShadow: 'var(--shadow-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>Post Announcement</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px', boxSizing: 'border-box', fontSize: '14px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px', 
                      outline: 'none', color: 'var(--text-primary)'
                    }}
                    placeholder="E.g., Q3 All Hands Update"
                  />
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Content</label>
                  <div style={{ flex: 1, minHeight: '300px', background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden' }}>
                    <ReactQuill 
                      theme="snow" 
                      value={form.content} 
                      onChange={(val) => setForm({ ...form, content: val })} 
                      style={{ height: '100%' }}
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-secondary)' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{
                  padding: '10px 20px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)',
                  borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} style={{
                  padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none',
                  borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: creating ? 0.7 : 1
                }}>
                  {creating ? 'Posting...' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Global override for Quill toolbar to make it look premium inside our dark/light theme context */}
      <style dangerouslySetInnerHTML={{__html: `
        .ql-toolbar.ql-snow {
          border: 1px solid var(--border-primary) !important;
          border-radius: 8px 8px 0 0;
          background: var(--bg-secondary);
        }
        .ql-toolbar.ql-snow .ql-stroke {
          stroke: var(--text-primary) !important;
        }
        .ql-toolbar.ql-snow .ql-fill {
          fill: var(--text-primary) !important;
        }
        .ql-toolbar.ql-snow .ql-picker {
          color: var(--text-primary) !important;
        }
        .ql-container.ql-snow {
          border: 1px solid var(--border-primary) !important;
          border-top: none !important;
          border-radius: 0 0 8px 8px;
          font-family: 'DM Sans', sans-serif !important;
          font-size: 14px !important;
          color: var(--text-primary) !important;
        }
        .ql-editor.ql-blank::before {
          color: var(--text-tertiary) !important;
        }
        .rich-text-content p {
          margin-bottom: 1em;
        }
        .rich-text-content a {
          color: #6366f1;
          text-decoration: underline;
        }
        .rich-text-content strong {
          color: var(--text-primary);
        }
      `}} />
    </div>
  );
}
