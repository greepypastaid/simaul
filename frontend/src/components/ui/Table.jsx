import { cn } from '@/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return (
    <thead className={cn('bg-gray-50 border-b border-gray-200', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }) {
  return (
    <tbody className={cn('divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr 
      className={cn(
        'hover:bg-gray-50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }) {
  return (
    <td className={cn('px-4 py-3 text-sm text-gray-900', className)}>
      {children}
    </td>
  );
}

export function TableEmpty({ children = 'Tidak ada data', colSpan = 1 }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-500">
        {children}
      </td>
    </tr>
  );
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className 
}) {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <p className="text-sm text-gray-500">
        Halaman {currentPage} dari {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
          </>
        )}
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            )}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Table;
