import React from 'react';

const PRIORITY_COLORS = {
  LOW: { bg: 'rgba(52,211,153,0.1)', color: '#10b981' },
  MEDIUM: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  HIGH: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

export default function ActionItemCard({ 
  item, 
  innerRef, 
  draggableProps, 
  dragHandleProps, 
  onClick 
}) {
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'DONE';
  const priorityCfg = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.MEDIUM;
  const initials = item.assignee?.name?.split(' ').map(n => n[0]).join('').slice(0,2) || '?';

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={onClick}
      style={{
        background: 'var(--bg-primary)',
        border: '0.5px solid var(--border-primary)',
        borderRadius: '10px',
        padding: '14px',
        marginBottom: '10px',
        cursor: 'grab',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        userSelect: 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ...draggableProps.style, // preserve dnd styles
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, wordBreak: 'break-word' }}>
          {item.title}
        </h4>
        <span style={{
          fontSize: '9px', fontWeight: 700, padding: '3px 6px', borderRadius: '4px',
          background: priorityCfg.bg, color: priorityCfg.color, flexShrink: 0
        }}>
          {item.priority}
        </span>
      </div>

      {item.goal && (
        <div style={{ fontSize: '11px', color: '#6366f1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
          </svg>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
            {item.goal.title}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%', background: '#818cf8',
            color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} title={item.assignee?.name}>
            {initials}
          </div>
        </div>

        {item.dueDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: isOverdue ? '#ef4444' : 'var(--text-tertiary)', fontWeight: isOverdue ? 600 : 400 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
}
