import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';

const STATUS_LABELS = {
  TODO: { label: 'To Do', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
  IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  IN_REVIEW: { label: 'In Review', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  DONE: { label: 'Done', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
};

const PRIORITY_COLORS = {
  LOW: { bg: 'rgba(52,211,153,0.1)', color: '#10b981' },
  MEDIUM: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  HIGH: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
};

export default function ListView({ items, onCardClick }) {
  const { members } = useWorkspaceStore();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');

  const filteredItems = items.filter((item) => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && item.priority !== filterPriority) return false;
    if (filterAssignee !== 'ALL' && item.assigneeId !== filterAssignee) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', padding: '16px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectSt}>
          <option value="ALL">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={selectSt}>
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} style={selectSt}>
          <option value="ALL">All Assignees</option>
          {members.map(m => (
            <option key={m.userId} value={m.userId}>{m.user?.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10, boxShadow: '0 1px 0 var(--border-primary)' }}>
            <tr>
              <th style={thSt}>Title</th>
              <th style={thSt}>Status</th>
              <th style={thSt}>Priority</th>
              <th style={thSt}>Assignee</th>
              <th style={thSt}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No items match your filters.</td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const sCfg = STATUS_LABELS[item.status] || STATUS_LABELS.TODO;
                const pCfg = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.MEDIUM;
                const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'DONE';
                
                return (
                  <tr key={item.id} onClick={() => onCardClick(item)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-primary)', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', background: sCfg.bg, color: sCfg.color }}>
                        {sCfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', background: pCfg.bg, color: pCfg.color }}>
                        {item.priority}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {item.assignee?.name || 'Unassigned'}
                    </td>
                    <td style={{ padding: '12px 16px', color: isOverdue ? '#ef4444' : 'var(--text-secondary)' }}>
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const selectSt = {
  padding: '6px 12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
  fontSize: '13px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
};

const thSt = {
  padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px'
};
