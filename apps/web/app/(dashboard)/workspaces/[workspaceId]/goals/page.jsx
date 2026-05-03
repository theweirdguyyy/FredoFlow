'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../../../lib/api';
import { getSocket } from '../../../../../lib/socket';
import GoalCard from '../../../../../components/goals/GoalCard';
import { usePermissions } from '../../../../../hooks/usePermissions';

const STATUS = {
  ALL:          { label: 'All',          color: 'var(--text-primary)', bg: 'var(--bg-secondary)' },
  IN_PROGRESS:  { label: 'In progress',  color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  COMPLETED:    { label: 'Completed',    color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  NOT_STARTED:  { label: 'Not started',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CANCELLED:    { label: 'Cancelled',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

/* ── Demo data matching spec ── */
const DEMO_GOALS = [
  {
    id: '1', title: 'Q3 Product Launch', status: 'IN_PROGRESS', progress: 65,
    dueDate: '2026-06-15', owner: { name: 'Amara K.' },
    milestones: [
      { id: 'm1', title: 'Finalize feature spec', completed: true },
      { id: 'm2', title: 'Complete API integration', completed: true },
      { id: 'm3', title: 'User acceptance testing', completed: false },
    ],
    actionItems: 5, updates: 12,
  },
  {
    id: '2', title: 'Fix critical auth bugs', status: 'IN_PROGRESS', progress: 40,
    dueDate: '2026-04-28', owner: { name: 'Pat W.' },
    milestones: [
      { id: 'm4', title: 'Reproduce all reported issues', completed: true },
      { id: 'm5', title: 'Patch token refresh flow', completed: false },
      { id: 'm6', title: 'Deploy hotfix to production', completed: false },
    ],
    actionItems: 3, updates: 8,
  },
  {
    id: '3', title: 'Design system v2 rollout', status: 'COMPLETED', progress: 100,
    dueDate: '2026-05-01', owner: { name: 'Maya R.' },
    milestones: [
      { id: 'm7', title: 'Audit existing components', completed: true },
      { id: 'm8', title: 'Build token system', completed: true },
      { id: 'm9', title: 'Migrate all pages', completed: true },
    ],
    actionItems: 8, updates: 21,
  },
  {
    id: '4', title: 'Team onboarding workflow', status: 'NOT_STARTED', progress: 0,
    dueDate: '2026-07-01', owner: { name: 'Sam L.' },
    milestones: [
      { id: 'm10', title: 'Draft onboarding checklist', completed: false },
      { id: 'm11', title: 'Record walkthrough videos', completed: false },
      { id: 'm12', title: 'Set up mentor pairing', completed: false },
    ],
    actionItems: 0, updates: 2,
  },
];

const DEMO_COUNTS = { ALL: 8, IN_PROGRESS: 3, COMPLETED: 2, NOT_STARTED: 2, CANCELLED: 1 };

export default function GoalsPage() {
  const { workspaceId } = useParams();
  const router = useRouter();
  const { canCreateGoal } = usePermissions();
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', status: 'NOT_STARTED', ownerId: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!workspaceId) { setLoading(false); return; }
    Promise.all([
      api.get(`/workspaces/${workspaceId}/goals`),
      api.get(`/workspaces/${workspaceId}`),
    ]).then(([g, w]) => {
      setGoals(g.data.data.goals || []);
      setMembers(w.data.data.workspace.members || []);
    }).catch(() => setGoals([])).finally(() => setLoading(false));

    const socket = getSocket();
    socket.connect();
    socket.emit('JOIN_WORKSPACE', workspaceId);

    const handleGoalCreated = (data) => {
      setGoals((prev) => [data.goal, ...prev]);
    };

    const handleGoalUpdated = (data) => {
      // If we are on the list page, we might want to refresh or just update the status locally
      setGoals((prev) => prev.map(g => g.id === data.goalId ? { ...g, status: data.status } : g));
    };

    socket.on('GOAL_CREATED', handleGoalCreated);
    socket.on('GOAL_UPDATED', handleGoalUpdated);

    return () => {
      socket.off('GOAL_CREATED', handleGoalCreated);
      socket.off('GOAL_UPDATED', handleGoalUpdated);
    };
  }, [workspaceId]);

  const filtered = filter === 'ALL' ? goals : goals.filter((g) => g.status === filter);

  const getCounts = (key) => {
    return key === 'ALL' ? goals.length : goals.filter((g) => g.status === key).length;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setCreating(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/goals`, form);
      // Backend returns { success: true, data: { goal } }
      const newGoal = res.data.data.goal;
      setGoals((p) => [newGoal, ...p]);
      setModalOpen(false);
      setForm({ title: '', description: '', dueDate: '', status: 'NOT_STARTED', ownerId: '' });
      toast.success('Goal created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal.');
    } finally { setCreating(false); }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── TOPBAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 16px', gap: '10px', flexWrap: 'wrap',
      }}>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800,
          color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px',
        }}>Goals</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={ghostBtn}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filter
          </button>
          {canCreateGoal && (
            <button onClick={() => setModalOpen(true)} style={primaryBtn}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New goal
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{
        height: '44px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)',
        padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px',
        overflowX: 'auto', flexShrink: 0,
      }}>
        {Object.entries(STATUS).map(([key, cfg]) => {
          const active = filter === key;
          return (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '5px 13px', borderRadius: '20px', fontSize: '12px',
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap',
              border: active ? 'none' : '1px solid var(--border-primary)',
              background: active ? '#6366f1' : 'transparent',
              color: active ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = active ? '#6366f1' : 'transparent'; }}
            >
              {cfg.label} ({getCounts(key)})
            </button>
          );
        })}
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
        {filtered.length === 0 ? (
          <EmptyState message="No goals match this filter." cta="Create a goal" onClick={() => setModalOpen(true)} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {filtered.map((goal) => (
              <GoalCard key={goal.id} goal={goal}
                onClick={() => workspaceId ? router.push(`/workspaces/${workspaceId}/goals/${goal.id}`) : null} />
            ))}
          </div>
        )}
      </div>

      {/* ── CREATE MODAL ── */}
      {modalOpen && (
        <Modal title="New goal" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Title">
              <input type="text" placeholder="e.g. Q3 Product Launch" value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} style={inputSt} />
            </Field>
            <Field label="Description">
              <textarea placeholder="What does this goal achieve?" value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                style={{ ...inputSt, resize: 'vertical', minHeight: '80px' }} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Due date">
                <input type="date" value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} style={inputSt} />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} style={inputSt}>
                  {['NOT_STARTED','IN_PROGRESS','COMPLETED','CANCELLED'].map((s) => (
                    <option key={s} value={s}>{STATUS[s]?.label || s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Owner">
              <select value={form.ownerId} onChange={(e) => setForm((p) => ({ ...p, ownerId: e.target.value }))} style={inputSt}>
                <option value="">Select owner</option>
                {members.map((m) => <option key={m.userId} value={m.userId}>{m.user?.name}</option>)}
              </select>
            </Field>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModalOpen(false)} style={ghostBtn}>Cancel</button>
              <button type="submit" disabled={creating} style={primaryBtn}>{creating ? 'Creating...' : 'Create goal'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// GoalCard extracted to components

/* ── Helpers ── */
function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ message, cta, onClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-secondary)" strokeWidth="1.2" strokeLinecap="round" style={{ marginBottom: '16px' }}>
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{message}</p>
      <button onClick={onClick} style={primaryBtn}>{cta}</button>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div>
      <div style={{ padding: '18px 20px 16px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '80px', height: '24px', background: 'var(--bg-tertiary)', borderRadius: '6px' }} className="animate-pulse" />
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '80px', height: '32px', background: 'var(--bg-tertiary)', borderRadius: '8px' }} className="animate-pulse" />
          <div style={{ width: '100px', height: '32px', background: 'var(--bg-tertiary)', borderRadius: '8px' }} className="animate-pulse" />
        </div>
      </div>
      <div style={{ height: '44px', borderBottom: '1px solid var(--border-primary)', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {[60,80,80,80,70].map((w, i) => (
          <div key={i} style={{ width: `${w}px`, height: '28px', background: 'var(--bg-tertiary)', borderRadius: '20px' }} className="animate-pulse" />
        ))}
      </div>
      <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[1,2,3,4].map((i) => (
          <div key={i} style={{ height: '240px', background: 'var(--bg-primary)', borderRadius: '12px', border: '0.5px solid var(--border-primary)' }} className="animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/* ── Style constants ── */
const inputSt = { width: '100%', padding: '9px 12px', boxSizing: 'border-box', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px', outline: 'none', transition: 'border-color 0.15s' };
const primaryBtn = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' };
const ghostBtn = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 13px', background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' };
