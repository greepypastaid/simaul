import { cn } from '@/utils';

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'blue',
  className 
}) {
  const iconColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  };

  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500',
  };

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={cn('text-sm mt-1', changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', iconColors[iconColor])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
