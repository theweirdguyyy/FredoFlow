import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import ProgressBar from '../../../components/ui/ProgressBar';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import { Plus, Filter, MoreHorizontal, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Filter Bar (44px height) */}
      <div className="h-[44px] bg-[var(--color-background-primary)] border-0.5 border-[var(--color-border-tertiary)] rounded-[10px] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 px-2">
            <Filter size={14} />
            Filter Views
          </Button>
          <div className="w-[1px] h-4 bg-[var(--color-border-tertiary)] mx-1" />
          <div className="flex gap-1">
            <Badge variant="IN_PROGRESS" className="cursor-pointer hover:opacity-80">Active Sprints</Badge>
            <Badge variant="URGENT" className="cursor-pointer hover:opacity-80">Urgent Goals</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" className="h-7 text-[11px] px-3 gap-1.5 rounded-[7px]">
            <Plus size={14} />
            New Action
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6">
        {/* Left Column: Goals & Progress */}
        <div className="xl:col-span-2 space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-syne text-[var(--color-text-primary)]">Quarterly Goals</h3>
            <Button variant="ghost" size="sm" className="h-8">View All</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Goal Card 1 */}
            <Card hoverable className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="IN_PROGRESS">On Track</Badge>
                  <Badge variant="HIGH">Q3 Priority</Badge>
                </div>
                <button className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--color-text-primary)] mb-1">Launch Mobile Application</h4>
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">Complete the beta testing phase and deploy the final build to both App Store and Google Play.</p>
              </div>
              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[var(--color-text-primary)]">Progress</span>
                  <span className="text-[var(--color-status-progress)]">65%</span>
                </div>
                <ProgressBar progress={65} variant="progress" />
                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    <Avatar name="Sarah Jenkins" size="sm" className="border-2 border-[var(--color-background-primary)]" />
                    <Avatar name="Mike Ross" size="sm" className="border-2 border-[var(--color-background-primary)]" />
                    <div className="w-6 h-6 rounded-full bg-[var(--color-background-secondary)] border-2 border-[var(--color-background-primary)] flex items-center justify-center text-[9px] font-bold text-[var(--color-text-secondary)] z-10">
                      +3
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] flex items-center gap-1">
                    <Clock size={12} />
                    12 Days Left
                  </span>
                </div>
              </div>
            </Card>

            {/* Goal Card 2 */}
            <Card hoverable className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="COMPLETED">Done</Badge>
                  <Badge variant="MEDIUM">Q2 Priority</Badge>
                </div>
                <button className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--color-text-primary)] mb-1">Q2 Marketing Site Refresh</h4>
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">Update all marketing assets and improve the landing page conversion funnel.</p>
              </div>
              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[var(--color-text-primary)]">Progress</span>
                  <span className="text-[var(--color-status-completed)]">100%</span>
                </div>
                <ProgressBar progress={100} variant="completed" />
                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    <Avatar name="Emma Wilson" size="sm" className="border-2 border-[var(--color-background-primary)]" />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-status-completed)] flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Completed
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Action Items & Announcements */}
        <div className="space-y-6">
          {/* Action Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-syne text-[var(--color-text-primary)]">My Action Items</h3>
              <Button variant="ghost" size="sm" className="h-8">View All</Button>
            </div>
            <Card className="p-2 flex flex-col gap-1 bg-transparent border-none shadow-none">
              {[
                { title: 'Review PR for Authentication', time: 'Today, 2:00 PM', priority: 'URGENT', status: 'TODO' },
                { title: 'Design System Implementation', time: 'Tomorrow', priority: 'HIGH', status: 'IN_PROGRESS' },
                { title: 'Update dependencies', time: 'Friday', priority: 'LOW', status: 'DONE' }
              ].map((item, i) => (
                <div key={i} className="group p-3 rounded-[10px] hover:bg-[var(--color-background-primary)] hover:border-0.5 hover:border-[var(--color-border-secondary)] border-0.5 border-transparent transition-all duration-150 ease flex items-start gap-3 cursor-pointer">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-[1.5px] shrink-0 flex items-center justify-center transition-colors ${item.status === 'DONE' ? 'bg-[var(--color-status-completed)] border-[var(--color-status-completed)] text-white' : 'border-[var(--color-border-secondary)] group-hover:border-accent'}`}>
                    {item.status === 'DONE' && <CheckCircle2 size={10} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${item.status === 'DONE' ? 'text-[var(--color-text-tertiary)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[var(--color-text-tertiary)] font-bold">{item.time}</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--color-border-secondary)]"></span>
                      <Badge variant={item.priority}>{item.priority.toLowerCase()}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Announcements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-syne text-[var(--color-text-primary)]">Recent Announcements</h3>
            </div>
            <Card hoverable className="p-4 bg-gradient-to-br from-[var(--color-background-primary)] to-[var(--color-background-secondary)] border-l-2 border-l-accent">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 text-accent flex items-center justify-center shrink-0">
                  <Megaphone size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Company All-Hands</h4>
                    <span className="text-[9px] font-bold text-[var(--color-text-tertiary)]">2h ago</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Join us this Friday for the Q3 planning session and product roadmap reveal.
                  </p>
                  <Button variant="ghost" size="sm" className="mt-3 h-7 text-[10px] px-2 border-none bg-[var(--color-background-secondary)]">
                    Read More
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
