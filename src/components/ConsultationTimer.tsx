'use client';

import { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

interface ConsultationTimerProps {
  appointmentId: string;
  patientName: string;
  startTime: Date;
  onFinish: () => void;
  onClose: () => void;
}

export default function ConsultationTimer({
  appointmentId,
  patientName,
  startTime,
  onFinish,
  onClose
}: ConsultationTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await onFinish();
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="fixed right-6 top-24 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white font-semibold text-sm">Consulta en Curso</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
          title="Minimizar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Patient Info */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Paciente</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{patientName}</p>
        </div>

        {/* Timer */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Tiempo transcurrido</span>
          </div>
          <div className="text-4xl font-bold text-blue-900 font-mono tracking-wider">
            {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleFinish}
          disabled={isFinishing}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isFinishing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Finalizando...</span>
            </>
          ) : (
            <span>Finalizar Consulta</span>
          )}
        </button>
      </div>
    </div>
  );
}
