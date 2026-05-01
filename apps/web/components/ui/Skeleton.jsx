import { twMerge } from 'tailwind-merge';

/**
 * Skeleton Primitive
 * Animated placeholder for loading states.
 */
export default function Skeleton({ className }) {
  return (
    <div className={twMerge('animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded', className)} />
  );
}

/**
 * SkeletonCard
 * Pre-composed loading state for workspace cards.
 */
export function SkeletonCard() {
  return (
    <div className="p-4 border border-zinc-100 dark:border-zinc-900 rounded-xl space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

/**
 * SkeletonList
 * Pre-composed loading state for sidebar or feed items.
 */
export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
