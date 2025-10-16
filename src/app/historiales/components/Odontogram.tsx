'use client';

import { useState } from 'react';

interface ToothCondition {
  id: number;
  status: 'healthy' | 'caries' | 'filling' | 'crown' | 'extraction' | 'root_canal' | 'implant' | 'missing';
  notes?: string;
}

interface OdontogramProps {
  initialConditions?: ToothCondition[];
  onUpdate: (conditions: ToothCondition[]) => void;
  readOnly?: boolean;
}

export default function Odontogram({ initialConditions = [], onUpdate, readOnly = false }: OdontogramProps) {
  const [toothConditions, setToothConditions] = useState<ToothCondition[]>(() => {
    // Inicializar todos los dientes como sanos si no hay condiciones previas
    const defaultConditions: ToothCondition[] = [];
    
    // Dientes permanentes: 11-18, 21-28, 31-38, 41-48
    const toothNumbers = [
      // Cuadrante superior derecho
      18, 17, 16, 15, 14, 13, 12, 11,
      // Cuadrante superior izquierdo  
      21, 22, 23, 24, 25, 26, 27, 28,
      // Cuadrante inferior izquierdo
      38, 37, 36, 35, 34, 33, 32, 31,
      // Cuadrante inferior derecho
      41, 42, 43, 44, 45, 46, 47, 48
    ];

    toothNumbers.forEach(num => {
      const existing = initialConditions.find(c => c.id === num);
      defaultConditions.push(existing || { id: num, status: 'healthy' });
    });

    return defaultConditions;
  });

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ToothCondition['status']>('healthy');

  const getToothColor = (status: ToothCondition['status']) => {
    const colors = {
      'healthy': 'fill-white stroke-gray-400',
      'caries': 'fill-red-500 stroke-red-600',
      'filling': 'fill-blue-500 stroke-blue-600',
      'crown': 'fill-yellow-500 stroke-yellow-600',
      'extraction': 'fill-gray-400 stroke-gray-500',
      'root_canal': 'fill-purple-500 stroke-purple-600',
      'implant': 'fill-green-500 stroke-green-600',
      'missing': 'fill-transparent stroke-red-500 stroke-dashed'
    };
    return colors[status];
  };

  const getStatusLabel = (status: ToothCondition['status']) => {
    const labels = {
      'healthy': 'Sano',
      'caries': 'Caries',
      'filling': 'Obturación',
      'crown': 'Corona',
      'extraction': 'Extracción',
      'root_canal': 'Endodoncia',
      'implant': 'Implante',
      'missing': 'Faltante'
    };
    return labels[status];
  };

  const handleToothClick = (toothId: number) => {
    if (readOnly) return;
    
    setSelectedTooth(toothId);
    const newConditions = toothConditions.map(tooth => 
      tooth.id === toothId 
        ? { ...tooth, status: selectedStatus }
        : tooth
    );
    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const getToothCondition = (toothId: number) => {
    return toothConditions.find(t => t.id === toothId)?.status || 'healthy';
  };

  // Componente de diente
  const Tooth = ({ number, position }: { number: number, position: { x: number, y: number } }) => {
    const condition = getToothCondition(number);
    const isSelected = selectedTooth === number;
    
    return (
      <g>
        <rect
          x={position.x}
          y={position.y}
          width="30"
          height="40"
          rx="5"
          className={`${getToothColor(condition)} ${
            isSelected ? 'stroke-4 stroke-blue-800' : 'stroke-2'
          } cursor-pointer hover:opacity-80 transition-all`}
          onClick={() => handleToothClick(number)}
        />
        <text
          x={position.x + 15}
          y={position.y + 25}
          textAnchor="middle"
          className="text-xs font-semibold pointer-events-none fill-gray-800"
        >
          {number}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Odontograma</h3>
        {!readOnly && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Estado:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ToothCondition['status'])}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="healthy">Sano</option>
              <option value="caries">Caries</option>
              <option value="filling">Obturación</option>
              <option value="crown">Corona</option>
              <option value="extraction">Extracción</option>
              <option value="root_canal">Endodoncia</option>
              <option value="implant">Implante</option>
              <option value="missing">Faltante</option>
            </select>
          </div>
        )}
      </div>

      {/* Odontograma SVG */}
      <div className="flex justify-center mb-6">
        <svg width="600" height="300" viewBox="0 0 600 300" className="border border-gray-300 rounded bg-gray-50">
          {/* Etiquetas de cuadrantes */}
          <text x="150" y="20" textAnchor="middle" className="text-sm font-medium fill-gray-600">
            Cuadrante 1 (18-11)
          </text>
          <text x="450" y="20" textAnchor="middle" className="text-sm font-medium fill-gray-600">
            Cuadrante 2 (21-28)
          </text>
          <text x="150" y="280" textAnchor="middle" className="text-sm font-medium fill-gray-600">
            Cuadrante 4 (41-48)
          </text>
          <text x="450" y="280" textAnchor="middle" className="text-sm font-medium fill-gray-600">
            Cuadrante 3 (31-38)
          </text>

          {/* Línea central */}
          <line x1="300" y1="30" x2="300" y2="270" stroke="#ccc" strokeWidth="2" strokeDasharray="5,5" />

          {/* Cuadrante superior derecho (18-11) */}
          {[18, 17, 16, 15, 14, 13, 12, 11].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 60 + (index * 35), y: 40 }}
            />
          ))}

          {/* Cuadrante superior izquierdo (21-28) */}
          {[21, 22, 23, 24, 25, 26, 27, 28].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 320 + (index * 35), y: 40 }}
            />
          ))}

          {/* Cuadrante inferior derecho (41-48) */}
          {[48, 47, 46, 45, 44, 43, 42, 41].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 60 + (index * 35), y: 200 }}
            />
          ))}

          {/* Cuadrante inferior izquierdo (31-38) */}
          {[31, 32, 33, 34, 35, 36, 37, 38].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 320 + (index * 35), y: 200 }}
            />
          ))}
        </svg>
      </div>

      {/* Leyenda */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { status: 'healthy', label: 'Sano' },
          { status: 'caries', label: 'Caries' },
          { status: 'filling', label: 'Obturación' },
          { status: 'crown', label: 'Corona' },
          { status: 'extraction', label: 'Extracción' },
          { status: 'root_canal', label: 'Endodoncia' },
          { status: 'implant', label: 'Implante' },
          { status: 'missing', label: 'Faltante' }
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center space-x-2">
            <div className={`w-4 h-4 border-2 rounded ${getToothColor(status as ToothCondition['status'])}`}></div>
            <span className="text-sm text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      {/* Resumen de condiciones */}
      {!readOnly && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Resumen del Estado Dental</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {Object.entries(
              toothConditions.reduce((acc, tooth) => {
                acc[tooth.status] = (acc[tooth.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([status, count]) => (
              count > 0 && (
                <div key={status} className="flex justify-between">
                  <span>{getStatusLabel(status as ToothCondition['status'])}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="mt-4 text-sm text-gray-600">
          <p>💡 <strong>Instrucciones:</strong></p>
          <p>1. Selecciona el estado del diente en el menú desplegable</p>
          <p>2. Haz clic en el diente que deseas modificar</p>
          <p>3. El odontograma se actualiza automáticamente</p>
        </div>
      )}
    </div>
  );
}