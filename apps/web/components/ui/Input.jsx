import { clsx } from 'clsx';
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
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <div className="relative group">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-accent transition-colors">
            <LeftIcon size={18} />
          </div>
        )}
        <input
          className={twMerge(
            'w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none transition-all duration-200 text-sm placeholder:text-zinc-400',
            'focus:border-accent focus:ring-4 focus:ring-accent/10',
            LeftIcon && 'pl-10',
            RightIcon && 'pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
            className
          )}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <RightIcon size={18} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
