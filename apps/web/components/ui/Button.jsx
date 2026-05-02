import { twMerge } from 'tailwind-merge';

/**
 * Button Primitive
 * Premium interactive button adhering to strict design system.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  ...props
}) {
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover active:scale-[0.98]',
    ghost: 'bg-[var(--color-background-secondary)] border-0.5 border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-secondary)] hover:text-[var(--color-text-primary)] active:scale-[0.98]',
    danger: 'bg-transparent border-0.5 border-red-500/40 text-red-500 hover:bg-red-500/10 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm font-medium',
    lg: 'h-12 px-6 text-base font-semibold',
  };

  return (
    <button
      className={twMerge(
        'inline-flex items-center justify-center rounded-button transition-all duration-150 ease outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-950',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
