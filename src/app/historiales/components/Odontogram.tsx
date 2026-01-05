'use client';

import { useState } from 'react';
import { ToothCondition, ToothSector } from '@/services/medicalRecords';

export type { ToothCondition, ToothSector };

interface OdontogramProps {
  initialConditions?: ToothCondition[];
  onUpdate: (conditions: ToothCondition[]) => void;
  readOnly?: boolean;
  showLegend?: boolean;
  interventionColor?: 'red' | 'blue';
}

export default function Odontogram({ initialConditions = [], onUpdate, readOnly = false, showLegend = true, interventionColor = 'red' }: OdontogramProps) {
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
      const existing = initialConditions.find(c => c.number === num);
      defaultConditions.push(existing || { number: num, status: 'healthy' });
    });

    return defaultConditions;
  });

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ToothCondition['status']>('healthy');
  const [sectorMode, setSectorMode] = useState<boolean>(false);
  const [crownMode, setCrownMode] = useState<boolean>(false);
  const [prosthesisMode, setProsthesisMode] = useState<boolean>(false);
  const [extractionMode, setExtractionMode] = useState<boolean>(false);

  // Colores basados en el tipo de odontograma
  const sectorColor = interventionColor === 'blue' ? '#2563eb' : '#ef4444';
  const crownColor = interventionColor === 'blue' ? '#2563eb' : '#ef4444';
  const prosthesisColor = interventionColor === 'blue' ? '#2563eb' : '#ef4444';
  const extractionColor = interventionColor === 'blue' ? '#2563eb' : '#ef4444';

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
      tooth.number === toothId 
        ? { ...tooth, status: selectedStatus }
        : tooth
    );
    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const handleSectorClick = (toothId: number, sector: ToothSector['sector'], event: React.MouseEvent) => {
    if (readOnly || !sectorMode) return;
    
    // No permitir sectores en dientes ausentes
    const tooth = toothConditions.find(t => t.number === toothId);
    if (tooth?.status === 'missing') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const newConditions = toothConditions.map(tooth => {
      if (tooth.number === toothId) {
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
    const tooth = toothConditions.find(t => t.number === toothId);
    const sectorData = tooth?.sectors?.find(s => s.sector === sector);
    return sectorData?.hasRestoration || false;
  };

  const handleCrownClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !crownMode) return;
    
    // No permitir coronas en dientes ausentes
    const tooth = toothConditions.find(t => t.number === toothId);
    if (tooth?.status === 'missing') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const newConditions = toothConditions.map(tooth => 
      tooth.number === toothId 
        ? { ...tooth, hasCrown: !tooth.hasCrown }
        : tooth
    );
    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const getToothCrown = (toothId: number): boolean => {
    const tooth = toothConditions.find(t => t.number === toothId);
    return tooth?.hasCrown || false;
  };

  const handleProsthesisClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !prosthesisMode) return;
    
    // No permitir prótesis en dientes ausentes
    const tooth = toothConditions.find(t => t.number === toothId);
    if (tooth?.status === 'missing') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const newConditions = toothConditions.map(tooth => 
      tooth.number === toothId 
        ? { ...tooth, hasProsthesis: !tooth.hasProsthesis }
        : tooth
    );
    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const getToothProsthesis = (toothId: number): boolean => {
    const tooth = toothConditions.find(t => t.number === toothId);
    return tooth?.hasProsthesis || false;
  };

  const handleExtractionClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !extractionMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const newConditions = toothConditions.map(tooth => 
      tooth.number === toothId 
        ? { ...tooth, status: tooth.status === 'extraction' ? 'healthy' as const : 'extraction' as const }
        : tooth
    );
    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const getToothCondition = (toothId: number) => {
    return toothConditions.find(t => t.number === toothId)?.status || 'healthy';
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
              fill={getSectorRestoration(number, 'top') ? sectorColor : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'top', e)}
            />
            
            {/* Sector inferior */}
            <polygon
              points={`${position.x + 11},${position.y + 33} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44} ${position.x},${position.y + 44}`}
              fill={getSectorRestoration(number, 'bottom') ? sectorColor : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'bottom', e)}
            />
            
            {/* Sector izquierdo */}
            <polygon
              points={`${position.x},${position.y} ${position.x + 11},${position.y + 11} ${position.x + 11},${position.y + 33} ${position.x},${position.y + 44}`}
              fill={getSectorRestoration(number, 'left') ? sectorColor : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'left', e)}
            />
            
            {/* Sector derecho */}
            <polygon
              points={`${position.x + 44},${position.y} ${position.x + 33},${position.y + 11} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44}`}
              fill={getSectorRestoration(number, 'right') ? sectorColor : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'right', e)}
            />
            
            {/* Sector centro */}
            <rect
              x={position.x + 11}
              y={position.y + 11}
              width="22"
              height="22"
              fill={getSectorRestoration(number, 'center') ? sectorColor : 'transparent'}
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
                fill={sectorColor}
                className="pointer-events-none"
              />
            )}
            {getSectorRestoration(number, 'bottom') && (
              <polygon
                points={`${position.x + 11},${position.y + 33} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44} ${position.x},${position.y + 44}`}
                fill={sectorColor}
                className="pointer-events-none"
              />
            )}
            {getSectorRestoration(number, 'left') && (
              <polygon
                points={`${position.x},${position.y} ${position.x + 11},${position.y + 11} ${position.x + 11},${position.y + 33} ${position.x},${position.y + 44}`}
                fill={sectorColor}
                className="pointer-events-none"
              />
            )}
            {getSectorRestoration(number, 'right') && (
              <polygon
                points={`${position.x + 44},${position.y} ${position.x + 33},${position.y + 11} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44}`}
                fill={sectorColor}
                className="pointer-events-none"
              />
            )}
            {getSectorRestoration(number, 'center') && (
              <rect
                x={position.x + 11}
                y={position.y + 11}
                width="22"
                height="22"
                fill={sectorColor}
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
              stroke={extractionColor}
              strokeWidth="3"
              className="pointer-events-none"
            />
            <line
              x1={position.x + 39}
              y1={position.y + 5}
              x2={position.x + 5}
              y2={position.y + 39}
              stroke={extractionColor}
              strokeWidth="3"
              className="pointer-events-none"
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
            stroke={crownColor}
            strokeWidth="3"
            className="pointer-events-none"
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
              stroke={prosthesisColor}
              strokeWidth="3"
              className="pointer-events-none"
            />
            {/* Segunda línea paralela */}
            <line
              x1={position.x + 8}
              y1={position.y + 26}
              x2={position.x + 36}
              y2={position.y + 26}
              stroke={prosthesisColor}
              strokeWidth="3"
              className="pointer-events-none"
            />
          </>
        )}
      </g>
    );
  };

  return (
    <div>
      <div className="mb-6">
        
        {/* Referencias de Simbología (Read-only) */}
        {readOnly && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Referencias</h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                <div className="w-5 h-5 border-2 border-gray-700 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-700 font-medium">Restauraciones</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                <div className="w-5 h-5 border-2 border-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700 font-medium">Coronas</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                <div className="w-5 h-5 border-2 border-gray-700 relative">
                  <div className="absolute top-1 left-0 right-0 h-0.5 bg-green-600"></div>
                  <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-green-600"></div>
                </div>
                <span className="text-sm text-gray-700 font-medium">Prótesis</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                <div className="w-5 h-5 border-2 border-gray-700 relative flex items-center justify-center">
                  <span className="text-red-600 text-lg font-bold leading-none">✕</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">Extracciones</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                <div className="w-5 h-5 border-2 border-gray-600 bg-gray-400 rounded"></div>
                <span className="text-sm text-gray-700 font-medium">Ausente</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Simbología y Controles */}
        {!readOnly && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Simbología y Controles</h4>
            
            {/* Tratamientos Especiales */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Tratamientos</h5>
              <div className="flex flex-wrap gap-3">
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                    sectorMode 
                      ? 'bg-red-500 text-white shadow-md scale-105' 
                      : 'bg-white border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300'
                  }`}
                >
                  <div className="w-5 h-5 border-2 border-current bg-red-500 rounded"></div>
                  <span>Restauraciones</span>
                  {sectorMode && <span className="text-xs">✓</span>}
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                    crownMode 
                      ? 'bg-blue-500 text-white shadow-md scale-105' 
                      : 'bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="w-5 h-5 border-2 border-current rounded-full"></div>
                  <span>Coronas</span>
                  {crownMode && <span className="text-xs">✓</span>}
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                    prosthesisMode 
                      ? 'bg-green-500 text-white shadow-md scale-105' 
                      : 'bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300'
                  }`}
                >
                  <div className="w-5 h-5 border-2 border-current relative">
                    <div className="absolute top-1 left-0 right-0 h-0.5 bg-current"></div>
                    <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-current"></div>
                  </div>
                  <span>Prótesis</span>
                  {prosthesisMode && <span className="text-xs">✓</span>}
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                    extractionMode 
                      ? 'bg-red-600 text-white shadow-md scale-105' 
                      : 'bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400'
                  }`}
                >
                  <div className="w-5 h-5 border-2 border-current relative flex items-center justify-center">
                    <span className="text-lg font-bold leading-none">✕</span>
                  </div>
                  <span>Extracciones</span>
                  {extractionMode && <span className="text-xs">✓</span>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Odontograma SVG */}
      <div className="flex justify-center mb-6">
        <svg width="900" height="400" viewBox="0 0 900 400" className="border border-gray-300 rounded bg-white">

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

      {/* Referencias del odontograma */}
      {showLegend && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => {
              const element = document.getElementById('odontogram-instructions');
              if (element) {
                element.classList.toggle('hidden');
              }
            }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">Referencias</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div id="odontogram-instructions" className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 border-2 border-gray-700 bg-red-500 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Restauraciones</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 border-2 border-blue-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Coronas</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 border-2 border-gray-700 relative">
                  <div className="absolute top-1 left-0 right-0 h-0.5 bg-green-600"></div>
                  <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-green-600"></div>
                </div>
                <span className="text-sm font-medium text-gray-700">Prótesis</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 border-2 border-gray-700 relative flex items-center justify-center">
                  <span className="text-red-600 text-lg font-bold leading-none">✕</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Extracciones</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 border-2 border-gray-600 bg-gray-400 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Ausente</span>
              </div>
            </div>
          </div>
        </div>
      )}

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