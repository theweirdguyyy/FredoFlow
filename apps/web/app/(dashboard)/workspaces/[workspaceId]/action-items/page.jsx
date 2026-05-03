'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../../../lib/api';
import { getSocket } from '../../../../../lib/socket';
import { useAuthStore } from '../../../../../store/authStore';
import { useWorkspaceStore } from '../../../../../store/workspaceStore';
import { useUIStore } from '../../../../../store/uiStore';
import { usePermissions } from '../../../../../hooks/usePermissions';
import KanbanBoard from '../../../../../components/action-items/KanbanBoard';
import ListView from '../../../../../components/action-items/ListView';

export default function ActionItemsPage() {
  const { workspaceId } = useParams();
  const { members } = useWorkspaceStore();
  const { actionItemView, setActionItemView } = useUIStore();
  const { canCreateActionItem } = usePermissions();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '', goalId: '' });
  const [creating, setCreating] = useState(false);

  const fetchActionItems = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/action-items`);
      setItems(res.data.data.items || []);
    } catch (err) {
      toast.error('Failed to load action items');
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/goals`);
      setGoals(res.data.data.goals || []);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchActionItems();
      fetchGoals();
    }

    const socket = getSocket();
    socket.connect();
    socket.emit('JOIN_WORKSPACE', workspaceId);

    const handleCreated = (data) => {
      setItems((prev) => [...prev, data.item]);
    };

    const handleMoved = (data) => {
      // This syncs the exact order determined by the backend for other clients
      fetchActionItems();
    };

    socket.on('ACTION_ITEM_CREATED', handleCreated);
    socket.on('ACTION_ITEM_MOVED', handleMoved);

    return () => {
      socket.off('ACTION_ITEM_CREATED', handleCreated);
      socket.off('ACTION_ITEM_MOVED', handleMoved);
    };
  }, [workspaceId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setCreating(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.assigneeId) delete payload.assigneeId;
      if (!payload.goalId) delete payload.goalId;

      await api.post(`/workspaces/${workspaceId}/action-items`, payload);
      toast.success('Action item created');
      setModalOpen(false);
      setForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '', goalId: '' });
      // WebSocket will append it
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create action item');
    } finally {
      setCreating(false);
    }
  };

  const handleCardClick = (item) => {
    // Basic interaction for now. In a full app, this would open an edit modal.
    toast(`Clicked: ${item.title}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{
        height: '64px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Action Items
          </h1>
          
          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px' }}>
            <button
              onClick={() => setActionItemView('kanban')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: 'none',
                background: actionItemView === 'kanban' ? 'var(--bg-primary)' : 'transparent',
                boxShadow: actionItemView === 'kanban' ? 'var(--shadow-sm)' : 'none',
                color: actionItemView === 'kanban' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
              Kanban
            </button>
            <button
              onClick={() => setActionItemView('list')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: 'none',
                background: actionItemView === 'list' ? 'var(--bg-primary)' : 'transparent',
                boxShadow: actionItemView === 'list' ? 'var(--shadow-sm)' : 'none',
                color: actionItemView === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              List
            </button>
          </div>
        </div>

        {canCreateActionItem && (
          <button onClick={() => setModalOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#6366f1',
            color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Item
          </button>
        )}
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, padding: '24px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ color: 'var(--text-tertiary)' }}>Loading action items...</div>
        ) : actionItemView === 'kanban' ? (
          <KanbanBoard items={items} workspaceId={workspaceId} onItemsChange={setItems} onCardClick={handleCardClick} />
        ) : (
          <ListView items={items} onCardClick={handleCardClick} />
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div className="animate-scale-in" style={{
            background: 'var(--bg-primary)', width: '100%', maxWidth: '500px', borderRadius: '16px',
            boxShadow: 'var(--shadow-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>Create Action Item</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
                <div>
                  <label style={labelSt}>Title</label>
                  <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputSt} placeholder="Task title" />
                </div>
                
                <div>
                  <label style={labelSt}>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputSt, minHeight: '80px', resize: 'vertical' }} placeholder="Add details..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelSt}>Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputSt}>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelSt}>Priority</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={inputSt}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelSt}>Assignee</label>
                    <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} style={inputSt}>
                      <option value="">Unassigned</option>
                      {members.map((m) => <option key={m.userId} value={m.userId}>{m.user?.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelSt}>Due Date</label>
                    <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={inputSt} />
                  </div>
                </div>

                <div>
                  <label style={labelSt}>Link to Goal (Optional)</label>
                  <select value={form.goalId} onChange={(e) => setForm({ ...form, goalId: e.target.value })} style={inputSt}>
                    <option value="">No linked goal</option>
                    {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-secondary)' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{
                  padding: '10px 20px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)',
                  borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" disabled={creating} style={{
                  padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none',
                  borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: creating ? 0.7 : 1
                }}>
                  {creating ? 'Creating...' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputSt = { width: '100%', padding: '10px 14px', boxSizing: 'border-box', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px', outline: 'none' };
const labelSt = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' };
