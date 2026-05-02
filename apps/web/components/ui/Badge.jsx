import { twMerge } from 'tailwind-merge';

/**
 * Badge Primitive
 * Compact indicator with strict color variables and 12% opacity background.
 */
export default function Badge({ children, variant = 'NOT_STARTED', className }) {
  const getCssVariable = (v) => {
    switch (v) {
      case 'IN_PROGRESS': return 'var(--color-status-progress)';
      case 'COMPLETED': case 'DONE': return 'var(--color-status-completed)';
      case 'NOT_STARTED': case 'TODO': return 'var(--color-status-not-started)';
      case 'CANCELLED': return 'var(--color-status-cancelled)';
      case 'OVERDUE': return 'var(--color-status-overdue)';
      case 'URGENT': return 'var(--color-priority-urgent)';
      case 'HIGH': return 'var(--color-priority-high)';
      case 'MEDIUM': return 'var(--color-priority-medium)';
      case 'LOW': return 'var(--color-priority-low)';
      default: return 'var(--color-status-not-started)';
    }
  };

  const colorVar = getCssVariable(variant);

  return (
    <span 
      className={twMerge(
        'inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider',
        className
      )}
      style={{
        color: colorVar,
        backgroundColor: `color-mix(in srgb, ${colorVar} 12%, transparent)`
      }}
    >
      {typeof children === 'string' ? children.replace('_', ' ') : children}
    </span>
  );
}
