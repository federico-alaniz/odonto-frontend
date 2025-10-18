'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id?: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  isVisible?: boolean;
}

const Toast = ({ 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  isVisible = true 
}: ToastProps) => {
  const [show, setShow] = useState(isVisible);

  const handleClose = useCallback(() => {
    setShow(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Match animation duration
  }, [onClose]);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "rounded-xl border-2 shadow-xl backdrop-blur-sm";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-100 border-green-300 text-green-900`;
      case 'error':
        return `${baseStyles} bg-red-100 border-red-300 text-red-900`;
      case 'warning':
        return `${baseStyles} bg-yellow-100 border-yellow-300 text-yellow-900`;
      case 'info':
        return `${baseStyles} bg-blue-100 border-blue-300 text-blue-900`;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
    }
  };

  if (!show) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-[9999] w-96
        transform transition-all duration-500 ease-out
        ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{
        right: '1rem',
        maxWidth: 'calc(100vw - 2rem)'
      }}
    >
      <div className={`p-5 ${getStyles()}`}>
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 ${getIconColor()}`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base">
              {title}
            </div>
            {message && (
              <div className="mt-1 text-sm opacity-90">
                {message}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;