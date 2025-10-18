'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface MedicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function MedicalModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md'
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative flex items-center justify-center w-full h-full">
        <div 
          className={`
            relative w-full ${sizeClasses[size]} 
            bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[85vh] overflow-hidden
            transform transition-all duration-200 scale-100
            animate-in fade-in zoom-in-95 duration-200
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-blue-800">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 text-blue-600 hover:text-blue-700" />
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