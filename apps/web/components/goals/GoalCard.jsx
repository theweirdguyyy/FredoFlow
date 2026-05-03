import React from 'react';

const STATUS = {
  ALL:          { label: 'All',          color: 'var(--text-primary)', bg: 'var(--bg-secondary)' },
  IN_PROGRESS:  { label: 'In progress',  color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  COMPLETED:    { label: 'Completed',    color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  NOT_STARTED:  { label: 'Not started',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CANCELLED:    { label: 'Cancelled',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function GoalCard({ goal, onClick }) {
  const cfg = STATUS[goal.status] || STATUS.NOT_STARTED;
  const milestones = goal.milestones || [];
  const progress = goal.progress ?? 0;
  const isOverdue = goal.dueDate && new Date(goal.dueDate) < new Date() && goal.status !== 'COMPLETED';
  const actionCount = goal.actionItems ?? goal._count?.actionItems ?? 0;
  const updateCount = goal.updates ?? goal._count?.updates ?? 0;
  const initials = goal.owner?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?';

  return (
    <div onClick={onClick} className="animate-fade-in" style={{
      background: 'var(--bg-primary)', border: '0.5px solid var(--border-primary)',
      borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
      transition: 'border-color 0.15s, transform 0.15s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-secondary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* HEADER */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{goal.title}</span>
          <span style={{
            fontSize: '10px', fontWeight: 500, padding: '3px 8px', borderRadius: '10px',
            background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap', flexShrink: 0,
          }}>{cfg.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            {actionCount} items
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            {updateCount} updates
          </span>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{progress}%</span>
        </div>
        <div style={{ height: '5px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{
            height: '100%', width: `${progress}%`, borderRadius: '3px',
            background: cfg.color, transition: 'width 0.4s ease',
          }} />
        </div>
        {milestones.slice(0, 3).map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
              border: `1.5px solid ${m.completed ? '#10b981' : 'var(--border-secondary)'}`,
              background: m.completed ? '#10b981' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {m.completed && (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="2 5 4 7 8 3"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{m.title}</span>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: '1px solid var(--border-primary)', padding: '10px 16px',
        background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '8px', fontWeight: 700, color: '#fff',
          }}>{initials}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{goal.owner?.name}</span>
        </div>
        {goal.dueDate && (
          <span style={{
            fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px',
            color: isOverdue ? '#ef4444' : 'var(--text-tertiary)',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {isOverdue ? 'Overdue' : new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
