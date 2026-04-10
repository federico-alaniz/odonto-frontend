'use client';

import { useState, useEffect, useRef } from 'react';
import { ToothCondition, ToothSector } from '@/services/medicalRecords';

export type { ToothCondition, ToothSector };

interface OdontogramProps {
  initialConditions?: ToothCondition[];
  onUpdate: (conditions: ToothCondition[]) => void;
  onPlanChange?: (planItems: any[]) => void;
  readOnly?: boolean;
  showLegend?: boolean;
  interventionColor?: 'red' | 'blue';
  showBorder?: boolean;
  className?: string;
  printMode?: boolean;
  medicalRecordId?: string;
  initialPlan?: any[];
}

export default function Odontogram({ 
  initialConditions = [], 
  onUpdate, 
  onPlanChange,
  readOnly = false, 
  showLegend = true, 
  interventionColor = 'red', 
  showBorder = true,
  className = '',
  printMode = false,
  medicalRecordId,
  initialPlan
}: OdontogramProps) {

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
  const [selectedSector, setSelectedSector] = useState<ToothSector['sector'] | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ToothCondition['status']>('healthy');
  const [newProcedureDate, setNewProcedureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newProcedureText, setNewProcedureText] = useState<string>('');
  const [newProcedureNotes, setNewProcedureNotes] = useState<string>('');
  const [sectorMode, setSectorMode] = useState<boolean>(false);
  const [crownMode, setCrownMode] = useState<boolean>(false);
  const [prosthesisMode, setProsthesisMode] = useState<boolean>(false);
  const [extractionMode, setExtractionMode] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedProcedure, setSelectedProcedure] = useState<any | null>(null);
  
  // Plan mode state
  const [planMode, setPlanMode] = useState<boolean>(false);
  const [planItems, setPlanItems] = useState<any[]>(() => []);
  const [planProcedureCode, setPlanProcedureCode] = useState<string>('');
  const [planProcedureName, setPlanProcedureName] = useState<string>('');
  const [showProcedureDropdown, setShowProcedureDropdown] = useState<boolean>(false);
  const procedureDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!showProcedureDropdown) return;
    const onDocClick = (e: MouseEvent) => {
      if (procedureDropdownRef.current && !procedureDropdownRef.current.contains(e.target as Node)) {
        setShowProcedureDropdown(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowProcedureDropdown(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showProcedureDropdown]);
  
  const [planNotes, setPlanNotes] = useState<string>('');
  const [savingPlan, setSavingPlan] = useState<boolean>(false);
  const [executingPlanId, setExecutingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlan && Array.isArray(initialPlan) && initialPlan.length > 0) {
      setPlanItems(initialPlan);
    }
  }, [initialPlan]);

  // Notify parent when local planItems change (avoid calling setState on parent during render)
  useEffect(() => {
    if (typeof onPlanChange === 'function') {
      try {
        onPlanChange(planItems);
      } catch (e) {
        // swallow to avoid render-time exceptions
        console.error('onPlanChange callback error', e);
      }
    }
  }, [planItems, onPlanChange]);

  // Colores basados en el tipo de odontograma
  const sectorColor = interventionColor === 'blue' ? '#2563eb' : '#ef4444';
  const crownColor = interventionColor === 'blue' ? '#2563eb' : '#ef4444';
  const prosthesisColor = interventionColor === 'blue' ? '#2563eb' : '#ef4444';
  const extractionColor = interventionColor === 'blue' ? '#2563eb' : '#ef4444';

  const getToothColor = (status: ToothCondition['status']) => {
    if (printMode) {
      const map: Record<string, { fill: string; stroke: string }> = {
        'healthy': { fill: '#ffffff', stroke: '#1f2937' },
        'caries': { fill: '#ef4444', stroke: '#1f2937' },
        'filling': { fill: '#ef4444', stroke: '#1f2937' },
        'crown': { fill: '#ef4444', stroke: '#1f2937' },
        'extraction': { fill: '#ffffff', stroke: '#1f2937' },
        'root_canal': { fill: '#ef4444', stroke: '#1f2937' },
        'implant': { fill: '#ef4444', stroke: '#1f2937' },
        'missing': { fill: '#d1d5db', stroke: '#4b5563' }
      };
      return map[status];
    }

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

    // Permitir que modos especiales actúen incluso si estamos en modo 'plan'
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

    // Si estamos en modo Plan, seleccionar diente para agregar al plan (panel derecho)
    if (planMode) {
      setSelectedTooth(toothId);
      setSelectedSector(null);
      return;
    }
    
    setSelectedTooth(toothId);
    setSelectedSector(null);
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

    // Toggle visual restoration marker
    const newConditions = toothConditions.map(tooth => {
      if (tooth.number === toothId) {
        const currentSectors = tooth.sectors || [];
        const existingSectorIndex = currentSectors.findIndex(s => s.sector === sector);

        let newSectors: ToothSector[];
        if (existingSectorIndex >= 0) {
          newSectors = currentSectors.map((s, index) => 
            index === existingSectorIndex 
              ? { ...s, hasRestoration: !s.hasRestoration }
              : s
          );
        } else {
          newSectors = [...currentSectors, { sector, hasRestoration: true }];
        }

        return { ...tooth, sectors: newSectors };
      }
      return tooth;
    });

    // Select tooth and sector so the detail panel shows procedures for that sector
    setSelectedTooth(toothId);
    setSelectedSector(sector);

    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const getSectorRestoration = (toothId: number, sector: ToothSector['sector']): boolean => {
    const tooth = toothConditions.find(t => t.number === toothId);
    const sectorData = tooth?.sectors?.find(s => s.sector === sector);
    return sectorData?.hasRestoration || false;
  };

  // Mapear sectores SVG a nombres de caras dentales con abreviatura
  const getFaceName = (toothNumber: number | null, sector: ToothSector['sector'] | null) => {
    if (!toothNumber || !sector) return '';
    const num = toothNumber;
    const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
    const lastDigit = num % 10;
    const isAnterior = [1, 2, 3].includes(lastDigit) || [61, 62, 63, 71, 72, 73].includes(num);

    switch (sector) {
      case 'left':
        return 'Mesial (M)';
      case 'right':
        return 'Distal (D)';
      case 'top':
        return 'Vestibular (V)';
      case 'bottom':
        return isUpper ? 'Palatina (P)' : 'Lingual (L)';
      case 'center':
        return isAnterior ? 'Incisal (I)' : 'Oclusal (O)';
      default:
        return sector;
    }
  };

  // Obtener inicial de un sector (según diente para diferenciar palatina/lingual y incisal/oclusal)
  const getSectorInitial = (toothNumber: number | null, sector: ToothSector['sector'] | null) => {
    if (!toothNumber || !sector) return '';
    const num = toothNumber;
    const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
    const lastDigit = num % 10;
    const isAnterior = [1, 2, 3].includes(lastDigit) || [61, 62, 63, 71, 72, 73].includes(num);

    switch (sector) {
      case 'left':
        return 'M'; // Mesial
      case 'right':
        return 'D'; // Distal
      case 'top':
        return 'V'; // Vestibular
      case 'bottom':
        return isUpper ? 'P' : 'L'; // Palatina (P) en superior, Lingual (L) en inferior
      case 'center':
        return isAnterior ? 'I' : 'O'; // Incisal o Oclusal
      default:
        return '';
    }
  };

  // Obtener las iniciales de las caras seleccionadas en un diente, unidas por guiones
  const getSelectedSectorsInitials = (toothNumber: number | null) => {
    if (!toothNumber) return '';
    const tooth = toothConditions.find(t => t.number === toothNumber);
    if (!tooth || !tooth.sectors || tooth.sectors.length === 0) return '';
    // Orden predecible para mostrar: Vestibular, Palatina/Lingual, Mesial, Distal, Centro
    const order: ToothSector['sector'][] = ['top', 'bottom', 'left', 'right', 'center'];
    const initials = order
      .filter(s => tooth.sectors!.some(ts => ts.sector === s && ts.hasRestoration))
      .map(s => getSectorInitial(toothNumber, s))
      .filter(Boolean);
    // Join with spaced hyphens for readability: "V - P - M"
    return initials.join(' - ');
  };

  // Deseleccionar sectores marcados en un diente (quitar restauraciones visuales)
  const clearSectorsFor = (toothNumber: number | null) => {
    if (!toothNumber) return;
    setToothConditions(prev => prev.map(t => t.number === toothNumber ? { ...t, sectors: [] } : t));
  };

  const getProceduresFor = (toothId: number | null, sector: ToothSector['sector'] | null) => {
    if (!toothId) return [] as any[];
    const tooth = toothConditions.find(t => t.number === toothId);
    if (!tooth) return [] as any[];
    const procs = (tooth.procedures || []) as any[];
    return sector ? procs.filter(p => p.sector === sector) : procs;
  };

  // Plan helpers
  const addPlanItem = (toothId: number | null, sector: ToothSector['sector'] | null) => {
    if (!toothId) return;
    if (!planProcedureName.trim()) return;

    const id = 'PL_' + new Date().toISOString().replace(/[^0-9]/g, '') + Math.floor(Math.random()*1000);
    // Determine surface value:
    // - If the tooth has multiple sector restorations, store their initials joined
    // - Else if a single sector was provided, use its initial
    // - Else null
    let surfaceValue: string | null = null;
    const tooth = toothConditions.find(t => t.number === toothId);
    if (tooth?.sectors && tooth.sectors.length > 0) {
      const selectedSectors = tooth.sectors.filter(s => s.hasRestoration).map(s => s.sector);
      if (selectedSectors.length > 1) {
        // multiple faces selected -> store joined initials
        const initials = getSelectedSectorsInitials(toothId);
        surfaceValue = initials || null;
      } else if (selectedSectors.length === 1) {
        // single face selected -> prefer explicit sector param if provided, else use selectedSectors[0]
        const single = sector || selectedSectors[0];
        surfaceValue = single || null;
      }
    } else {
      surfaceValue = sector || null;
    }

    const item = {
      id,
      tooth: String(toothId),
      surface: surfaceValue,
      procedure_code: planProcedureCode || undefined,
      procedure_name: planProcedureName.trim(),
      quantity: 1,
      notes: planNotes || undefined,
      planned_by: 'frontend',
      planned_at: new Date().toISOString(),
      status: 'planned'
    };
    setPlanItems(prev => [...prev, item]);
    setPlanProcedureCode('');
    setPlanProcedureName('');
    setPlanNotes('');
    // After adding an item, clear selection so other teeth become selectable
    setSelectedTooth(null);
    setSelectedSector(null);
  };

    // When adding from the inline panel we call addPlanItem directly

  const savePlanToServer = async () => {
    if (!planItems || !planItems.length) return;
    const container = document.querySelector('[data-medical-record-id]') as HTMLElement | null;
    const MR_ID = medicalRecordId || (container && container.dataset.medicalRecordId) || (window as any).__MEDICAL_RECORD_ID__;
    if (!MR_ID) {
      alert('medicalRecordId no definido. Pase `medicalRecordId` como prop al componente para guardar el plan.');
      return;
    }

    setSavingPlan(true);
    try {
      const res = await fetch(`/api/medical_records/${MR_ID}/odontogram/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Clinic-Id': (window as any).__CLINIC_ID__ || '',
          'X-Clinic-ID': (window as any).__CLINIC_ID__ || ''
        },
        body: JSON.stringify({ plan: planItems })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        alert('Plan guardado exitosamente');
        if (typeof onPlanChange === 'function') onPlanChange(planItems);
      } else {
        console.error('Error saving plan', json);
        alert('Error guardando plan');
      }
    } catch (e) {
      console.error(e);
      alert('Error guardando plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const executePlanItem = async (planId: string) => {
    const container = document.querySelector('[data-medical-record-id]') as HTMLElement | null;
    const MR_ID = medicalRecordId || (container && container.dataset.medicalRecordId) || (window as any).__MEDICAL_RECORD_ID__;
    if (!MR_ID) {
      alert('medicalRecordId no definido.');
      return;
    }
    setExecutingPlanId(planId);
    try {
      const res = await fetch(`/api/medical_records/${MR_ID}/odontogram/plan/${planId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Clinic-Id': (window as any).__CLINIC_ID__ || '',
          'X-Clinic-ID': (window as any).__CLINIC_ID__ || ''
        },
        body: JSON.stringify({ performed: { date: new Date().toISOString() } })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        // update local plan item status
        setPlanItems(prev => prev.map(p => p.id === planId ? { ...p, status: 'executed', executed_reference: json.data?.id || null } : p));
        alert('Plan item ejecutado');
      } else {
        console.error('Error executing plan', json);
        alert('Error ejecutando plan');
      }
    } catch (e) {
      console.error(e);
      alert('Error ejecutando plan');
    } finally {
      setExecutingPlanId(null);
    }
  };

  const openViewFor = (toothId: number, sector: ToothSector['sector'] | null) => {
    setSelectedTooth(toothId);
    setSelectedSector(sector);
    setShowViewModal(true);
  };

  // Add a procedure entry for a tooth (and optional sector)
  const addProcedure = (toothId: number, sector: ToothSector['sector'] | null, date: string, procedure: string, notes?: string) => {
    const newConditions = toothConditions.map(tooth => {
      if (tooth.number === toothId) {
        const procedures = tooth.procedures || [];
        const newProc = { date, procedure, sector: sector || undefined, notes } as any;
        return { ...tooth, procedures: [...procedures, newProc] };
      }
      return tooth;
    });

    setToothConditions(newConditions);
    onUpdate(newConditions);
  };

  const handleCrownClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !crownMode) return;
    
    // No permitir coronas en dientes ausentes
    const tooth = toothConditions.find(t => t.number === toothId);
    if (tooth?.status === 'missing') return;
    
    event.preventDefault();
    event.stopPropagation();
    const newConditions = toothConditions.map(t => {
      if (t.number !== toothId) return t;
      const turningOn = !t.hasCrown;
      // If turning on crown, remove prosthesis and any sector restorations and clear extraction
      if (turningOn) {
        return { ...t, hasCrown: true, hasProsthesis: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
      }
      // Turning off crown: just remove crown
      return { ...t, hasCrown: false };
    });
    const toothBefore = toothConditions.find(t => t.number === toothId);
    const wasCrown = toothBefore?.hasCrown || false;
    const nowTurningOn = !wasCrown;
    setToothConditions(newConditions);
    onUpdate(newConditions);
    if (nowTurningOn) setSelectedSector(null);
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
    const newConditions = toothConditions.map(t => {
      if (t.number !== toothId) return t;
      const turningOn = !t.hasProsthesis;
      if (turningOn) {
        return { ...t, hasProsthesis: true, hasCrown: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
      }
      return { ...t, hasProsthesis: false };
    });
    const toothBefore = toothConditions.find(t => t.number === toothId);
    const wasProst = toothBefore?.hasProsthesis || false;
    const nowTurningOn = !wasProst;
    setToothConditions(newConditions);
    onUpdate(newConditions);
    if (nowTurningOn) setSelectedSector(null);
  };

  const getToothProsthesis = (toothId: number): boolean => {
    const tooth = toothConditions.find(t => t.number === toothId);
    return tooth?.hasProsthesis || false;
  };

  const handleExtractionClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !extractionMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    const newConditions = toothConditions.map(t => {
      if (t.number !== toothId) return t;
      const turningOn = t.status !== 'extraction';
      if (turningOn) {
        // Apply extraction: clear crowns, prostheses and sector restorations
        return { ...t, status: 'extraction', hasCrown: false, hasProsthesis: false, sectors: [] };
      }
      // Toggle off extraction -> healthy
      return { ...t, status: 'healthy' } as any;
    });
    const toothBefore = toothConditions.find(t => t.number === toothId);
    const wasExtraction = toothBefore?.status === 'extraction';
    const nowTurningOn = !wasExtraction;
    setToothConditions(newConditions);
    onUpdate(newConditions);
    if (nowTurningOn) setSelectedSector(null);
  };

  const getToothCondition = (toothId: number) => {
    return toothConditions.find(t => t.number === toothId)?.status || 'healthy';
  };

  // Componente de diente
  const Tooth = ({ number, position, labelPosition = 'top' }: { number: number, position: { x: number, y: number }, labelPosition?: 'top' | 'bottom' }) => {
    const condition = getToothCondition(number);
    const isSelected = selectedTooth === number;
    const isDisabled = selectedTooth !== null && selectedTooth !== number;
    
    // Calcular posición del texto basado en labelPosition
    const textY = labelPosition === 'top' ? position.y - 5 : position.y + 44 + 15;
    
    const toothColor = getToothColor(condition as any);

    return (
      <g>
        {/* Número del diente */}
        <text
          x={position.x + 22}
          y={textY}
          textAnchor="middle"
          fill={printMode ? '#1e3a8a' : undefined}
          style={printMode ? { fontSize: '12px', fontWeight: 500, pointerEvents: 'none' } as any : undefined}
        >
          {number}
        </text>
        
        {/* Cuadrado exterior */}
        <rect
          x={position.x}
          y={position.y}
          width="44"
          height="44"
          fill={printMode ? (toothColor as any).fill : undefined}
          stroke={printMode ? (toothColor as any).stroke : undefined}
          strokeWidth={isSelected ? 4 : 2}
          style={printMode ? { cursor: condition !== 'missing' ? 'pointer' : 'not-allowed', opacity: condition === 'missing' ? 0.6 : 1 } as any : undefined}
          className={!printMode ? `${getToothColor(condition as any)} ${isSelected ? 'stroke-4 stroke-blue-600' : 'stroke-2'} ${condition !== 'missing' ? (isDisabled ? 'cursor-default pointer-events-none opacity-60' : 'cursor-pointer hover:opacity-80') : 'cursor-not-allowed opacity-60'} transition-all` : undefined}
          onClick={(e) => condition !== 'missing' && !isDisabled ? handleToothClick(number, e) : e.preventDefault()}
        />
        
        {/* Sectores clickeables para restauraciones */}
        {sectorMode && !readOnly && condition !== 'missing' && (
          <>
            {/* Sector superior */}
            <polygon
              points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y} ${position.x},${position.y}`}
              fill={getSectorRestoration(number, 'top') ? sectorColor : 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'top', e); }}
            >
              <title>{getFaceName(number, 'top')}</title>
            </polygon>
            
            {/* Sector inferior */}
            <polygon
              points={`${position.x + 11},${position.y + 33} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44} ${position.x},${position.y + 44}`}
              fill={getSectorRestoration(number, 'bottom') ? sectorColor : 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'bottom', e); }}
            >
              <title>{getFaceName(number, 'bottom')}</title>
            </polygon>
            
            {/* Sector izquierdo */}
            <polygon
              points={`${position.x},${position.y} ${position.x + 11},${position.y + 11} ${position.x + 11},${position.y + 33} ${position.x},${position.y + 44}`}
              fill={getSectorRestoration(number, 'left') ? sectorColor : 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'left', e); }}
            >
              <title>{getFaceName(number, 'left')}</title>
            </polygon>
            
            {/* Sector derecho */}
            <polygon
              points={`${position.x + 44},${position.y} ${position.x + 33},${position.y + 11} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44}`}
              fill={getSectorRestoration(number, 'right') ? sectorColor : 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'right', e); }}
            >
              <title>{getFaceName(number, 'right')}</title>
            </polygon>
            
            {/* Sector centro */}
            <rect
              x={position.x + 11}
              y={position.y + 11}
              width="22"
              height="22"
              fill={getSectorRestoration(number, 'center') ? sectorColor : 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'center', e); }}
            >
              <title>{getFaceName(number, 'center')}</title>
            </rect>
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
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'top')}
              >
                <title>{getFaceName(number, 'top')}</title>
              </polygon>
            )}
            {getSectorRestoration(number, 'bottom') && (
              <polygon
                points={`${position.x + 11},${position.y + 33} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44} ${position.x},${position.y + 44}`}
                fill={sectorColor}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'bottom')}
              >
                <title>{getFaceName(number, 'bottom')}</title>
              </polygon>
            )}
            {getSectorRestoration(number, 'left') && (
              <polygon
                points={`${position.x},${position.y} ${position.x + 11},${position.y + 11} ${position.x + 11},${position.y + 33} ${position.x},${position.y + 44}`}
                fill={sectorColor}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'left')}
              >
                <title>{getFaceName(number, 'left')}</title>
              </polygon>
            )}
            {getSectorRestoration(number, 'right') && (
              <polygon
                points={`${position.x + 44},${position.y} ${position.x + 33},${position.y + 11} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44}`}
                fill={sectorColor}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'right')}
              >
                <title>{getFaceName(number, 'right')}</title>
              </polygon>
            )}
            {getSectorRestoration(number, 'center') && (
              <rect
                x={position.x + 11}
                y={position.y + 11}
                width="22"
                height="22"
                fill={sectorColor}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'center')}
              >
                <title>{getFaceName(number, 'center')}</title>
              </rect>
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
    <div className={className}>
      <div className={showLegend ? "mb-6" : "m-0"}>
        
        {/* Referencias de Simbología (Read-only) */}
        {readOnly && showLegend && (
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
                    const newCrown = !crownMode;
                    setSectorMode(false);
                    setProsthesisMode(false);
                    setExtractionMode(false);
                    setCrownMode(newCrown);
                    if (newCrown && selectedTooth) { clearSectorsFor(selectedTooth); setSelectedSector(null); }
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
                    const newProst = !prosthesisMode;
                    setSectorMode(false);
                    setCrownMode(false);
                    setExtractionMode(false);
                    setProsthesisMode(newProst);
                    if (newProst && selectedTooth) { clearSectorsFor(selectedTooth); setSelectedSector(null); }
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
                    const newExt = !extractionMode;
                    setSectorMode(false);
                    setCrownMode(false);
                    setProsthesisMode(false);
                    setExtractionMode(newExt);
                    if (newExt && selectedTooth) { clearSectorsFor(selectedTooth); setSelectedSector(null); }
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

              {/* Control segmentado: Ficha Catastral <-> Realizar prestaciones */}
              <div className="inline-flex rounded-lg bg-gray-100 p-1" role="tablist" aria-label="Modo">
                <button
                  role="tab"
                  aria-selected={planMode}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlanMode(true); setSectorMode(false); setCrownMode(false); setProsthesisMode(false); setExtractionMode(false); }}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition ${planMode ? 'bg-amber-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  Ficha Catastral
                </button>
                <button
                  role="tab"
                  aria-selected={!planMode}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlanMode(false); }}
                  className={`ml-1 px-3 py-1.5 text-sm rounded-md font-medium transition ${!planMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  Realizar prestaciones
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Odontograma SVG */}
      <div className={`flex ${showLegend ? 'mb-6' : 'm-0'} gap-6`}> 
        <div className="flex-1 flex justify-center">
          <svg viewBox="0 60 900 280" className={`w-full h-auto max-w-[900px] bg-white ${showBorder ? 'border border-gray-300 rounded' : 'm-0 p-0'}`}>

          {/* DIENTES PERMANENTES SUPERIORES */}
          {/* Fila superior izquierda (18-11) */}
          {[18, 17, 16, 15, 14, 13, 12, 11].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 60 + (index * 50), y: 80 }}
              labelPosition="top"
            />
          ))}

          {/* Fila superior derecha (21-28) */}
          {[21, 22, 23, 24, 25, 26, 27, 28].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 480 + (index * 50), y: 80 }}
              labelPosition="top"
            />
          ))}

          {/* DIENTES PERMANENTES INFERIORES */}
          {/* Fila inferior izquierda (48-41) */}
          {[48, 47, 46, 45, 44, 43, 42, 41].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 60 + (index * 50), y: 140 }}
              labelPosition="bottom"
            />
          ))}

          {/* Fila inferior derecha (31-38) */}
          {[31, 32, 33, 34, 35, 36, 37, 38].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 480 + (index * 50), y: 140 }}
              labelPosition="bottom"
            />
          ))}

          {/* DIENTES TEMPORALES (DE LECHE) SUPERIORES */}
          {/* Fila temporal superior izquierda (55-51) */}
          {[55, 54, 53, 52, 51].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 210 + (index * 50), y: 220 }}
              labelPosition="top"
            />
          ))}

          {/* Fila temporal superior derecha (61-65) */}
          {[61, 62, 63, 64, 65].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 480 + (index * 50), y: 220 }}
              labelPosition="top"
            />
          ))}

          {/* DIENTES TEMPORALES (DE LECHE) INFERIORES */}
          {/* Fila temporal inferior izquierda (85-81) */}
          {[85, 84, 83, 82, 81].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 210 + (index * 50), y: 280 }}
              labelPosition="bottom"
            />
          ))}

          {/* Fila temporal inferior derecha (71-75) */}
          {[71, 72, 73, 74, 75].map((tooth, index) => (
            <Tooth
              key={tooth}
              number={tooth}
              position={{ x: 480 + (index * 50), y: 280 }}
              labelPosition="bottom"
            />
          ))}
        </svg>
        </div>

        {planMode && (
          <aside className="w-80 bg-yellow-50 border border-amber-200 rounded-lg p-4 h-[360px] overflow-y-auto">
            <h5 className="text-sm font-semibold text-amber-800 mb-3">Plan de Tratamiento</h5>

            <div className="text-sm text-gray-700 mb-2">Diente seleccionado: <span className="font-medium">{selectedTooth || '-'}</span> {selectedTooth ? <span>· {getSelectedSectorsInitials(selectedTooth) || (selectedSector ? getSectorInitial(selectedTooth, selectedSector) : '')}</span> : ''}</div>

            <div className="space-y-2 mb-3">
              <input type="text" placeholder="Código (opcional)" value={planProcedureCode} onChange={(e) => setPlanProcedureCode(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              <div className="relative">
                <button type="button" onClick={() => setShowProcedureDropdown(v => !v)} className="w-full px-3 py-2 border rounded-md text-left flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {planProcedureName === 'Restauración' && <div className="w-4 h-4 bg-red-500 rounded" />}
                    {planProcedureName === 'Corona' && <div className="w-4 h-4 border-2 border-blue-500 rounded-full" />}
                    {planProcedureName === 'Prótesis' && <div className="w-4 h-4 border-t-2 border-b-2 border-green-400" />}
                    {planProcedureName === 'Extracción' && <div className="w-4 h-4 text-red-600 font-bold">✕</div>}
                    <span>{planProcedureName || 'Seleccione procedimiento'}</span>
                  </div>
                  <span className="text-gray-500">▾</span>
                </button>
                {showProcedureDropdown && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-md shadow-sm">
                    <button type="button" onClick={() => { setPlanProcedureName('Restauración'); setSectorMode(true); setCrownMode(false); setProsthesisMode(false); setExtractionMode(false); if (selectedTooth) { /* leave selectedSector as-is for sector mode */ } setShowProcedureDropdown(false); }} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50"> 
                      <div className="w-4 h-4 bg-red-500 rounded" />
                      <span>Restauración</span>
                    </button>
                    <button type="button" onClick={() => { setPlanProcedureName('Corona'); setSectorMode(false); setCrownMode(true); setProsthesisMode(false); setExtractionMode(false); if (selectedTooth) { clearSectorsFor(selectedTooth); setSelectedSector(null); } setShowProcedureDropdown(false); }} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50"> 
                      <div className="w-4 h-4 border-2 border-blue-500 rounded-full" />
                      <span>Corona</span>
                    </button>
                    <button type="button" onClick={() => { setPlanProcedureName('Prótesis'); setSectorMode(false); setCrownMode(false); setProsthesisMode(true); setExtractionMode(false); if (selectedTooth) { clearSectorsFor(selectedTooth); setSelectedSector(null); } setShowProcedureDropdown(false); }} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50"> 
                      <div className="w-4 h-4 border-t-2 border-b-2 border-green-400" />
                      <span>Prótesis</span>
                    </button>
                    <button type="button" onClick={() => { setPlanProcedureName('Extracción'); setSectorMode(false); setCrownMode(false); setProsthesisMode(false); setExtractionMode(true); if (selectedTooth) { clearSectorsFor(selectedTooth); setSelectedSector(null); } setShowProcedureDropdown(false); }} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50"> 
                      <div className="w-4 h-4 text-red-600 font-bold">✕</div>
                      <span>Extracción</span>
                    </button>
                  </div>
                )}
              </div>
              {/* cantidad y precio estimado eliminados del formulario por petición */}
              <textarea placeholder="Notas (opcional)" value={planNotes} onChange={(e) => setPlanNotes(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button type="button" onClick={() => {
                if (!selectedTooth) { alert('Seleccione un diente antes de agregar al plan.'); return; }
                addPlanItem(selectedTooth, selectedSector);
              }} className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">Agregar</button>
              <button type="button" onClick={() => { setSelectedTooth(null); setSelectedSector(null); }} className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Deseleccionar</button>
              
            </div>

            {/* Plan items are shown in the diagnosis table; removed from inline panel */}
          </aside>
        )}
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

      {/* Modal de solo lectura: mostrar procedimientos al clicar una cara */}
      {showViewModal && selectedTooth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setShowViewModal(false); setSelectedTooth(null); setSelectedSector(null); }} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full p-4 z-10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Procedimientos del Diente {selectedTooth}{selectedSector ? ` — ${getFaceName(selectedTooth, selectedSector)}` : ''}{selectedTooth ? (getSelectedSectorsInitials(selectedTooth) ? ` · ${getSelectedSectorsInitials(selectedTooth)}` : (selectedSector ? ` · ${getSectorInitial(selectedTooth, selectedSector)}` : '')) : ''}</h4>
              <button onClick={() => setShowViewModal(false)} className="text-sm text-gray-600">Cerrar</button>
            </div>

            <div>
              {(() => {
                const procs = getProceduresFor(selectedTooth, selectedSector);
                if (procs.length === 0) return <div className="text-gray-500">No hay procedimientos registrados.</div>;
                return (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm bg-white border border-gray-100 rounded">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-3 py-2 border-b">Fecha</th>
                          <th className="px-3 py-2 border-b">Procedimiento</th>
                          <th className="px-3 py-2 border-b">Sector</th>
                          <th className="px-3 py-2 border-b">Realizado por</th>
                          <th className="px-3 py-2 border-b">Notas</th>
                          <th className="px-3 py-2 border-b">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {procs.map((p, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 align-top">{p.date}</td>
                            <td className="px-3 py-2 align-top">{p.procedure}</td>
                            <td className="px-3 py-2 align-top">{p.sector || '-'}</td>
                            <td className="px-3 py-2 align-top">{p.performedBy || '-'}</td>
                            <td className="px-3 py-2 align-top">{p.notes ? (p.notes.length > 100 ? p.notes.slice(0,100)+'…' : p.notes) : '-'}</td>
                            <td className="px-3 py-2 align-top">
                              <button
                                onClick={() => { setSelectedProcedure(p); setShowDetailModal(true); }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                              >Ver</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedProcedure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setShowDetailModal(false); setSelectedProcedure(null); }} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-4 z-10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Detalle del Procedimiento</h4>
              <button onClick={() => { setShowDetailModal(false); setSelectedProcedure(null); }} className="text-sm text-gray-600">Cerrar</button>
            </div>

            <div className="space-y-2 text-sm">
              <div><strong>Procedimiento:</strong> {selectedProcedure.procedure}</div>
              <div><strong>Fecha:</strong> {selectedProcedure.date}</div>
              <div><strong>Diente:</strong> {selectedProcedure.tooth || selectedTooth}</div>
              <div><strong>Sector:</strong> {selectedProcedure.sector || '-'}</div>
              <div><strong>Realizado por:</strong> {selectedProcedure.performedBy || '-'}</div>
              {selectedProcedure.quantity && <div><strong>Cantidad:</strong> {selectedProcedure.quantity}</div>}
              {selectedProcedure.estimated_price && <div><strong>Precio estimado:</strong> {selectedProcedure.estimated_price}</div>}
              {selectedProcedure.notes && <div><strong>Notas:</strong><div className="mt-1 text-gray-700">{selectedProcedure.notes}</div></div>}
            </div>
          </div>
        </div>
      )}

      {/* Modal removed: plan is added via the right-side inline panel */}

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
      {/* Panel de detalles y procedimientos por diente/sector */}
      {!readOnly && selectedTooth && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Detalles del Diente {selectedTooth}{selectedSector ? ` — ${getFaceName(selectedTooth, selectedSector)}` : ''}{selectedTooth ? (getSelectedSectorsInitials(selectedTooth) ? ` · ${getSelectedSectorsInitials(selectedTooth)}` : (selectedSector ? ` · ${getSectorInitial(selectedTooth, selectedSector)}` : '')) : ''}</h4>
            <div className="text-sm text-gray-500">Seleccione sector en el odontograma para filtrar</div>
          </div>

          {/* Lista de procedimientos existentes */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Procedimientos</h5>
            {(() => {
              const tooth = toothConditions.find(t => t.number === selectedTooth);
              const procs = (tooth?.procedures || []).filter(p => selectedSector ? p.sector === selectedSector : true);
              if (procs.length === 0) return <div className="text-gray-500">No hay procedimientos registrados.</div>;
              return (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm bg-white border border-gray-100 rounded">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-3 py-2 border-b">Fecha</th>
                        <th className="px-3 py-2 border-b">Procedimiento</th>
                        <th className="px-3 py-2 border-b">Sector</th>
                        <th className="px-3 py-2 border-b">Realizado por</th>
                        <th className="px-3 py-2 border-b">Notas</th>
                        <th className="px-3 py-2 border-b">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {procs.map((p, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 align-top">{p.date}</td>
                          <td className="px-3 py-2 align-top">{p.procedure}</td>
                          <td className="px-3 py-2 align-top">{p.sector || '-'}</td>
                          <td className="px-3 py-2 align-top">{p.performedBy || '-'}</td>
                          <td className="px-3 py-2 align-top">{p.notes ? (p.notes.length > 80 ? p.notes.slice(0,80)+'…' : p.notes) : '-'}</td>
                          <td className="px-3 py-2 align-top">
                            <button
                              onClick={() => { setSelectedProcedure(p); setShowDetailModal(true); }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                            >Ver</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Formulario para agregar procedimiento */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Agregar Procedimiento</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="date" value={newProcedureDate} onChange={(e) => setNewProcedureDate(e.target.value)} className="px-3 py-2 border rounded-md" />
              <input type="text" placeholder="Descripción del procedimiento" value={newProcedureText} onChange={(e) => setNewProcedureText(e.target.value)} className="px-3 py-2 border rounded-md md:col-span-2" />
              <input type="text" placeholder="Notas (opcional)" value={newProcedureNotes} onChange={(e) => setNewProcedureNotes(e.target.value)} className="px-3 py-2 border rounded-md md:col-span-3" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!newProcedureText.trim()) return;
                  addProcedure(selectedTooth, selectedSector, newProcedureDate, newProcedureText.trim(), newProcedureNotes.trim() || undefined);
                  setNewProcedureText('');
                  setNewProcedureNotes('');
                  setNewProcedureDate(new Date().toISOString().split('T')[0]);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={() => { setSelectedTooth(null); setSelectedSector(null); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Plan mode UI removed: plan items are added exclusively via modal */}
        </div>
      )}
    </div>
  );
}