import { twMerge } from 'tailwind-merge';

/**
 * Input Primitive
 * Accessible text input with label, icon slots, and error states.
 */
export default function Input({
  label,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative group">
        {LeftIcon && (
          <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-accent transition-colors">
            <LeftIcon size={16} />
          </div>
        )}
        <input
          className={twMerge(
            'w-full py-[10px] px-[14px] bg-[var(--color-background-secondary)] border-0.5 border-[var(--color-border-tertiary)] rounded-[8px] outline-none transition-all duration-150 ease text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
            'focus:border-accent focus:bg-[var(--color-background-primary)]',
            LeftIcon && 'pl-[40px]',
            RightIcon && 'pr-[40px]',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
            <RightIcon size={16} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
