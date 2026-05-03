'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../../../../lib/api';
import { getSocket } from '../../../../../../lib/socket';
import { useAuthStore } from '../../../../../../store/authStore';
import { useWorkspaceStore } from '../../../../../../store/workspaceStore';

const STATUS = {
  ALL:          { label: 'All',          color: 'var(--text-primary)', bg: 'var(--bg-secondary)' },
  IN_PROGRESS:  { label: 'In progress',  color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  COMPLETED:    { label: 'Completed',    color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  NOT_STARTED:  { label: 'Not started',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CANCELLED:    { label: 'Cancelled',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function GoalDetailPage() {
  const { workspaceId, goalId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { members } = useWorkspaceStore();
  
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', status: 'NOT_STARTED' });
  const [saving, setSaving] = useState(false);

  // Check roles
  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwner = goal?.ownerId === user?.id;
  const isAdmin = currentMember?.role === 'ADMIN' || currentMember?.role === 'OWNER';
  const canEdit = isOwner || isAdmin;

  const fetchGoal = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/goals/${goalId}`);
      const g = res.data.data.goal;
      setGoal(g);
      setEditForm({
        title: g.title || '',
        description: g.description || '',
        dueDate: g.dueDate ? g.dueDate.split('T')[0] : '',
        status: g.status || 'NOT_STARTED',
      });
    } catch (err) {
      toast.error('Failed to load goal.');
      router.push(`/workspaces/${workspaceId}/goals`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();

    // Setup Socket
    const socket = getSocket();
    socket.connect();
    // Join the workspace room if not already joined by the layout, just to be safe
    socket.emit('joinWorkspace', workspaceId);

    const handleGoalUpdated = (data) => {
      if (data.goalId === goalId) {
        fetchGoal(); // Refresh the full goal data
      }
    };

    const handleProgressPosted = (data) => {
      if (data.goalId === goalId) {
        fetchGoal();
      }
    };

    socket.on('GOAL_UPDATED', handleGoalUpdated);
    socket.on('PROGRESS_POSTED', handleProgressPosted);

    return () => {
      socket.off('GOAL_UPDATED', handleGoalUpdated);
      socket.off('PROGRESS_POSTED', handleProgressPosted);
    };
  }, [workspaceId, goalId]);

  const handleSave = async () => {
    if (!editForm.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/workspaces/${workspaceId}/goals/${goalId}`, editForm);
      toast.success('Goal updated!');
      setIsEditing(false);
      fetchGoal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update goal');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !goal) return <PageSkeleton />;

  const cfg = STATUS[goal.status] || STATUS.NOT_STARTED;
  const isOverdue = goal.dueDate && new Date(goal.dueDate) < new Date() && goal.status !== 'COMPLETED';
  const initials = goal.owner?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?';

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 32px)', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* ── BREADCRUMB & TOP ACTIONS ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={() => router.push(`/workspaces/${workspaceId}/goals`)} style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
          color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to goals
        </button>
        {canEdit && (
          <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} style={isEditing ? primaryBtn : ghostBtn}>
            {saving ? 'Saving...' : (isEditing ? 'Save changes' : 'Edit goal')}
          </button>
        )}
      </div>

      {/* ── HEADER DETAILS ── */}
      <div className="animate-fade-in" style={{
        background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
        borderRadius: '12px', padding: '24px', marginBottom: '24px',
      }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelSt}>Title</label>
              <input type="text" value={editForm.title} onChange={(e) => setEditForm(p => ({...p, title: e.target.value}))} style={{...inputSt, fontSize: '20px', fontWeight: 700, fontFamily: "'Syne', sans-serif"}} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelSt}>Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm(p => ({...p, status: e.target.value}))} style={inputSt}>
                  {['NOT_STARTED','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSt}>Due Date</label>
                <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm(p => ({...p, dueDate: e.target.value}))} style={inputSt} />
              </div>
            </div>
            <div>
              <label style={labelSt}>Description</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm(p => ({...p, description: e.target.value}))} style={{...inputSt, minHeight: '100px', resize: 'vertical'}} placeholder="Add a description..." />
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                {goal.title}
              </h1>
              <span style={{
                fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '20px',
                background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap', flexShrink: 0,
              }}>{cfg.label}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#fff' }}>
                  {initials}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Owned by <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{goal.owner?.name}</span>
                </div>
              </div>
              
              {goal.dueDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: isOverdue ? '#ef4444' : 'var(--text-secondary)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {isOverdue ? 'Overdue' : `Due ${new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </div>
              )}
            </div>

            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {goal.description || <span style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>No description provided.</span>}
            </div>
          </>
        )}
      </div>

      {/* ── GRID CONTENT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Milestones & Action Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Milestones */}
          <div className="animate-fade-in" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, margin: 0 }}>Milestones</h3>
              {canEdit && <AddMilestoneButton workspaceId={workspaceId} goalId={goalId} onUpdate={fetchGoal} />}
            </div>
            <MilestoneList milestones={goal.milestones || []} workspaceId={workspaceId} goalId={goalId} canEdit={canEdit} onUpdate={fetchGoal} />
          </div>

          {/* Action Items */}
          <div className="animate-fade-in" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, margin: 0 }}>Action Items</h3>
              <button onClick={() => router.push(`/workspaces/${workspaceId}/action-items?goalId=${goalId}`)} style={{ fontSize: '12px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                View all &rarr;
              </button>
            </div>
            <ActionItemsList items={goal.actionItems || []} workspaceId={workspaceId} />
          </div>

        </div>

        {/* RIGHT COLUMN: Activity Feed */}
        <div className="animate-fade-in" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, margin: '0 0 16px' }}>Activity & Updates</h3>
          <ActivityFeed updates={goal.updates || []} workspaceId={workspaceId} goalId={goalId} onUpdate={fetchGoal} />
        </div>

      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */

function MilestoneList({ milestones, workspaceId, goalId, canEdit, onUpdate }) {
  if (!milestones || milestones.length === 0) {
    return <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No milestones defined yet.</div>;
  }

  const toggleMilestone = async (mId, currentStatus) => {
    if (!canEdit) return;
    try {
      await api.patch(`/workspaces/${workspaceId}/goals/${goalId}/milestones/${mId}`, { completed: !currentStatus });
      onUpdate();
    } catch (err) {
      toast.error('Failed to update milestone');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {milestones.map((m) => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <div onClick={() => toggleMilestone(m.id, m.completed)} style={{
            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, cursor: canEdit ? 'pointer' : 'default',
            border: `2px solid ${m.completed ? '#10b981' : 'var(--border-secondary)'}`,
            background: m.completed ? '#10b981' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
          }}>
            {m.completed && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 5 4 7 8 3"/></svg>}
          </div>
          <span style={{ fontSize: '13px', color: m.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: m.completed ? 'line-through' : 'none', flex: 1 }}>
            {m.title}
          </span>
          {m.progress !== undefined && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>{m.progress}%</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ActionItemsList({ items, workspaceId }) {
  const router = useRouter();

  if (!items || items.length === 0) {
    return <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No action items attached to this goal.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.slice(0, 5).map((item) => (
        <div key={item.id} onClick={() => router.push(`/workspaces/${workspaceId}/action-items`)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px',
          borderRadius: '8px', border: '1px solid var(--border-primary)', background: '#fff',
          cursor: 'pointer', transition: 'border-color 0.15s'
        }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-secondary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-primary)'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.status === 'COMPLETED' ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
              {item.title}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.priority}</span>
        </div>
      ))}
      {items.length > 5 && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '6px' }}>
          +{items.length - 5} more items
        </div>
      )}
    </div>
  );
}

function ActivityFeed({ updates, workspaceId, goalId, onUpdate }) {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      await api.post(`/workspaces/${workspaceId}/goals/${goalId}/updates`, { content });
      setContent('');
      toast.success('Update posted!');
      onUpdate();
    } catch (err) {
      toast.error('Failed to post update');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '500px' }}>
      
      {/* Feed List */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
        {updates.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>No updates yet. Start the conversation!</div>
        ) : (
          updates.map((upd) => (
            <div key={upd.id} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {upd.user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{upd.user?.name}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{new Date(upd.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '0 8px 8px 8px', border: '1px solid var(--border-primary)' }}>
                  {upd.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handlePost} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-primary)', paddingTop: '16px' }}>
        <input 
          type="text" 
          placeholder="Post an update..." 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          style={{ ...inputSt, flex: 1, background: 'var(--bg-primary)' }} 
        />
        <button type="submit" disabled={posting || !content.trim()} style={{ ...primaryBtn, padding: '0 16px', opacity: (posting || !content.trim()) ? 0.6 : 1 }}>
          {posting ? '...' : 'Post'}
        </button>
      </form>
    </div>
  );
}

function AddMilestoneButton({ workspaceId, goalId, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.post(`/workspaces/${workspaceId}/goals/${goalId}/milestones`, { title: title.trim() });
      setTitle('');
      setOpen(false);
      toast.success('Milestone added');
      onUpdate();
    } catch (err) {
      toast.error('Failed to add milestone');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '4px' }}>
        + Add
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, width: '200px', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '8px', padding: '10px', boxShadow: 'var(--shadow-md)', zIndex: 10 }}>
          <form onSubmit={handleAdd}>
            <input 
              autoFocus
              type="text" 
              placeholder="Milestone title..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{ ...inputSt, marginBottom: '8px' }} 
            />
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setOpen(false)} style={{ ...ghostBtn, padding: '4px 8px', fontSize: '11px' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ ...primaryBtn, padding: '4px 8px', fontSize: '11px' }}>{saving ? '...' : 'Add'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */
function PageSkeleton() {
  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ width: '120px', height: '20px', background: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '24px' }} className="animate-pulse" />
      <div style={{ height: '200px', background: 'var(--bg-primary)', borderRadius: '12px', marginBottom: '24px' }} className="animate-pulse" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ height: '300px', background: 'var(--bg-primary)', borderRadius: '12px' }} className="animate-pulse" />
        <div style={{ height: '400px', background: 'var(--bg-primary)', borderRadius: '12px' }} className="animate-pulse" />
      </div>
    </div>
  );
}

const inputSt = { width: '100%', padding: '9px 12px', boxSizing: 'border-box', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px', outline: 'none', transition: 'border-color 0.15s' };
const labelSt = { display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' };
const primaryBtn = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' };
const ghostBtn = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' };
