import { twMerge } from 'tailwind-merge';

/**
 * Badge Primitive
 * Compact status indicator with color coding for system states.
 */
export default function Badge({ children, variant = 'neutral', className }) {
  const variants = {
    // Goal Status
    NOT_STARTED: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    IN_PROGRESS: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    COMPLETED: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    
    // Action Item Status
    TODO: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    IN_REVIEW: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    DONE: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    
    // Priority
    LOW: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    URGENT: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',

    neutral: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  };

  return (
    <span className={twMerge(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
      variants[variant] || variants.neutral,
      className
    )}>
      {children?.replace('_', ' ')}
    </span>
  );
}
