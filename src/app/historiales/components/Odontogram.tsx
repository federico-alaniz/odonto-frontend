'use client';

import { useState } from 'react';

interface ToothSector {
  sector: 'top' | 'bottom' | 'left' | 'right' | 'center';
  hasRestoration: boolean;
}

interface ToothCondition {
  id: number;
  status: 'healthy' | 'caries' | 'filling' | 'crown' | 'extraction' | 'root_canal' | 'implant' | 'missing';
  sectors?: ToothSector[];
  hasCrown?: boolean;
  hasProsthesis?: boolean;
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
    
    // Todos los dientes según la imagen: permanentes y temporales (de leche)
    const toothNumbers = [
      // Dientes permanentes superiores
      18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
      // Dientes permanentes inferiores
      48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
      // Dientes temporales (de leche) superiores
      55, 54, 53, 52, 51, 61, 62, 63, 64, 65,
      // Dientes temporales (de leche) inferiores
      85, 84, 83, 82, 81, 71, 72, 73, 74, 75
    ];

    toothNumbers.forEach(num => {
      const existing = initialConditions.find(c => c.id === num);
      defaultConditions.push(existing || { id: num, status: 'healthy' });
    });

    return defaultConditions;
  });

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ToothCondition['status']>('healthy');
  const [sectorMode, setSectorMode] = useState<boolean>(false);
  const [crownMode, setCrownMode] = useState<boolean>(false);
  const [prosthesisMode, setProsthesisMode] = useState<boolean>(false);
  const [extractionMode, setExtractionMode] = useState<boolean>(false);

  const getToothColor = (status: ToothCondition['status']) => {
    const colors = {
      'healthy': 'fill-white stroke-gray-800',
      'caries': 'fill-red-500 stroke-gray-800',
      'filling': 'fill-red-500 stroke-gray-800',
      'crown': 'fill-red-500 stroke-gray-800',
      'extraction': 'fill-white stroke-gray-800',
      'root_canal': 'fill-red-500 stroke-gray-800',
      'implant': 'fill-red-500 stroke-gray-800',
      'missing': 'fill-gray-400 stroke-gray-600'
    };
    return colors[status];
  };

  const getStatusLabel = (status: ToothCondition['status']) => {
    const labels = {
      'healthy': 'Sano',
      'caries': 'Con Problemas',
      'filling': 'Con Problemas',
      'crown': 'Con Problemas',
      'extraction': 'Extraído',
      'root_canal': 'Con Problemas',
      'implant': 'Con Problemas',
      'missing': 'Ausente'
    };
    return labels[status];
  };

  const handleToothClick = (toothId: number, event?: React.MouseEvent) => {
    if (readOnly) return;
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Si estamos en modo corona, manejar corona
    if (crownMode) {
      handleCrownClick(toothId, event!);
      return;
    }

    // Si estamos en modo prótesis, manejar prótesis
    if (prosthesisMode) {
      handleProsthesisClick(toothId, event!);
      return;
    }

    // Si estamos en modo extracción, manejar extracción
    if (extractionMode) {
      handleExtractionClick(toothId, event!);
      return;
    }
    
    // Si estamos en modo sector, no hacer nada (los sectores se manejan por separado)
    if (sectorMode) return;
    
    setSelectedTooth(toothId);
    const newConditions = toothConditions.map(tooth => 
      tooth.id === toothId 
        ? { ...tooth, status: selectedStatus }
        : tooth
    );
    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const handleSectorClick = (toothId: number, sector: ToothSector['sector'], event: React.MouseEvent) => {
    if (readOnly || !sectorMode) return;
    
    // No permitir sectores en dientes ausentes
    const tooth = toothConditions.find(t => t.id === toothId);
    if (tooth?.status === 'missing') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const newConditions = toothConditions.map(tooth => {
      if (tooth.id === toothId) {
        const currentSectors = tooth.sectors || [];
        const existingSectorIndex = currentSectors.findIndex(s => s.sector === sector);
        
        let newSectors: ToothSector[];
        if (existingSectorIndex >= 0) {
          // Toggle existing sector
          newSectors = currentSectors.map((s, index) => 
            index === existingSectorIndex 
              ? { ...s, hasRestoration: !s.hasRestoration }
              : s
          );
        } else {
          // Add new sector
          newSectors = [...currentSectors, { sector, hasRestoration: true }];
        }
        
        return { ...tooth, sectors: newSectors };
      }
      return tooth;
    });
    
    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const getSectorRestoration = (toothId: number, sector: ToothSector['sector']): boolean => {
    const tooth = toothConditions.find(t => t.id === toothId);
    const sectorData = tooth?.sectors?.find(s => s.sector === sector);
    return sectorData?.hasRestoration || false;
  };

  const handleCrownClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !crownMode) return;
    
    // No permitir coronas en dientes ausentes
    const tooth = toothConditions.find(t => t.id === toothId);
    if (tooth?.status === 'missing') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const newConditions = toothConditions.map(tooth => 
      tooth.id === toothId 
        ? { ...tooth, hasCrown: !tooth.hasCrown }
        : tooth
    );
    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const getToothCrown = (toothId: number): boolean => {
    const tooth = toothConditions.find(t => t.id === toothId);
    return tooth?.hasCrown || false;
  };

  const handleProsthesisClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !prosthesisMode) return;
    
    // No permitir prótesis en dientes ausentes
    const tooth = toothConditions.find(t => t.id === toothId);
    if (tooth?.status === 'missing') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const newConditions = toothConditions.map(tooth => 
      tooth.id === toothId 
        ? { ...tooth, hasProsthesis: !tooth.hasProsthesis }
        : tooth
    );
    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const getToothProsthesis = (toothId: number): boolean => {
    const tooth = toothConditions.find(t => t.id === toothId);
    return tooth?.hasProsthesis || false;
  };

  const handleExtractionClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !extractionMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const newConditions = toothConditions.map(tooth => 
      tooth.id === toothId 
        ? { ...tooth, status: tooth.status === 'extraction' ? 'healthy' as const : 'extraction' as const }
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
        {/* Número del diente arriba */}
        <text
          x={position.x + 22}
          y={position.y - 5}
          textAnchor="middle"
          className="text-sm font-medium pointer-events-none fill-blue-800"
        >
          {number}
        </text>
        
        {/* Cuadrado exterior */}
        <rect
          x={position.x}
          y={position.y}
          width="44"
          height="44"
          className={`${getToothColor(condition)} ${
            isSelected ? 'stroke-4 stroke-blue-600' : 'stroke-2'
          } ${condition !== 'missing' ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-60'} transition-all`}
          onClick={(e) => condition !== 'missing' ? handleToothClick(number, e) : e.preventDefault()}
        />
        
        {/* Sectores clickeables para restauraciones */}
        {sectorMode && !readOnly && condition !== 'missing' && (
          <>
            {/* Sector superior */}
            <polygon
              points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y} ${position.x},${position.y}`}
              fill={getSectorRestoration(number, 'top') ? '#ef4444' : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'top', e)}
            />
            
            {/* Sector inferior */}
            <polygon
              points={`${position.x + 11},${position.y + 33} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44} ${position.x},${position.y + 44}`}
              fill={getSectorRestoration(number, 'bottom') ? '#ef4444' : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'bottom', e)}
            />
            
            {/* Sector izquierdo */}
            <polygon
              points={`${position.x},${position.y} ${position.x + 11},${position.y + 11} ${position.x + 11},${position.y + 33} ${position.x},${position.y + 44}`}
              fill={getSectorRestoration(number, 'left') ? '#ef4444' : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'left', e)}
            />
            
            {/* Sector derecho */}
            <polygon
              points={`${position.x + 44},${position.y} ${position.x + 33},${position.y + 11} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44}`}
              fill={getSectorRestoration(number, 'right') ? '#ef4444' : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'right', e)}
            />
            
            {/* Sector centro */}
            <rect
              x={position.x + 11}
              y={position.y + 11}
              width="22"
              height="22"
              fill={getSectorRestoration(number, 'center') ? '#ef4444' : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'center', e)}
            />
          </>
        )}
        
        {/* Cuadrado interior */}
        <rect
          x={position.x + 11}
          y={position.y + 11}
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="stroke-gray-800 pointer-events-none"
        />
        
        {/* Líneas diagonales conectando vértices exterior-interior */}
        <line
          x1={position.x}
          y1={position.y}
          x2={position.x + 11}
          y2={position.y + 11}
          stroke="currentColor"
          strokeWidth="1"
          className="stroke-gray-800 pointer-events-none"
        />
        <line
          x1={position.x + 44}
          y1={position.y}
          x2={position.x + 33}
          y2={position.y + 11}
          stroke="currentColor"
          strokeWidth="1"
          className="stroke-gray-800 pointer-events-none"
        />
        <line
          x1={position.x}
          y1={position.y + 44}
          x2={position.x + 11}
          y2={position.y + 33}
          stroke="currentColor"
          strokeWidth="1"
          className="stroke-gray-800 pointer-events-none"
        />
        <line
          x1={position.x + 44}
          y1={position.y + 44}
          x2={position.x + 33}
          y2={position.y + 33}
          stroke="currentColor"
          strokeWidth="1"
          className="stroke-gray-800 pointer-events-none"
        />
        
        {/* Mostrar sectores con restauraciones (modo solo lectura) */}
        {!sectorMode && (
          <>
            {getSectorRestoration(number, 'top') && (
              <polygon
                points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y} ${position.x},${position.y}`}
                fill="#ef4444"
                className="pointer-events-none"
              />
            )}
            {getSectorRestoration(number, 'bottom') && (
              <polygon
                points={`${position.x + 11},${position.y + 33} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44} ${position.x},${position.y + 44}`}
                fill="#ef4444"
                className="pointer-events-none"
              />
            )}
            {getSectorRestoration(number, 'left') && (
              <polygon
                points={`${position.x},${position.y} ${position.x + 11},${position.y + 11} ${position.x + 11},${position.y + 33} ${position.x},${position.y + 44}`}
                fill="#ef4444"
                className="pointer-events-none"
              />
            )}
            {getSectorRestoration(number, 'right') && (
              <polygon
                points={`${position.x + 44},${position.y} ${position.x + 33},${position.y + 11} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44}`}
                fill="#ef4444"
                className="pointer-events-none"
              />
            )}
            {getSectorRestoration(number, 'center') && (
              <rect
                x={position.x + 11}
                y={position.y + 11}
                width="22"
                height="22"
                fill="#ef4444"
                className="pointer-events-none"
              />
            )}
          </>
        )}
        
        {/* X para dientes extraídos */}
        {condition === 'extraction' && (
          <>
            <line
              x1={position.x + 5}
              y1={position.y + 5}
              x2={position.x + 39}
              y2={position.y + 39}
              stroke="currentColor"
              strokeWidth="3"
              className="stroke-red-600 pointer-events-none"
            />
            <line
              x1={position.x + 39}
              y1={position.y + 5}
              x2={position.x + 5}
              y2={position.y + 39}
              stroke="currentColor"
              strokeWidth="3"
              className="stroke-red-600 pointer-events-none"
            />
          </>
        )}
        
        {/* Círculo para coronas - superpuesto y centrado al diente */}
        {getToothCrown(number) && (
          <circle
            cx={position.x + 22}
            cy={position.y + 22}
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="stroke-blue-600 pointer-events-none"
          />
        )}

        {/* Líneas paralelas para prótesis - superpuestas al diente */}
        {getToothProsthesis(number) && (
          <>
            {/* Primera línea paralela */}
            <line
              x1={position.x + 8}
              y1={position.y + 18}
              x2={position.x + 36}
              y2={position.y + 18}
              stroke="currentColor"
              strokeWidth="3"
              className="stroke-green-600 pointer-events-none"
            />
            {/* Segunda línea paralela */}
            <line
              x1={position.x + 8}
              y1={position.y + 26}
              x2={position.x + 36}
              y2={position.y + 26}
              stroke="currentColor"
              strokeWidth="3"
              className="stroke-green-600 pointer-events-none"
            />
          </>
        )}
      </g>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Odontograma</h3>
        
        {/* Simbología y Controles */}
        {!readOnly && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Simbología y Controles</h4>
            
            {/* Estados Básicos */}
            <div className="mb-4">
              <h5 className="text-xs font-medium text-gray-600 mb-2">Estados Básicos del Diente:</h5>
              <div className="flex flex-wrap items-center gap-2">
                {!sectorMode && !crownMode && !prosthesisMode && !extractionMode && (
                  <>
                    <span className="text-xs text-gray-600">Estado:</span>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelectedStatus(e.target.value as ToothCondition['status']);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="healthy">Sano</option>
                      <option value="caries">Con Problemas</option>
                      <option value="missing">Ausente</option>
                    </select>
                  </>
                )}
                
                {/* Símbolos de estados básicos */}
                <div className="flex items-center space-x-4 ml-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 border-2 border-gray-800 bg-white"></div>
                    <span className="text-xs text-gray-600">Sano</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 border-2 border-gray-800 bg-red-500"></div>
                    <span className="text-xs text-gray-600">Con Problemas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 border-2 border-gray-800 bg-gray-400"></div>
                    <span className="text-xs text-gray-600">Ausente</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tratamientos Especiales */}
            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-2">Tratamientos Especiales:</h5>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCrownMode(false);
                    setProsthesisMode(false);
                    setExtractionMode(false);
                    setSectorMode(!sectorMode);
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    sectorMode 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white border border-red-300 text-red-600 hover:bg-red-50'
                  }`}
                >
                  <div className="w-4 h-4 border border-gray-600 bg-red-500 rounded-sm"></div>
                  <span>{sectorMode ? '✓ Restauraciones' : 'Restauraciones'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSectorMode(false);
                    setProsthesisMode(false);
                    setExtractionMode(false);
                    setCrownMode(!crownMode);
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    crownMode 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-blue-300 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <div className="w-4 h-4 border border-gray-600 bg-white rounded-full relative">
                    <div className="absolute inset-0.5 border border-blue-600 rounded-full"></div>
                  </div>
                  <span>{crownMode ? '✓ Coronas' : 'Coronas'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSectorMode(false);
                    setCrownMode(false);
                    setExtractionMode(false);
                    setProsthesisMode(!prosthesisMode);
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    prosthesisMode 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white border border-green-300 text-green-600 hover:bg-green-50'
                  }`}
                >
                  <div className="w-4 h-4 border border-gray-600 bg-white relative">
                    <div className="absolute top-1 left-0.5 right-0.5 h-0.5 bg-green-600"></div>
                    <div className="absolute bottom-1 left-0.5 right-0.5 h-0.5 bg-green-600"></div>
                  </div>
                  <span>{prosthesisMode ? '✓ Prótesis' : 'Prótesis'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSectorMode(false);
                    setCrownMode(false);
                    setProsthesisMode(false);
                    setExtractionMode(!extractionMode);
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    extractionMode 
                      ? 'bg-red-600 text-white' 
                      : 'bg-white border border-red-400 text-red-700 hover:bg-red-50'
                  }`}
                >
                  <div className="w-4 h-4 border-2 border-gray-800 bg-white relative">
                    <span className="absolute inset-0 flex items-center justify-center text-red-600 text-xs font-bold">✕</span>
                  </div>
                  <span>{extractionMode ? '✓ Extracciones' : 'Extracciones'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Odontograma SVG */}
      <div className="flex justify-center mb-6">
        <svg width="900" height="400" viewBox="0 0 900 400" className="border border-gray-300 rounded bg-white">
          {/* Título */}
          <text x="50" y="40" className="text-2xl font-bold fill-black">
            Odontograma
          </text>

          {/* DIENTES PERMANENTES SUPERIORES */}
          {/* Fila superior izquierda (18-11) */}
          {[18, 17, 16, 15, 14, 13, 12, 11].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 60 + (index * 50), y: 80 }}
            />
          ))}

          {/* Fila superior derecha (21-28) */}
          {[21, 22, 23, 24, 25, 26, 27, 28].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 480 + (index * 50), y: 80 }}
            />
          ))}

          {/* DIENTES PERMANENTES INFERIORES */}
          {/* Fila inferior izquierda (48-41) */}
          {[48, 47, 46, 45, 44, 43, 42, 41].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 60 + (index * 50), y: 140 }}
            />
          ))}

          {/* Fila inferior derecha (31-38) */}
          {[31, 32, 33, 34, 35, 36, 37, 38].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 480 + (index * 50), y: 140 }}
            />
          ))}

          {/* DIENTES TEMPORALES (DE LECHE) SUPERIORES */}
          {/* Fila temporal superior izquierda (55-51) */}
          {[55, 54, 53, 52, 51].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 210 + (index * 50), y: 220 }}
            />
          ))}

          {/* Fila temporal superior derecha (61-65) */}
          {[61, 62, 63, 64, 65].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 480 + (index * 50), y: 220 }}
            />
          ))}

          {/* DIENTES TEMPORALES (DE LECHE) INFERIORES */}
          {/* Fila temporal inferior izquierda (85-81) */}
          {[85, 84, 83, 82, 81].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 210 + (index * 50), y: 280 }}
            />
          ))}

          {/* Fila temporal inferior derecha (71-75) */}
          {[71, 72, 73, 74, 75].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 480 + (index * 50), y: 280 }}
            />
          ))}
        </svg>
      </div>

      {/* Información sobre el odontograma */}
      <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p>
          <strong>Numeración FDI:</strong> Sistema internacional de numeración dental.
        </p>
        <div className="mt-2 space-y-1">
          <p><strong>Estados básicos:</strong> Seleccione el estado y haga clic en el diente (Sano, Con Problemas, Ausente).</p>
          <p><strong>Tratamientos especiales:</strong> Active el modo correspondiente y haga clic en el diente:</p>
          <ul className="ml-4 space-y-0.5">
            <li>• <strong>Restauraciones:</strong> Marque sectores específicos del diente con caries o restauraciones</li>
            <li>• <strong>Coronas:</strong> Círculo azul superpuesto al diente</li>
            <li>• <strong>Prótesis:</strong> Líneas verdes paralelas superpuestas al diente</li>
            <li>• <strong>Extracciones:</strong> Cruz roja sobre fondo blanco</li>
          </ul>
          <p className="mt-1"><strong>Nota:</strong> Los dientes ausentes (grises) no pueden ser editados.</p>
        </div>
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


    </div>
  );
}