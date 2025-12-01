'use client';

import { useState, useEffect } from 'react';
import { Calendar, X, AlertCircle } from 'lucide-react';
import { dateHelper } from '@/utils/date-helper';

export function DebugDateControl() {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugDate, setDebugDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const info = dateHelper.getDebugInfo();
    setIsDebugMode(info.isDebug);
    setDebugDate(info.debugDate || info.realDate);
  }, []);

  const handleSetDebugDate = () => {
    if (debugDate) {
      dateHelper.setDebugDate(debugDate);
      setIsDebugMode(true);
      // Recargar la página para aplicar los cambios
      window.location.reload();
    }
  };

  const handleClearDebugDate = () => {
    dateHelper.clearDebugDate();
    setIsDebugMode(false);
    // Recargar la página para aplicar los cambios
    window.location.reload();
  };

  if (!isDebugMode && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Modo Debug: Simular fecha"
      >
        <Calendar className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 z-50 min-w-[320px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            {isDebugMode ? '🐛 Modo Debug Activo' : 'Simular Fecha'}
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isDebugMode && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-800 font-medium">Fecha simulada activa</p>
              <p className="text-yellow-700 mt-1">
                El sistema cree que hoy es: <strong>{debugDate}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha a simular
          </label>
          <input
            type="date"
            value={debugDate}
            onChange={(e) => setDebugDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Fecha real: {dateHelper.formatDate(new Date())}
          </p>
        </div>

        <div className="flex gap-2">
          {!isDebugMode ? (
            <button
              onClick={handleSetDebugDate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Activar
            </button>
          ) : (
            <button
              onClick={handleClearDebugDate}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Desactivar
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            💡 Tip: También puedes usar la consola del navegador:
          </p>
          <code className="block mt-1 text-xs bg-gray-100 p-2 rounded text-gray-700">
            dateHelper.setDebugDate('2024-11-18')
          </code>
        </div>
      </div>
    </div>
  );
}
