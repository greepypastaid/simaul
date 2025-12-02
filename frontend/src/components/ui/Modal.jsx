import { cn } from '@/utils';
import { X } from 'lucide-react';

export function Modal({ open, onClose, children, className }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      <div 
        className={cn(
          'relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ children, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export function ModalBody({ children, className }) {
  return (
    <div className={cn('px-6 py-4 overflow-y-auto', className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className }) {
  return (
    <div className={cn('flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50', className)}>
      {children}
    </div>
  );
}

export default Modal;
