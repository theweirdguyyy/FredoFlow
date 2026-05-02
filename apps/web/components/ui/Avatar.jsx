import { twMerge } from 'tailwind-merge';

/**
 * Avatar Primitive
 * Displays user profile image or initials fallback with presence indicator.
 */
export default function Avatar({ 
  name, 
  src, 
  size = 'md', 
  online = false, 
  className 
}) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const sizes = {
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-[10px]',
    lg: 'w-10 h-10 text-[11px]',
    xl: 'w-12 h-12 text-xs',
  };

  const onlineSizes = {
    sm: 'w-2 h-2',
    md: 'w-[9px] h-[9px]',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  };

  return (
    <div className="relative inline-block group">
      <div className={twMerge(
        'rounded-full flex items-center justify-center font-bold overflow-hidden border-2 border-transparent transition-all duration-150 ease bg-accent text-white select-none',
        sizes[size],
        className
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {online && (
        <span className={twMerge(
          'absolute bottom-0 right-0 rounded-full border-[1.5px] border-white dark:border-[var(--color-background-tertiary)] bg-[#10b981]',
          onlineSizes[size]
        )} />
      )}
    </div>
  );
}
