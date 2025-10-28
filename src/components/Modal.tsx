import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
    '2xl': 'sm:max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn w-[200px">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-card rounded-2xl shadow-2xl w-full max-w-[300px] ${sizes[size]} max-h-[70vh] flex flex-col border border-border/50 animate-scaleIn`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-surface to-card sticky top-0 z-10 rounded-t-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-200 group"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
