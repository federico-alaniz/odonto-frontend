'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface MedicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
}

export default function MedicalModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  icon 
}: MedicalModalProps) {
  const [mounted, setMounted] = useState(false);

  // Asegurar que estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative flex items-center justify-center w-full h-full">
        <div 
          className={`
            relative w-full ${sizeClasses[size]} 
            medical-card max-h-[85vh] overflow-hidden
            transform transition-all duration-200 scale-100
            shadow-2xl animate-in fade-in zoom-in-95 duration-200
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b medical-border bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center">
              {icon && <span className="mr-3 text-xl">{icon}</span>}
              <h2 className="text-lg font-semibold text-blue-900">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/70 rounded-lg transition-colors focus-ring"
              aria-label="Cerrar modal"
            >
              <span className="text-xl text-slate-600">✕</span>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}