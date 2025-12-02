import { cn } from '@/utils';

/**
 * Alert Component
 * Display alert messages with different variants
 */
export function Alert({ className, variant = 'info', children, ...props }) {
  const variants = {
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  };

  return (
    <div
      role="alert"
      className={cn(
        'px-4 py-3 rounded-lg border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ className, children, ...props }) {
  return (
    <h5 className={cn('font-medium mb-1', className)} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm', className)} {...props}>
      {children}
    </p>
  );
}

export default Alert;
