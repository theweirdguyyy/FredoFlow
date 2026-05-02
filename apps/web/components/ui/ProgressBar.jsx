import { twMerge } from 'tailwind-merge';

/**
 * ProgressBar Primitive
 * Strict design system progress indicator.
 */
export default function ProgressBar({ 
  progress = 0, 
  variant = 'progress', // 'progress', 'completed', 'cancelled', 'overdue', etc.
  className 
}) {
  const getCssVariable = (v) => {
    switch (v) {
      case 'IN_PROGRESS': case 'progress': return 'var(--color-status-progress)';
      case 'COMPLETED': case 'completed': return 'var(--color-status-completed)';
      case 'CANCELLED': case 'cancelled': return 'var(--color-status-cancelled)';
      case 'OVERDUE': case 'overdue': return 'var(--color-status-overdue)';
      case 'URGENT': case 'urgent': return 'var(--color-priority-urgent)';
      case 'HIGH': case 'high': return 'var(--color-priority-high)';
      case 'MEDIUM': case 'medium': return 'var(--color-priority-medium)';
      case 'LOW': case 'low': return 'var(--color-priority-low)';
      default: return 'var(--color-status-progress)';
    }
  };

  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={twMerge('w-full h-[5px] bg-[var(--color-border-tertiary)] rounded-[4px] overflow-hidden', className)}>
      <div 
        className="h-full transition-all duration-300 ease"
        style={{ 
          width: `${safeProgress}%`,
          backgroundColor: getCssVariable(variant)
        }}
      />
    </div>
  );
}
