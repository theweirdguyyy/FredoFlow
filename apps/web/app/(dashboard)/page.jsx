'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { usePermissions } from '../../hooks/usePermissions';

const ACTIVITIES = [
  { name: 'Amara K.', color: '#10b981', text: 'completed milestone "API Integration"', time: '2 min ago' },
  { name: 'Maya R.', color: '#f59e0b', text: 'created a new goal "Q3 Launch"', time: '18 min ago' },
  { name: 'Pat W.', color: '#6366f1', text: 'moved "Fix auth bug" to Done', time: '1 hour ago' },
  { name: 'Sam L.', color: '#ef4444', text: 'posted an announcement', time: '3 hours ago' },
];

export default function DashboardPage() {
  const { workspaceId: paramWorkspaceId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { members, onlineUserIds, currentWorkspace, fetchMembers } = useWorkspaceStore();
  
  const workspaceId = paramWorkspaceId || currentWorkspace?.id;

  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { canExportCSV, canCreateGoal } = usePermissions();

  useEffect(() => {
    if (!workspaceId) return;

    Promise.all([
      api.get(`/workspaces/${workspaceId}/analytics/stats`),
      api.get(`/workspaces/${workspaceId}/analytics/charts`),
    ]).then(([s, c]) => {
      setStats(s.data.data);
      setChartData(c.data.data);
    }).catch(() => {
      toast.error('Failed to load dashboard data');
    }).finally(() => setLoading(false));
  }, [workspaceId]);

  const handleExportCSV = async () => {
    try {
      toast.loading('Generating export...', { id: 'csv-export' });
      const res = await api.get(`/workspaces/${workspaceId}/analytics/export`);
      const { goals, actionItems, members: exportMembers } = res.data.data;
      
      let csv = 'Type,Title/Name,Status/Role,Priority/Email,Created/Joined,Due Date\n';
      
      goals?.forEach(g => {
        csv += `Goal,"${g.title}",${g.status},,${new Date(g.createdAt).toLocaleDateString()},${g.dueDate ? new Date(g.dueDate).toLocaleDateString() : ''}\n`;
      });
      
      actionItems?.forEach(a => {
        csv += `Action Item,"${a.title}",${a.status},${a.priority},,${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : ''}\n`;
      });
      
      exportMembers?.forEach(m => {
        csv += `Member,"${m.name}",${m.role},${m.email},${new Date(m.joinedAt).toLocaleDateString()},\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `workspace_export_${workspaceId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export complete', { id: 'csv-export' });
    } catch (error) {
      toast.error('Failed to export CSV', { id: 'csv-export' });
    }
  };

  if (loading) return <PageSkeleton />;

  const totalGoals = stats ? Object.values(stats.goalsStats || {}).reduce((a, b) => a + b, 0) : 0;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── PAGE TOPBAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px', flexWrap: 'wrap', gap: '10px',
      }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {canExportCSV && (
            <button
              onClick={handleExportCSV}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid var(--border-primary)',
                background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-primary)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          )}
          {canCreateGoal && (
            <button
              onClick={() => router.push(`/workspaces/${workspaceId}/goals`)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: 'none',
                background: '#6366f1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#fff',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New goal
            </button>
          )}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        <StatCard
          label="Total goals"
          value={totalGoals}
          delta="Active tracking"
          deltaColor="#6366f1"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
        />
        <StatCard
          label="Completed this week"
          value={stats?.weeklyCompletedItems || 0}
          delta="Action items"
          deltaColor="#10b981"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
        />
        <StatCard
          label="Overdue items"
          value={stats?.overdueItems || 0}
          delta={stats?.overdueItems > 0 ? "Needs attention" : "All clear"}
          deltaColor={stats?.overdueItems > 0 ? "#ef4444" : "#10b981"}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
        />
        <StatCard
          label="Active members"
          value={stats?.totalMembers || 0}
          delta={`${onlineUserIds.length} online now`}
          deltaColor="#10b981"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>}
        />
      </div>

      {/* ── CHARTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <BarChartCard data={chartData} />
        <DonutChartCard stats={stats?.goalsStats || {}} total={totalGoals} />
      </div>

      {/* ── ACTIVITY + MEMBERS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <ActivityCard />
        <OnlineCard members={members} onlineUserIds={onlineUserIds} />
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, deltaColor, icon }) {
  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}>{icon}</span>
        {label}
      </div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '6px' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: deltaColor }}>{delta}</div>
    </div>
  );
}

function BarChartCard({ data }) {
  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
        Goal completions — last 6 months
      </div>
      <div style={{ height: '220px', width: '100%', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)' }} dy={10} />
            <Tooltip 
              cursor={{ fill: 'var(--bg-secondary)' }}
              contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '12px' }} 
            />
            <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DonutChartCard({ stats, total }) {
  const chartData = [
    { name: 'Completed', value: stats['COMPLETED'] || 0, color: '#10b981' },
    { name: 'In Progress', value: stats['IN_PROGRESS'] || 0, color: '#6366f1' },
    { name: 'Not Started', value: stats['NOT_STARTED'] || 0, color: '#f59e0b' },
    { name: 'Cancelled', value: stats['CANCELLED'] || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
        Goals by status
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-primary)', fontSize: '12px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>No goals available</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
        {chartData.map((item) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
            <span style={{ flex: 1 }}>{item.name}</span>
            <span style={{ color: 'var(--text-primary)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityCard() {
  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Recent activity
      </div>
      {ACTIVITIES.map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < ACTIVITIES.length - 1 ? '16px' : 0 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {a.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{a.name}</strong>{' '}{a.text}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px', fontWeight: 500 }}>{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OnlineCard({ members, onlineUserIds }) {
  // Map members with online status, sorted by online first
  const mappedMembers = members.map(m => ({
    name: m.user?.name || 'Unknown',
    role: m.role,
    online: onlineUserIds.includes(m.userId),
    color: m.role === 'ADMIN' || m.role === 'OWNER' ? '#6366f1' : '#10b981'
  })).sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0)).slice(0, 5);

  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Team members
      </div>
      {mappedMembers.map((m, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: i < mappedMembers.length - 1 ? '16px' : 0 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
              {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: m.online ? '#10b981' : '#94a3b8', border: '2px solid var(--bg-primary)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>{m.role}</div>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', background: m.online ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)', color: m.online ? '#10b981' : 'var(--text-tertiary)' }}>
            {m.online ? 'Online' : 'Offline'}
          </span>
        </div>
      ))}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ width: '120px', height: '24px', background: 'var(--bg-tertiary)', borderRadius: '6px' }} className="animate-pulse" />
        <div style={{ width: '100px', height: '32px', background: 'var(--bg-tertiary)', borderRadius: '8px' }} className="animate-pulse" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {[1, 2, 3, 4].map((i) => <div key={i} style={{ height: '100px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }} className="animate-pulse" />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ height: '300px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }} className="animate-pulse" />
        <div style={{ height: '300px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }} className="animate-pulse" />
      </div>
    </div>
  );
}
