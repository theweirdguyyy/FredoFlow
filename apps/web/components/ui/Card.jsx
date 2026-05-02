import { twMerge } from 'tailwind-merge';

/**
 * Card Primitive
 * Surface container matching the strict design system.
 */
export default function Card({ children, className, hoverable = false, ...props }) {
  return (
    <div
      className={twMerge(
        'bg-[var(--color-background-primary)] border-0.5 border-[var(--color-border-tertiary)] rounded-card overflow-hidden transition-all duration-150 ease',
        hoverable && 'hover:-translate-y-[1px] hover:border-[var(--color-border-secondary)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
