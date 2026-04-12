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
  registerEditHandler?: (fn: (proc: any) => void) => void;
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
  initialPlan,
  registerEditHandler
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

  // Estado separado para planificaciones visuales (no alteran el estado clínico)
  const [plannedToothConditions, setPlannedToothConditions] = useState<ToothCondition[]>(() => {
    return toothConditions.map(t => ({ ...t, sectors: t.sectors ? [...t.sectors] : [] }));
  });

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedSector, setSelectedSector] = useState<ToothSector['sector'] | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ToothCondition['status']>('healthy');
  const [newProcedureDate, setNewProcedureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newProcedureText, setNewProcedureText] = useState<string>('');
  const [newProcedureNotes, setNewProcedureNotes] = useState<string>('');
  const [editingProcId, setEditingProcId] = useState<string | null>(null);
  const [sectorMode, setSectorMode] = useState<boolean>(false);
  const [crownMode, setCrownMode] = useState<boolean>(false);
  const [prosthesisMode, setProsthesisMode] = useState<boolean>(false);
  const [extractionMode, setExtractionMode] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedProcedure, setSelectedProcedure] = useState<any | null>(null);
  
  // Plan mode state
  const [planMode, setPlanMode] = useState<boolean>(true);
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
    if (!initialPlan || !Array.isArray(initialPlan) || initialPlan.length === 0) return;

    setPlanItems(prev => {
      // Case 1: local plan is empty — initialize from parent.
      if (prev.length === 0) return initialPlan;

      // Case 2: sync status changes from parent for existing items
      // (e.g. parent sets 'en_proceso' after user clicks "Realizar Prestación").
      const hasStatusChange = initialPlan.some(extItem => {
        const loc = prev.find(li => li.id && li.id === extItem.id);
        return loc && loc.status !== extItem.status;
      });
      if (!hasStatusChange) return prev; // nothing to do — avoid unnecessary re-render

      return prev.map(localItem => {
        const extItem = initialPlan.find((ei: any) => ei.id && ei.id === localItem.id);
        if (extItem && extItem.status !== localItem.status) {
          return { ...localItem, status: extItem.status };
        }
        return localItem;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPlan]);

  // If parent wants to register an external edit handler, provide a function
  useEffect(() => {
    if (typeof registerEditHandler === 'function') {
      registerEditHandler((proc: any) => {
        if (!proc) return;
        // proc should contain tooth, sector, date, procedure, notes, id
        const toothNum = proc.tooth || (proc.tooth && Number(proc.tooth)) || null;
        setSelectedTooth(toothNum);
        setSelectedSector(proc.sector || null);
        setNewProcedureDate(proc.date ? new Date(proc.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setNewProcedureText(proc.procedure || proc.procedure_name || '');
        setNewProcedureNotes(proc.notes || proc.notas || '');
        // Sync with plan-oriented inputs used by the main Add button
        setPlanProcedureName(proc.procedure || proc.procedure_name || '');
        setPlanNotes(proc.notes || proc.notas || '');
        setPlanProcedureCode(proc.procedure_code || proc.code || '');
        setEditingProcId(proc.id || proc.procId || null);
        
        // Update odontogram visual state based on procedure type
        if (toothNum) {
          const procedureName = (proc.procedure || proc.procedure_name || '').toLowerCase();
          
          if (proc.mode === 'perform') {
            // Switch to 'realizar prestaciones' mode
            setPlanMode(false);
          }
          
          // Set the appropriate mode flags and update tooth conditions
          if (procedureName.includes('restauración') || procedureName.includes('restauracion')) {
            setSectorMode(true);
            setCrownMode(false);
            setProsthesisMode(false);
            setExtractionMode(false);
            // Update tooth conditions to show restoration sectors
            if (proc.sector) {
              const sectorInitials = String(proc.sector).replace(/\s+/g, '').split('-');
              const sectors: ToothSector[] = sectorInitials.map(initial => {
                switch(initial) {
                  case 'V': return { sector: 'top', hasRestoration: true };
                  case 'P': 
                  case 'L': return { sector: 'bottom', hasRestoration: true };
                  case 'M': return { sector: 'left', hasRestoration: true };
                  case 'D': return { sector: 'right', hasRestoration: true };
                  case 'I': 
                  case 'O': return { sector: 'center', hasRestoration: true };
                  default: return undefined;
                }
              }).filter((s): s is ToothSector => s !== undefined);
              
              if (proc.mode === 'perform') {
                // For 'realizar prestaciones', update actual tooth conditions
                const newConditions = toothConditions.map(t => 
                  t.number === toothNum 
                    ? { ...t, sectors: sectors || [] }
                    : t
                );
                setToothConditions(newConditions);
                onUpdate(newConditions);
              } else {
                // For 'ficha catastral', update planned tooth conditions
                setPlannedToothConditions(prev => prev.map(t => 
                  t.number === toothNum 
                    ? { ...t, sectors: sectors || [] }
                    : t
                ));
              }
            }
          } else if (procedureName.includes('corona')) {
            setSectorMode(false);
            setCrownMode(true);
            setProsthesisMode(false);
            setExtractionMode(false);
            // Update tooth conditions to show crown
            if (proc.mode === 'perform') {
              const newConditions = toothConditions.map(t => 
                t.number === toothNum 
                  ? { ...t, hasCrown: true, hasProsthesis: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status }
                  : t
              );
              setToothConditions(newConditions);
              onUpdate(newConditions);
            } else {
              setPlannedToothConditions(prev => prev.map(t => 
                t.number === toothNum 
                  ? { ...t, hasCrown: true, hasProsthesis: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status }
                  : t
              ));
            }
          } else if (procedureName.includes('prótesis') || procedureName.includes('protesis')) {
            setSectorMode(false);
            setCrownMode(false);
            setProsthesisMode(true);
            setExtractionMode(false);
            // Update tooth conditions to show prosthesis
            if (proc.mode === 'perform') {
              const newConditions = toothConditions.map(t => 
                t.number === toothNum 
                  ? { ...t, hasCrown: false, hasProsthesis: true, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status }
                  : t
              );
              setToothConditions(newConditions);
              onUpdate(newConditions);
            } else {
              setPlannedToothConditions(prev => prev.map(t => 
                t.number === toothNum 
                  ? { ...t, hasCrown: false, hasProsthesis: true, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status }
                  : t
              ));
            }
          } else if (procedureName.includes('extracción') || procedureName.includes('extraccion')) {
            setSectorMode(false);
            setCrownMode(false);
            setProsthesisMode(false);
            setExtractionMode(true);
            // Update tooth conditions to show extraction
            if (proc.mode === 'perform') {
              const newConditions = toothConditions.map(t => 
                t.number === toothNum 
                  ? { ...t, hasCrown: false, hasProsthesis: false, sectors: [], status: 'extraction' as const }
                  : t
              );
              setToothConditions(newConditions);
              onUpdate(newConditions);
            } else {
              setPlannedToothConditions(prev => prev.map(t => 
                t.number === toothNum 
                  ? { ...t, hasCrown: false, hasProsthesis: false, sectors: [], status: 'extraction' as const }
                  : t
              ));
            }
          }
        }
      });
    }
  }, [registerEditHandler]);

  // Plan items derived sets
  const allPlannedItems = planItems || [];
  const sessionPlannedItems = (planItems || []).filter(p => p.planned_by === 'frontend' || (p.planned_at && (Date.now() - new Date(p.planned_at).getTime()) < 24 * 60 * 60 * 1000));

  const isPlannedOn = (toothNumber: number, sector: ToothSector['sector'], useAll: boolean) => {
    const items = useAll ? allPlannedItems : sessionPlannedItems;
    if (!items || items.length === 0) return false;
    return items.some(item => {
      const toothMatch = String(item.tooth) === String(toothNumber) || item.pieza === String(toothNumber) || item.pieza === toothNumber;
      if (!toothMatch) return false;
      const surface = item.surface || item.sector;
      if (!surface) return true; // whole-tooth planning
      if (typeof surface === 'string') {
        // Accept initials like 'V - P - M' or keys like 'top'
        const normalized = surface.replace(/\s+/g, '');
        if (/^[A-Z](?:-[A-Z])*$/.test(normalized)) {
          const initials = normalized.split('-');
          const secInitial = getSectorInitial(toothNumber, sector);
          return initials.includes(secInitial);
        }
        // try mapping known sector keys
        if (String(surface).toLowerCase() === String(sector).toLowerCase()) return true;
      }
      return false;
    });
  };

  // Helper to pick active conditions according to planMode
  const getActiveConditions = () => (planMode ? plannedToothConditions : toothConditions);


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
    // If the selected tooth already has a performed procedure, load it into form for editing
    const tooth = toothConditions.find(t => t.number === toothId);
    if (tooth && tooth.procedures && tooth.procedures.length > 0) {
      const lastProc = tooth.procedures[tooth.procedures.length - 1];
      setNewProcedureDate(lastProc.date ? new Date(lastProc.date).toISOString().split('T')[0] : newProcedureDate);
      setNewProcedureText(lastProc.procedure || '');
      setNewProcedureNotes(lastProc.notes  || '');
      // Also populate the plan-oriented fields so the main Add button shows correct values
      setPlanProcedureName(lastProc.procedure || '');
      setPlanNotes(lastProc.notes || '');
      setPlanProcedureCode(lastProc?.procedure_code ?? lastProc?.code ?? '');
      setSelectedSector(lastProc?.sector ?? null);
      setEditingProcId(lastProc?.id ? String(lastProc.id) : (lastProc?.procId ? String(lastProc.procId) : null));
    } else {
      const newConditions = toothConditions.map(tooth => 
        tooth.number === toothId 
          ? { ...tooth, status: selectedStatus }
          : tooth
      );
      setToothConditions(newConditions);
      onUpdate(newConditions);
    }
  };

  const handleSectorClick = (toothId: number, sector: ToothSector['sector'], event: React.MouseEvent) => {
    if (readOnly || !sectorMode) return;
    
    // No permitir sectores en dientes ausentes
    const tooth = toothConditions.find(t => t.number === toothId);
    if (tooth?.status === 'missing') return;
    
    event.preventDefault();
    event.stopPropagation();

    // Toggle visual restoration marker on the active conditions (planned vs clinical)
    if (planMode) {
      setPlannedToothConditions(prev => prev.map(tooth => {
        if (tooth.number === toothId) {
          const currentSectors = tooth.sectors || [];
          const existingSectorIndex = currentSectors.findIndex(s => s.sector === sector);
          let newSectors: ToothSector[];
          if (existingSectorIndex >= 0) {
            newSectors = currentSectors.map((s, index) => index === existingSectorIndex ? { ...s, hasRestoration: !s.hasRestoration } : s);
          } else {
            newSectors = [...currentSectors, { sector, hasRestoration: true }];
          }
          return { ...tooth, sectors: newSectors };
        }
        return tooth;
      }));
      setSelectedTooth(toothId);
      setSelectedSector(sector);
    } else {
      const newConditions = toothConditions.map(tooth => {
        if (tooth.number === toothId) {
          const currentSectors = tooth.sectors || [];
          const existingSectorIndex = currentSectors.findIndex(s => s.sector === sector);
          let newSectors: ToothSector[];
          if (existingSectorIndex >= 0) {
            newSectors = currentSectors.map((s, index) => index === existingSectorIndex ? { ...s, hasRestoration: !s.hasRestoration } : s);
          } else {
            newSectors = [...currentSectors, { sector, hasRestoration: true }];
          }
          return { ...tooth, sectors: newSectors };
        }
        return tooth;
      });
      setSelectedTooth(toothId);
      setSelectedSector(sector);
      setToothConditions(newConditions);
      onUpdate(newConditions);
    }
  };

  const getSectorRestoration = (toothId: number, sector: ToothSector['sector']): boolean => {
    const active = getActiveConditions();
    const tooth = active.find(t => t.number === toothId);
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
      case 'topUpper':
      case 'topLower':
        return 'Vestibular (V)';
      case 'centerMesial':
        return isAnterior ? 'Incisal mesial (IM)' : 'Oclusal mesial (OM)';
      case 'centerDistal':
        return isAnterior ? 'Incisal distal (ID)' : 'Oclusal distal (OD)';
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
    const active = getActiveConditions();
    const tooth = active.find(t => t.number === toothNumber);
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
    if (planMode) {
      setPlannedToothConditions(prev => prev.map(t => t.number === toothNumber ? { ...t, sectors: [] } : t));
    } else {
      setToothConditions(prev => prev.map(t => t.number === toothNumber ? { ...t, sectors: [] } : t));
    }
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
    console.log('addPlanItem called', { toothId, sector, planProcedureName, planMode });
    if (!toothId) return;
    if (!planProcedureName.trim()) return;
    
    // Only allow adding plan items when in plan mode, not when performing procedures
    if (!planMode) {
      console.log('🚫 addPlanItem blocked - not in plan mode');
      return;
    }

    const id = 'PL_' + new Date().toISOString().replace(/[^0-9]/g, '') + Math.floor(Math.random()*1000);
    // Determine surface value:
    // - If the tooth has multiple sector restorations, store their initials joined
    // - Else if a single sector was provided, use its initial
    // - Else null
    let surfaceValue: string | null = null;
    const tooth = plannedToothConditions.find(t => t.number === toothId) || toothConditions.find(t => t.number === toothId);
    if (tooth?.sectors && tooth.sectors.length > 0) {
      const selectedSectors = tooth.sectors.filter(s => s.hasRestoration).map(s => s.sector);
      if (selectedSectors.length > 1) {
        // multiple faces selected -> store joined initials
        const initials = getSelectedSectorsInitials(toothId);
        surfaceValue = initials || null;
      } else if (selectedSectors.length === 1) {
        // single face selected -> store its initial
        const initial = getSectorInitial(toothId, selectedSectors[0]);
        surfaceValue = initial || null;
      }
    } else if (sector) {
      // use provided sector's initial
      surfaceValue = getSectorInitial(toothId, sector);
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
    console.log('🔴 CREATING NEW PLAN ITEM - addPlanItem called!', { 
      caller: new Error().stack, 
      item, 
      planMode, 
      selectedTooth, 
      planProcedureName 
    });
    setPlanItems(prev => {
      console.log('Before adding plan item:', prev);
      const updated = [...prev, item];
      console.log('After adding plan item:', updated);
      return updated;
    });
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
    // Normalize incoming date to YYYY-MM-DD for comparison
    const normalizedDate = date ? new Date(date).toISOString().split('T')[0] : null;

    const newConditions = toothConditions.map(tooth => {
      if (tooth.number === toothId) {
        const procedures = tooth.procedures || [];

        // If we're editing an existing procedure, update it in place
        if (editingProcId) {
          const foundIndex = procedures.findIndex((p: any) => p.id === editingProcId || p.procId === editingProcId);
          if (foundIndex >= 0) {
            const updated = procedures.slice();
            const existing = updated[foundIndex] || {};
            updated[foundIndex] = { ...existing, date, procedure, sector: sector || undefined, notes, procedure_code: planProcedureCode || existing.procedure_code || existing.code || undefined };
            // clear editing state after update
            setEditingProcId(null);
            setNewProcedureText('');
            setNewProcedureNotes('');
            setNewProcedureDate(new Date().toISOString().split('T')[0]);
            setPlanProcedureCode('');
            return { ...tooth, procedures: updated };
          }
          // if editingProcId not found on this tooth, fallthrough to adding as new
        }

        // Prevent adding more than one procedure on the same tooth for the same day
        if (normalizedDate) {
          const existsSameDay = procedures.some(p => {
            if (!p || !p.date) return false;
            try {
              const pd = new Date(p.date).toISOString().split('T')[0];
              return pd === normalizedDate;
            } catch (e) {
              return false;
            }
          });
          if (existsSameDay) {
            alert('Ya existe una prestación para esta pieza en la misma fecha. Edita la prestación existente si necesitas cambiarla.');
            return tooth; // no changes
          }
        }

        const newProc = { id: 'PR_' + new Date().toISOString().replace(/[^0-9]/g, '') + Math.floor(Math.random()*1000), date, procedure, sector: sector || undefined, notes, procedure_code: planProcedureCode || undefined } as any;
        // clear editing state if any
        setEditingProcId(null);
        setNewProcedureText('');
        setNewProcedureNotes('');
        setNewProcedureDate(new Date().toISOString().split('T')[0]);
        setPlanProcedureCode('');
        return { ...tooth, procedures: [...procedures, newProc] };
      }
      return tooth;
    });

    setToothConditions(newConditions);
    onUpdate(newConditions);

    // Update plan items: change 'en_proceso' or 'planned' status to 'realizado' for matching procedures.
    // Note: the local planItems may still have status 'planned' if the parent updated it to 'en_proceso'
    // externally (via initialPlan prop) but the local sync guard (planItems.length === 0) prevented
    // the Odontogram from picking up that external change.
    if (!planMode) {
      console.log('addProcedure: updating plan items to realizado', { toothId, procedure, planMode });
      setPlanItems(prev => {
        console.log('addProcedure: before update', prev);
        const updated = prev.map(item => {
          const itemTooth = Number(item.tooth || item.pieza);
          const itemProcedure = (item.procedure_name || item.nombre || item.name || '').toLowerCase();
          const currentProcedure = procedure.toLowerCase();
          
          // Match by tooth + procedure name, regardless of current status (en_proceso or planned)
          if (itemTooth === toothId && 
              itemProcedure === currentProcedure &&
              (item.status === 'en_proceso' || item.status === 'planned' || item.status === 'plan' || item.status === 'pending')) {
            console.log('addProcedure: updating item to realizado', item);
            return { ...item, status: 'realizado' };
          }
          return item;
        });
        console.log('addProcedure: after update', updated);
        return updated;
      });
    }
  };

  const handleCrownClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !crownMode) return;
    
    // No permitir coronas en dientes ausentes
    const tooth = toothConditions.find(t => t.number === toothId);
    if (tooth?.status === 'missing') return;
    
    event.preventDefault();
    event.stopPropagation();
    if (planMode) {
      setPlannedToothConditions(prev => prev.map(t => {
        if (t.number !== toothId) return t;
        const turningOn = !t.hasCrown;
        if (turningOn) {
          return { ...t, hasCrown: true, hasProsthesis: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
        }
        return { ...t, hasCrown: false };
      }));
      const toothBefore = plannedToothConditions.find(t => t.number === toothId);
      const wasCrown = toothBefore?.hasCrown || false;
      const nowTurningOn = !wasCrown;
      if (nowTurningOn) setSelectedSector(null);
    } else {
      const newConditions = toothConditions.map(t => {
        if (t.number !== toothId) return t;
        const turningOn = !t.hasCrown;
        if (turningOn) {
          return { ...t, hasCrown: true, hasProsthesis: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
        }
        return { ...t, hasCrown: false };
      });
      const toothBefore = toothConditions.find(t => t.number === toothId);
      const wasCrown = toothBefore?.hasCrown || false;
      const nowTurningOn = !wasCrown;
      setToothConditions(newConditions);
      onUpdate(newConditions);
      if (nowTurningOn) setSelectedSector(null);
    }
  };

  const getToothCrown = (toothId: number): boolean => {
    const active = getActiveConditions();
    const tooth = active.find(t => t.number === toothId);
    return tooth?.hasCrown || false;
  };

  const handleProsthesisClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !prosthesisMode) return;
    
    // No permitir prótesis en dientes ausentes
    const tooth = toothConditions.find(t => t.number === toothId);
    if (tooth?.status === 'missing') return;
    
    event.preventDefault();
    event.stopPropagation();
    if (planMode) {
      setPlannedToothConditions(prev => prev.map(t => {
        if (t.number !== toothId) return t;
        const turningOn = !t.hasProsthesis;
        if (turningOn) {
          return { ...t, hasProsthesis: true, hasCrown: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
        }
        return { ...t, hasProsthesis: false };
      }));
      const toothBefore = plannedToothConditions.find(t => t.number === toothId);
      const wasProst = toothBefore?.hasProsthesis || false;
      const nowTurningOn = !wasProst;
      if (nowTurningOn) setSelectedSector(null);
    } else {
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
    }
  };

  const getToothProsthesis = (toothId: number): boolean => {
    const active = getActiveConditions();
    const tooth = active.find(t => t.number === toothId);
    return tooth?.hasProsthesis || false;
  };

  const handleExtractionClick = (toothId: number, event: React.MouseEvent) => {
    if (readOnly || !extractionMode) return;

    event.preventDefault();
    event.stopPropagation();
    if (planMode) {
      setPlannedToothConditions(prev => prev.map(t => {
        if (t.number !== toothId) return t;
        const turningOn = t.status !== 'extraction';
        if (turningOn) {
          return { ...t, status: 'extraction', hasCrown: false, hasProsthesis: false, sectors: [] };
        }
        return { ...t, status: 'healthy' } as any;
      }));
      const toothBefore = plannedToothConditions.find(t => t.number === toothId);
      const wasExtraction = toothBefore?.status === 'extraction';
      const nowTurningOn = !wasExtraction;
      if (nowTurningOn) setSelectedSector(null);
    } else {
      const newConditions = toothConditions.map(t => {
        if (t.number !== toothId) return t;
        const turningOn = t.status !== 'extraction';
        if (turningOn) {
          return { ...t, status: 'extraction', hasCrown: false, hasProsthesis: false, sectors: [] };
        }
        return { ...t, status: 'healthy' } as any;
      });
      const toothBefore = toothConditions.find(t => t.number === toothId);
      const wasExtraction = toothBefore?.status === 'extraction';
      const nowTurningOn = !wasExtraction;
      setToothConditions(newConditions);
      onUpdate(newConditions);
      if (nowTurningOn) setSelectedSector(null);
    }
  };

  const getToothCondition = (toothId: number) => {
    const active = getActiveConditions();
    return active.find(t => t.number === toothId)?.status || 'healthy';
  };

  // Componente de diente
  const Tooth = ({ number, position, labelPosition = 'top' }: { number: number, position: { x: number, y: number }, labelPosition?: 'top' | 'bottom' }) => {
    const condition = getToothCondition(number);
    const isSelected = selectedTooth === number;
    const isDisabled = selectedTooth !== null && selectedTooth !== number;
    
    // Calcular posición del texto basado en labelPosition
    const textY = labelPosition === 'top' ? position.y - 6 : position.y + 44 + 16;
    
    const toothColor = getToothColor(condition as any);

    return (
      <g>
        {/* Número del diente */}
        <text
          x={position.x + 22}
          y={textY}
          textAnchor="middle"
          fill="#374151"
          style={{ fontSize: '14px', fontWeight: 700, pointerEvents: 'none' } as any}
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
            {/* Sector superior dividido: topUpper (franja externa) y topLower (franja interna) */}
            {/* topUpper: cerca del borde exterior */}
            <polygon
              points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y + 6} ${position.x},${position.y + 6}`}
              fill={getSectorRestoration(number, 'topUpper') ? sectorColor : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'topUpper', e)}
            >
              <title>{getFaceName(number, 'topUpper')}</title>
            </polygon>

            {/* topLower: más cerca del centro (encima del cuadrado interior) */}
            <polygon
              points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y} ${position.x},${position.y}`}
              fill={getSectorRestoration(number, 'top') ? sectorColor : 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'top', e); }}
            >
              <title>{getFaceName(number, 'topLower')}</title>
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
            
            {/* Sector centro subdividido en Mesial (izquierda) y Distal (derecha) */}
            <rect
              x={position.x + 11}
              y={position.y + 11}
              width="11"
              height="22"
              fill={getSectorRestoration(number, 'centerMesial') ? sectorColor : 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'centerMesial', e)}
            >
              <title>{getFaceName(number, 'centerMesial')}</title>
            </rect>

            <rect
              x={position.x + 22}
              y={position.y + 11}
              width="11"
              height="22"
              fill={getSectorRestoration(number, 'center') ? sectorColor : 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'center', e); }}
            >
              <title>{getFaceName(number, 'centerDistal')}</title>
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
            {getSectorRestoration(number, 'topUpper') && (
              <polygon
                points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y + 6} ${position.x},${position.y + 6}`}
                fill={sectorColor}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'topUpper')}
              >
                <title>{getFaceName(number, 'topUpper')}</title>
              </polygon>
            )}
            {getSectorRestoration(number, 'topLower') && (
              <polygon
                points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y} ${position.x},${position.y}`}
                fill={sectorColor}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'topLower')}
              >
                <title>{getFaceName(number, 'topLower')}</title>
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
            {getSectorRestoration(number, 'centerMesial') && (
              <rect
                x={position.x + 11}
                y={position.y + 11}
                width="11"
                height="22"
                fill={sectorColor}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'centerMesial')}
              >
                <title>{getFaceName(number, 'centerMesial')}</title>
              </rect>
            )}
            {getSectorRestoration(number, 'centerDistal') && (
              <rect
                x={position.x + 22}
                y={position.y + 11}
                width="11"
                height="22"
                fill={sectorColor}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'centerDistal')}
              >
                <title>{getFaceName(number, 'centerDistal')}</title>
              </rect>
            )}
          </>
        )}

        {/* Overlays de plan: sólo visibles en Ficha Catastral (planMode === true) - REMOVED */}
        {/* {planMode && !sectorMode && (
          <>
            {isPlannedOn(number, 'top', true) && (
              <polygon
                points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y} ${position.x},${position.y}`}
                fill={'rgba(245,158,11,0.30)'}
                stroke={'rgba(245,158,11,0.9)'}
                strokeWidth="1"
                className="pointer-events-none"
              />
            )}

            {isPlannedOn(number, 'bottom', true) && (
              <polygon
                points={`${position.x + 11},${position.y + 33} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44} ${position.x},${position.y + 44}`}
                fill={'rgba(245,158,11,0.30)'}
                stroke={'rgba(245,158,11,0.9)'}
                strokeWidth="1"
                className="pointer-events-none"
              />
            )}

            {isPlannedOn(number, 'left', true) && (
              <polygon
                points={`${position.x},${position.y} ${position.x + 11},${position.y + 11} ${position.x + 11},${position.y + 33} ${position.x},${position.y + 44}`}
                fill={'rgba(245,158,11,0.30)'}
                stroke={'rgba(245,158,11,0.9)'}
                strokeWidth="1"
                className="pointer-events-none"
              />
            )}

            {isPlannedOn(number, 'right', true) && (
              <polygon
                points={`${position.x + 44},${position.y} ${position.x + 33},${position.y + 11} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44}`}
                fill={'rgba(245,158,11,0.30)'}
                stroke={'rgba(245,158,11,0.9)'}
                strokeWidth="1"
                className="pointer-events-none"
              />
            )}

            {isPlannedOn(number, 'center', true) && (
              <rect
                x={position.x + 11}
                y={position.y + 11}
                width="22"
                height="22"
                fill={'rgba(245,158,11,0.30)'}
                stroke={'rgba(245,158,11,0.9)'}
                strokeWidth="1"
                className="pointer-events-none"
              />
            )}

            {allPlannedItems.some(item => (String(item.tooth) === String(number) || item.pieza === String(number) || item.pieza === number) && !(item.surface || item.sector)) && (
              <rect
                x={position.x}
                y={position.y}
                width="44"
                height="44"
                fill="none"
                stroke={'rgba(245,158,11,0.95)'}
                strokeWidth="3"
                className="pointer-events-none"
              />
            )}
          </>
        )} */}
        
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

        {/* Selector de Modo (Ficha Catastral / Realizar prestaciones) + indicaciones contextuales */}
        {!readOnly && (
          <div className="flex items-center justify-between mb-4 gap-4">
            {/* Indicación contextual — izquierda */}
            <div className="flex items-center gap-2 min-h-[28px]">
              {!selectedTooth && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0">1</span>
                  <span className="text-sm text-gray-500">Seleccionar una pieza dental para aplicar un procedimiento</span>
                </>
              )}
              {selectedTooth && !planProcedureName && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold shrink-0">2</span>
                  <span className="text-sm text-blue-700 font-medium">Seleccionar un procedimiento</span>
                </>
              )}
              {selectedTooth && planProcedureName === 'Restauración' && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold shrink-0">3</span>
                  <span className="text-sm text-amber-700 font-medium">Seleccionar las caras dentales a obturar</span>
                </>
              )}
              {selectedTooth && planProcedureName && planProcedureName !== 'Restauración' && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold shrink-0">✓</span>
                  <span className="text-sm text-green-700 font-medium">Listo — hacé clic en <strong>Agregar</strong></span>
                </>
              )}
            </div>

            {/* Selector de modo — derecha */}
            <div className="inline-flex rounded-lg bg-gray-100 p-1 shrink-0" role="tablist" aria-label="Modo">
              <button
                role="tab"
                aria-selected={planMode}
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  setPlanMode(true); 
                  setSectorMode(false); 
                  setCrownMode(false); 
                  setProsthesisMode(false); 
                  setExtractionMode(false); 
                }}
                className={`px-4 py-1.5 text-sm rounded-md font-medium transition ${planMode ? 'bg-amber-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                Ficha Catastral
              </button>
              <button
                role="tab"
                aria-selected={!planMode}
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  setPlanMode(false); 
                }}
                className={`ml-1 px-4 py-1.5 text-sm rounded-md font-medium transition ${!planMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                Realizar prestaciones
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Odontograma SVG */}
      <div className={`flex ${showLegend ? 'mb-6' : 'm-0'} gap-6`}> 
        <div className="flex-1 flex justify-center">
          <svg viewBox="0 58 900 292" className={`w-full h-auto max-w-[900px] bg-white overflow-visible ${showBorder ? 'border border-gray-300 rounded' : 'm-0 p-0'}`}>

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

        {!readOnly && (
          <aside className="w-80 bg-white border-2 border-gray-300 rounded-lg p-4 h-[360px] overflow-y-auto shadow-sm">
            <h5 className="text-sm font-semibold text-gray-800 mb-3">{planMode ? 'Plan de Tratamiento' : 'Realizar prestación'}</h5>

              <div className="text-sm text-gray-700 mb-2">Diente seleccionado: <span className="font-medium">{selectedTooth || '-'}</span> {selectedTooth ? <span>· {getSelectedSectorsInitials(selectedTooth) || (selectedSector ? getSectorInitial(selectedTooth, selectedSector) : '')}</span> : ''}</div>

              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  placeholder="Código (opcional)"
                  value={planProcedureCode}
                  onChange={(e) => setPlanProcedureCode(e.target.value)}
                  disabled={!selectedTooth}
                  className={`w-full px-3 py-2 border rounded-md ${!selectedTooth ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { if (!selectedTooth) return; setShowProcedureDropdown(v => !v); }}
                    disabled={!selectedTooth}
                    className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between ${!selectedTooth ? 'opacity-60 cursor-not-allowed bg-white' : ''}`}
                  >
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
                      <button type="button" onClick={() => { 
                        setPlanProcedureName('Corona'); 
                        setSectorMode(false); 
                        setCrownMode(false); 
                        setProsthesisMode(false); 
                        setExtractionMode(false); 
                        if (selectedTooth) { 
                          clearSectorsFor(selectedTooth); 
                          setSelectedSector(null);
                          // Automatically mark corona on the selected tooth
                          if (planMode) {
                            setPlannedToothConditions(prev => prev.map(t => {
                              if (t.number !== selectedTooth) return t;
                              return { ...t, hasCrown: true, hasProsthesis: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
                            }));
                          } else {
                            const newConditions = toothConditions.map(t => {
                              if (t.number !== selectedTooth) return t;
                              return { ...t, hasCrown: true, hasProsthesis: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
                            });
                            setToothConditions(newConditions);
                            onUpdate(newConditions);
                          }
                        } 
                        setShowProcedureDropdown(false); 
                      }} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50"> 
                        <div className="w-4 h-4 border-2 border-blue-500 rounded-full" />
                        <span>Corona</span>
                      </button>
                      <button type="button" onClick={() => { 
                        setPlanProcedureName('Prótesis'); 
                        setSectorMode(false); 
                        setCrownMode(false); 
                        setProsthesisMode(false); 
                        setExtractionMode(false); 
                        if (selectedTooth) { 
                          clearSectorsFor(selectedTooth); 
                          setSelectedSector(null);
                          // Automatically mark protesis on the selected tooth
                          if (planMode) {
                            setPlannedToothConditions(prev => prev.map(t => {
                              if (t.number !== selectedTooth) return t;
                              return { ...t, hasCrown: false, hasProsthesis: true, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
                            }));
                          } else {
                            const newConditions = toothConditions.map(t => {
                              if (t.number !== selectedTooth) return t;
                              return { ...t, hasCrown: false, hasProsthesis: true, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
                            });
                            setToothConditions(newConditions);
                            onUpdate(newConditions);
                          }
                        } 
                        setShowProcedureDropdown(false); 
                      }} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50"> 
                        <div className="w-4 h-4 border-t-2 border-b-2 border-green-400" />
                        <span>Prótesis</span>
                      </button>
                      <button type="button" onClick={() => { 
                        setPlanProcedureName('Extracción'); 
                        setSectorMode(false); 
                        setCrownMode(false); 
                        setProsthesisMode(false); 
                        setExtractionMode(false); 
                        if (selectedTooth) { 
                          clearSectorsFor(selectedTooth); 
                          setSelectedSector(null);
                          // Automatically mark extraction on the selected tooth
                          if (planMode) {
                            setPlannedToothConditions(prev => prev.map(t => {
                              if (t.number !== selectedTooth) return t;
                              return { ...t, hasCrown: false, hasProsthesis: false, sectors: [], status: 'extraction' as const };
                            }));
                          } else {
                            const newConditions = toothConditions.map(t => {
                              if (t.number !== selectedTooth) return t;
                              return { ...t, hasCrown: false, hasProsthesis: false, sectors: [], status: 'extraction' as const };
                            });
                            setToothConditions(newConditions);
                            onUpdate(newConditions);
                          }
                        } 
                        setShowProcedureDropdown(false); 
                      }} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50"> 
                        <div className="w-4 h-4 text-red-600 font-bold">X</div>
                        <span>Extracción</span>
                      </button>
                    </div>
                  )}
                </div>
                {/* cantidad y precio estimado eliminados del formulario por petición */}
                <textarea
                  placeholder="Notas (opcional)"
                  value={planNotes}
                  onChange={(e) => setPlanNotes(e.target.value)}
                  disabled={!selectedTooth}
                  className={`w-full px-3 py-2 border rounded-md ${!selectedTooth ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedTooth) return;
                    if (planMode) {
                      addPlanItem(selectedTooth, selectedSector);
                      // After adding to plan, clear procedure selection and exit sector mode
                      setPlanProcedureCode('');
                      setPlanProcedureName('');
                      setPlanNotes('');
                      setSectorMode(false);
                    } else {
                      // Realizar prestación: registrar procedimiento inmediatamente
                      if (!planProcedureName || !planProcedureName.trim()) return;
                      addProcedure(selectedTooth, selectedSector, newProcedureDate, planProcedureName.trim(), planNotes || undefined);
                      setPlanProcedureCode('');
                      setPlanProcedureName('');
                      setPlanNotes('');
                      // After performing a procedure, clear selection
                      setSelectedTooth(null);
                      setSelectedSector(null);
                    }
                  }}
                  disabled={!selectedTooth || (!planMode && !planProcedureName)}
                  className={`px-3 py-2 rounded text-white ${selectedTooth ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedTooth(null); setSelectedSector(null); }}
                  disabled={!selectedTooth}
                  className={`px-3 py-2 rounded ${selectedTooth ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                >
                  Deseleccionar
                </button>

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
          <div id="odontogram-instructions" className="p-4 bg-gray-50 text-sm text-gray-600 space-y-2 hidden">
            <p><strong>Modo de uso:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Haga clic en un diente para seleccionarlo.</li>
              <li>Use el panel de la derecha para registrar tratamientos o planificaciones.</li>
              <li>Para restauraciones por caras, seleccione el procedimiento "Restauración" y luego haga clic en las áreas del diente (superior, inferior, centro, etc.).</li>
              <li>Las marcas de colores indican el estado actual o planificado de cada pieza dental.</li>
            </ul>
          </div>
        </div>
      )}

      {showViewModal && selectedTooth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setShowViewModal(false); setSelectedTooth(null); setSelectedSector(null); }} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-4 z-10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Tratamientos - Pieza {selectedTooth}</h4>
              <button onClick={() => { setShowViewModal(false); setSelectedTooth(null); setSelectedSector(null); }} className="text-sm text-gray-600">Cerrar</button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {getProceduresFor(selectedTooth, selectedSector).length > 0 ? (
                getProceduresFor(selectedTooth, selectedSector).map((proc, idx) => (
                  <div key={idx} className="p-2 border rounded-md bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{proc.date}</span>
                      <span>{proc.sector ? getFaceName(selectedTooth, proc.sector) : 'Pieza completa'}</span>
                    </div>
                    <div className="font-medium text-gray-800">{proc.procedure}</div>
                    {proc.notes && <div className="text-xs text-gray-600 mt-1">{proc.notes}</div>}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No hay registros para esta selección.</div>
              )}
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

      {/* Panel de detalles por diente eliminado */}
    </div>
  );
}
