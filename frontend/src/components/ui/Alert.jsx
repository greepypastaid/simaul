import { cn } from '@/utils';

const VARIANTS = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  error: 'bg-red-50 text-red-800 border-red-200',
};

export function Alert({ className, variant = 'info', children, ...props }) {
  return (
    <div
      role="alert"
      className={cn('px-4 py-3 rounded-lg border', VARIANTS[variant], className)}
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
