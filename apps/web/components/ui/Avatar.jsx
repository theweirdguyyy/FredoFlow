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
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-16 h-16 text-lg',
  };

  const onlineSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-4 h-4',
  };

  return (
    <div className="relative inline-block group">
      <div className={twMerge(
        'rounded-full flex items-center justify-center font-bold overflow-hidden border-2 border-transparent group-hover:border-accent transition-all duration-300 bg-indigo-500 text-white select-none',
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
          'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-zinc-950 bg-green-500 shadow-sm',
          onlineSizes[size]
        )} />
      )}
    </div>
  );
}
