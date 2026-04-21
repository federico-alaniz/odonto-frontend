'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ToothCondition, ToothSector } from '@/services/medicalRecords';

export type { ToothCondition, ToothSector };

// --- Helper Functions (Static) ---

/** Clona condiciones dentales para evitar mutaciones directas. */
const cloneToothConditions = (conditions: ToothCondition[]) =>
  conditions.map((tooth) => ({
    ...tooth,
    sectors: tooth.sectors ? tooth.sectors.map((sector) => ({ ...sector })) : [],
    procedures: tooth.procedures ? tooth.procedures.map((procedure) => ({ ...procedure })) : [],
  }));

/** Obtener inicial de un sector (según diente para diferenciar palatina/lingual y incisal/oclusal) */
const getSectorInitial = (toothNumber: number | null, sector: string | null) => {
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
    case 'topUpper':
    case 'topLower':
      return 'V'; // Vestibular
    case 'bottom':
      return isUpper ? 'P' : 'L'; // Palatina (P) en superior, Lingual (L) en inferior
    case 'centerMesial':
      return isAnterior ? 'IM' : 'OM';
    case 'centerDistal':
      return isAnterior ? 'ID' : 'OD';
    case 'center':
      return isAnterior ? 'I' : 'O'; // Incisal o Oclusal
    default:
      return '';
  }
};

/** Mapear sectores SVG a nombres de caras dentales con abreviatura */
const getFaceName = (toothNumber: number | null, sector: string | null) => {
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

const normalizePlanStatus = (status?: string | null) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'realizado' || normalized === 'executed' || normalized === 'done' || normalized === 'performed') {
    return 'realizado';
  }
  if (normalized === 'en_proceso' || normalized === 'en proceso' || normalized === 'in_progress') {
    return 'en_proceso';
  }
  return 'planned';
};

const getPlanStatusPriority = (status?: string | null) => {
  const normalized = normalizePlanStatus(status);
  if (normalized === 'realizado') return 3;
  if (normalized === 'en_proceso') return 2;
  return 1;
};

const getPlanVisualColor = (status?: string | null) => {
  const normalized = normalizePlanStatus(status);
  if (normalized === 'realizado') return '#16a34a';
  if (normalized === 'en_proceso') return '#2563eb';
  return '#d97706';
};

const getProcedureKind = (item: any) => {
  const procedureName = String(item?.procedure_name || item?.procedure || item?.nombre || item?.name || '').toLowerCase();
  if (procedureName.includes('corona')) return 'crown';
  if (procedureName.includes('prótesis') || procedureName.includes('protesis')) return 'prosthesis';
  if (procedureName.includes('extracción') || procedureName.includes('extraccion')) return 'extraction';
  if (procedureName.includes('obturación') || procedureName.includes('obturacion') || procedureName.includes('restauración') || procedureName.includes('restauracion')) return 'restoration';
  return 'restoration';
};

const mapSurfaceTokenToSectors = (toothNumber: number, token: string): ToothSector['sector'][] => {
  const cleaned = token.trim();
  const upper = cleaned.toUpperCase();
  const lower = cleaned.toLowerCase();

  if (upper === 'V') return ['topUpper', 'topLower'];
  if (upper === 'P' || upper === 'L') return ['bottom'];
  if (upper === 'M') return ['left'];
  if (upper === 'D') return ['right'];
  if (upper === 'I' || upper === 'O' || upper === 'IM' || upper === 'OM' || upper === 'ID' || upper === 'OD') return ['center'];

  if (lower === 'top') return ['topLower'];
  if (lower === 'topupper') return ['topUpper'];
  if (lower === 'toplower') return ['topLower'];
  if (lower === 'bottom') return ['bottom'];
  if (lower === 'left') return ['left'];
  if (lower === 'right') return ['right'];
  if (lower === 'center' || lower === 'centermesial' || lower === 'centerdistal') return ['center'];

  const fallbackInitial = getSectorInitial(toothNumber, cleaned as ToothSector['sector']);
  if (fallbackInitial) {
    return mapSurfaceTokenToSectors(toothNumber, fallbackInitial);
  }

  return [];
};

const getPlanItemSectors = (item: any, toothNumber: number): ToothSector['sector'][] => {
  const rawSurface = item?.surface || item?.sector;
  if (!rawSurface) return [];

  const tokens = String(rawSurface)
    .split(/[-,;]/)
    .map((part) => part.trim())
    .filter(Boolean);

  return tokens.flatMap((token) => mapSurfaceTokenToSectors(toothNumber, token));
};

const buildPlannedToothConditions = (baseConditions: ToothCondition[], items: any[]) => {
  const nextConditions = cloneToothConditions(baseConditions);

  items.forEach((item) => {
    const toothNumber = Number(item?.tooth || item?.pieza);
    if (!toothNumber) return;

    const tooth = nextConditions.find((entry) => entry.number === toothNumber);
    if (!tooth) return;

    const procedureKind = getProcedureKind(item);

    if (procedureKind === 'crown') {
      tooth.hasCrown = true;
      tooth.hasProsthesis = false;
      return;
    }

    if (procedureKind === 'prosthesis') {
      tooth.hasProsthesis = true;
      tooth.hasCrown = false;
      return;
    }

    if (procedureKind === 'extraction') {
      tooth.status = 'extraction';
      tooth.hasCrown = false;
      tooth.hasProsthesis = false;
      tooth.sectors = [];
      return;
    }

    const planSectors = getPlanItemSectors(item, toothNumber);
    if (!tooth.sectors) tooth.sectors = [];

    planSectors.forEach((sector) => {
      const existingSector = tooth.sectors?.find((entry) => entry.sector === sector);
      if (existingSector) {
        existingSector.hasRestoration = true;
      } else {
        tooth.sectors?.push({ sector, hasRestoration: true });
      }
    });
  });

  return nextConditions;
};

// --- Component ---

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
  /** Llamado cuando se confirma agregar/actualizar un ítem del plan (incluye guardar una edición). */
  onPlanRowEditCommitted?: () => void;
  /** Incrementar desde el padre para cancelar edición del plan y limpiar `editingProcId` en el odontograma. */
  planEditCancelNonce?: number;
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
  registerEditHandler,
  onPlanRowEditCommitted,
  planEditCancelNonce
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

  const toothConditionsRef = useRef(toothConditions);
  toothConditionsRef.current = toothConditions;

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
  const lastPlanEditCancelNonceRef = useRef(0);

  useEffect(() => {
    if (planEditCancelNonce == null || planEditCancelNonce <= 0) return;
    if (planEditCancelNonce === lastPlanEditCancelNonceRef.current) return;
    lastPlanEditCancelNonceRef.current = planEditCancelNonce;
    setEditingProcId(null);
  }, [planEditCancelNonce]);

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

  // Use a ref for onUpdate to avoid re-registering the edit handler every time it changes
  // although it should be stable if the parent uses useCallback.
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // If parent wants to register an external edit handler, provide a function
  useEffect(() => {
    if (typeof registerEditHandler === 'function') {
      // Create a stable callback that uses the latest onUpdate via ref
      const editHandlerCallback = (proc: any) => {
        console.log('Odontogram: editHandlerCallback received', proc);
        if (!proc) return;
        // proc should contain tooth, sector, date, procedure, notes, id
        const toothNum = proc.tooth || (proc.tooth && Number(proc.tooth)) || null;
        setSelectedTooth(toothNum);
        
        // Handle potential array or string with hyphens for sector
        let sectorValue = proc.sector || null;
        if (Array.isArray(sectorValue)) {
          sectorValue = sectorValue.join(' - ');
        }
        setSelectedSector(sectorValue);

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
          const procedureKind = getProcedureKind(proc);
          
          if (proc.mode === 'perform') {
            // Switch to 'realizar prestaciones' mode
            setPlanMode(false);
          }
          
          // Set the appropriate mode flags and update tooth conditions
          if (procedureKind === 'restoration') {
            console.log('Odontogram: Restoration-kind procedure detected', { toothNum, sector: proc.sector });
            setSectorMode(true);
            setCrownMode(false);
            setProsthesisMode(false);
            setExtractionMode(false);

            // Update tooth conditions to show restoration sectors
            if (proc.sector) {
              const sectorStr = Array.isArray(proc.sector) ? proc.sector.join(' - ') : String(proc.sector);
              // split by any non-alphanumeric character to be flexible
              const sectorInitials = sectorStr.split(/[^a-zA-Z]+/).filter(Boolean);
              console.log('Odontogram: Sector initials parsed', sectorInitials);
              const sectors: ToothSector[] = [];
              
              sectorInitials.forEach((initial: string) => {
                const mappedSectors = mapSurfaceTokenToSectors(toothNum, initial);
                console.log(`Odontogram: Mapping initial "${initial}" to`, mappedSectors);
                mappedSectors.forEach((s: ToothSector['sector']) => {
                  if (!sectors.some(existing => existing.sector === s)) {
                    sectors.push({ sector: s, hasRestoration: true });
                  }
                });
              });
              
              if (sectors.length > 0) {
                console.log('Odontogram: Final mapped sectors', sectors);
                const latest = toothConditionsRef.current;
                const newConditions = latest.map(t =>
                  t.number === toothNum ? { ...t, sectors: sectors, status: (t.status === 'healthy' ? 'filling' : t.status) as ToothCondition['status'] } : t
                );
                
                // Update local states immediately
                console.log('Odontogram: Setting toothConditions and plannedToothConditions with new sectors', sectors);
                setToothConditions(newConditions);
                setPlannedToothConditions(prev => prev.map(t =>
                  t.number === toothNum ? { ...t, sectors: sectors, status: (t.status === 'healthy' ? 'filling' : t.status) as ToothCondition['status'] } : t
                ));
                
                // Also explicitly set selectedSector so the form knows something is selected
                setSelectedSector(sectorStr as ToothSector['sector']);

                // Notify parent using the ref to avoid dependency loop
                console.log('Odontogram: Notifying parent with new conditions');
                onUpdateRef.current(newConditions);
              }
            }
          } else if (procedureKind === 'crown') {
            setSectorMode(false);
            setCrownMode(true);
            setProsthesisMode(false);
            setExtractionMode(false);
            // Update tooth conditions to show crown
            if (proc.mode === 'perform') {
              const latest = toothConditionsRef.current;
              const newConditions = latest.map(t =>
                t.number === toothNum
                  ? { ...t, hasCrown: true, hasProsthesis: false, sectors: [], status: 'crown' as const }
                  : t
              );
              setToothConditions(newConditions);
              setPlannedToothConditions(prev => prev.map(t =>
                t.number === toothNum
                  ? { ...t, hasCrown: true, hasProsthesis: false, sectors: [], status: 'crown' as const }
                  : t
              ));
              onUpdateRef.current(newConditions);
            } else {
              setPlannedToothConditions(prev => prev.map(t => 
                t.number === toothNum 
                  ? { ...t, hasCrown: true, hasProsthesis: false, sectors: [], status: 'crown' as const }
                  : t
              ));
            }
          } else if (procedureKind === 'prosthesis') {
            setSectorMode(false);
            setCrownMode(false);
            setProsthesisMode(true);
            setExtractionMode(false);
            // Update tooth conditions to show prosthesis
            if (proc.mode === 'perform') {
              const latest = toothConditionsRef.current;
              const newConditions = latest.map(t =>
                t.number === toothNum
                  ? { ...t, hasCrown: false, hasProsthesis: true, sectors: [], status: 'healthy' as const }
                  : t
              );
              setToothConditions(newConditions);
              setPlannedToothConditions(prev => prev.map(t =>
                t.number === toothNum
                  ? { ...t, hasCrown: false, hasProsthesis: true, sectors: [], status: 'healthy' as const }
                  : t
              ));
              onUpdateRef.current(newConditions);
            } else {
              setPlannedToothConditions(prev => prev.map(t => 
                t.number === toothNum 
                  ? { ...t, hasCrown: false, hasProsthesis: true, sectors: [], status: 'healthy' as const }
                  : t
              ));
            }
          } else if (procedureKind === 'extraction') {
            setSectorMode(false);
            setCrownMode(false);
            setProsthesisMode(false);
            setExtractionMode(true);
            // Update tooth conditions to show extraction
            if (proc.mode === 'perform') {
              const latest = toothConditionsRef.current;
              const newConditions = latest.map(t =>
                t.number === toothNum
                  ? { ...t, hasCrown: false, hasProsthesis: false, sectors: [], status: 'extraction' as const }
                  : t
              );
              setToothConditions(newConditions);
              setPlannedToothConditions(prev => prev.map(t =>
                t.number === toothNum
                  ? { ...t, hasCrown: false, hasProsthesis: false, sectors: [], status: 'extraction' as const }
                  : t
              ));
              onUpdateRef.current(newConditions);
            } else {
              setPlannedToothConditions(prev => prev.map(t => 
                t.number === toothNum 
                  ? { ...t, hasCrown: false, hasProsthesis: false, sectors: [], status: 'extraction' as const }
                  : t
              ));
            }
          }
        }
      };

      registerEditHandler(editHandlerCallback);
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


  useEffect(() => {
    if (typeof onPlanChange === 'function') {
      try {
        console.log('Odontogram: Calling onPlanChange with', planItems);
        onPlanChange(planItems);
      } catch (e) {
        // swallow to avoid render-time exceptions
        console.error('onPlanChange callback error', e);
      }
    }
  }, [planItems, onPlanChange]);

  const getBestMatchingPlanItem = (
    toothNumber: number,
    predicate: (item: any) => boolean
  ) => {
    const candidates = (planItems || []).filter((item) => {
      const matchesTooth =
        String(item?.tooth) === String(toothNumber) ||
        String(item?.pieza) === String(toothNumber);
      return matchesTooth && predicate(item);
    });

    if (candidates.length === 0) return null;

    return candidates.sort((a, b) => getPlanStatusPriority(b?.status || b?.estado) - getPlanStatusPriority(a?.status || a?.estado))[0];
  };

  const getPlannedSectorColor = (toothNumber: number, sector: ToothSector['sector']) => {
    if (!planMode) return null;

    const matchedItem = getBestMatchingPlanItem(toothNumber, (item) => {
      if (getProcedureKind(item) !== 'restoration') return false;
      const planSecs = getPlanItemSectors(item, toothNumber);
      if (planSecs.includes(sector)) return true;
      if (sector === 'center') {
        return planSecs.some((s) => s === 'centerMesial' || s === 'centerDistal');
      }
      if (sector === 'centerMesial' || sector === 'centerDistal') {
        return planSecs.includes('center');
      }
      return false;
    });

    return matchedItem ? getPlanVisualColor(matchedItem.status || matchedItem.estado) : null;
  };

  const getPlannedWholeToothColor = (toothNumber: number, kind: 'crown' | 'prosthesis' | 'extraction') => {
    if (!planMode) return null;
    const matchedItem = getBestMatchingPlanItem(toothNumber, (item) => getProcedureKind(item) === kind);
    return matchedItem ? getPlanVisualColor(matchedItem.status || matchedItem.estado) : null;
  };

  useEffect(() => {
    console.log('Odontogram: initialConditions changed', initialConditions);
    if (!initialConditions || initialConditions.length === 0) return;

    setToothConditions((prev) => {
      // Create a map of existing teeth for faster merging
      const prevMap = new Map(prev.map(t => [t.number, t]));
      let hasChanges = false;

      // Merge initialConditions into our full set of teeth
      initialConditions.forEach(newTooth => {
        const existing = prevMap.get(newTooth.number);
        // Compare only if existing tooth is different to avoid unnecessary updates
        if (!existing || JSON.stringify(existing) !== JSON.stringify(newTooth)) {
          prevMap.set(newTooth.number, { ...newTooth });
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        return prev;
      }

      console.log('Odontogram: Merging initialConditions into toothConditions');
      // Always maintain the full set of teeth in the correct order (reconstructing from the map)
      // but ensure we return a new array to trigger re-render
      return Array.from(prevMap.values()).sort((a, b) => a.number - b.number);
    });
  }, [initialConditions]);

  useEffect(() => {
    console.log('Odontogram: initialPlan changed', initialPlan);
    if (!initialPlan || !Array.isArray(initialPlan) || initialPlan.length === 0) return;

    setPlanItems(prev => {
      // Check if data is actually different to avoid unnecessary re-renders and loops
      if (JSON.stringify(prev) === JSON.stringify(initialPlan)) {
        return prev;
      }

      console.log('Odontogram: Updating planItems from initialPlan');
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

  useEffect(() => {
    console.log('Odontogram: Recalculating plannedToothConditions', { toothConditionsLength: toothConditions.length, planItemsLength: planItems.length });
    setPlannedToothConditions(buildPlannedToothConditions(toothConditions, planItems || []));
  }, [planItems, toothConditions]);

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

    const switchingPerformTooth =
      !planMode && selectedTooth !== null && selectedTooth !== toothId;

    // Al pasar a otra pieza en "realizar prestaciones", desactivar herramientas del procedimiento anterior
    // (el estado de React aún no refleja setState; por eso usamos switchingPerformTooth en los guards)
    if (switchingPerformTooth) {
      setSectorMode(false);
      setCrownMode(false);
      setProsthesisMode(false);
      setExtractionMode(false);
      setPlanProcedureName('');
      setPlanProcedureCode('');
      setPlanNotes('');
      setEditingProcId(null);
      setShowProcedureDropdown(false);
    }

    // Modos de aplicación directa al diente (no aplican si solo estamos cambiando de pieza seleccionada)
    if (!switchingPerformTooth && crownMode) {
      handleCrownClick(toothId, event!);
      return;
    }

    if (!switchingPerformTooth && prosthesisMode) {
      handleProsthesisClick(toothId, event!);
      return;
    }

    if (!switchingPerformTooth && extractionMode) {
      handleExtractionClick(toothId, event!);
      return;
    }

    if (!switchingPerformTooth && sectorMode) return;

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
      setSelectedSector(lastProc?.sector as any ?? null);
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

  const CENTER_SECTOR_GROUP: ToothSector['sector'][] = ['center', 'centerMesial', 'centerDistal'];

  /** Colapsa centro oclusal/incisal a un solo sector `center` en datos guardados. */
  const normalizeToothCenterSectors = (sectors: ToothSector[] | undefined): ToothSector[] => {
    const list = sectors ? [...sectors] : [];
    const others = list.filter((s) => !CENTER_SECTOR_GROUP.includes(s.sector));
    const group = list.filter((s) => CENTER_SECTOR_GROUP.includes(s.sector));
    const anyOn = group.some((s) => s.hasRestoration);
    if (!anyOn) return others;
    return [...others, { sector: 'center', hasRestoration: true }];
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
          newSectors = normalizeToothCenterSectors(newSectors);
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
          newSectors = normalizeToothCenterSectors(newSectors);
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
    if (!tooth?.sectors?.length) return false;
    const has = (s: ToothSector['sector']) => tooth.sectors!.some((x) => x.sector === s && x.hasRestoration);
    
    let result = false;
    if (sector === 'center') {
      result = has('center') || has('centerMesial') || has('centerDistal');
    } else if (sector === 'centerMesial' || sector === 'centerDistal') {
      result = has(sector) || has('center');
    } else {
      result = has(sector);
    }

    if (result) {
      console.log(`Odontogram: getSectorRestoration(${toothId}, ${sector}) = true`, { toothSectors: tooth.sectors });
    }
    return result;
  };

  const getDisplayedSectorColor = (toothId: number, sector: ToothSector['sector']) => {
    const plannedColor = getPlannedSectorColor(toothId, sector);
    if (plannedColor) return plannedColor;
    return getSectorRestoration(toothId, sector) ? sectorColor : null;
  };

  const getDisplayedCrownColor = (toothId: number) => {
    const plannedColor = getPlannedWholeToothColor(toothId, 'crown');
    if (plannedColor) return plannedColor;
    return getToothCrown(toothId) ? crownColor : null;
  };

  const getDisplayedProsthesisColor = (toothId: number) => {
    const plannedColor = getPlannedWholeToothColor(toothId, 'prosthesis');
    if (plannedColor) return plannedColor;
    return getToothProsthesis(toothId) ? prosthesisColor : null;
  };

  const getDisplayedExtractionColor = (toothId: number) => {
    const plannedColor = getPlannedWholeToothColor(toothId, 'extraction');
    if (plannedColor) return plannedColor;
    return getToothCondition(toothId) === 'extraction' ? extractionColor : null;
  };

  // Obtener las iniciales de las caras seleccionadas en un diente, unidas por guiones
  const getSelectedSectorsInitials = (toothNumber: number | null) => {
    if (!toothNumber) return '';
    // always use the current toothConditions for this to reflect the actual edit mode state,
    // because when switching to "realizar prestaciones", the local state is what the user is editing.
    // However, if we're in planMode, we should show planned conditions.
    const active = planMode ? plannedToothConditions : toothConditions;
    const tooth = active.find(t => t.number === toothNumber);
    if (!tooth || !tooth.sectors || tooth.sectors.length === 0) return '';
    // Orden predecible para mostrar: Vestibular, Palatina/Lingual, Mesial, Distal, Centro
    const hasR = (s: ToothSector['sector']) => tooth.sectors!.some((ts) => ts.sector === s && ts.hasRestoration);
    const order: ToothSector['sector'][] = ['topUpper', 'topLower', 'bottom', 'left', 'right', 'center'];
    const initials = Array.from(new Set(order
      .filter((s) => {
        if (s === 'center') {
          return hasR('center') || hasR('centerMesial') || hasR('centerDistal');
        }
        return hasR(s);
      })
      .map((s) => getSectorInitial(toothNumber, s))
      .filter(Boolean)));
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
    if (!sector) return procs;
    
    const initial = getSectorInitial(toothId, sector);
    return procs.filter(p => {
      if (!p.sector) return false;
      if (p.sector === sector || p.sector === initial) return true;
      // Handle multi-face restorations (e.g. "V - M - D")
      if (initial && p.sector.includes(' - ')) {
        const parts = p.sector.split(' - ');
        return parts.includes(initial);
      }
      return false;
    });
  };

  // Plan helpers
  const addPlanItem = (toothId: number | null, sector: ToothSector['sector'] | null) => {
    const wasEditingPlanRow = Boolean(editingProcId);
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

    const newItemBase = {
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

    if (wasEditingPlanRow) {
      setPlanItems((prev) =>
        prev.map((item, idx) => {
          const itemKey = item.id ?? `plan_row_${idx}`;
          return itemKey === editingProcId ? { ...item, ...newItemBase, id: editingProcId } : item;
        })
      );
      if (typeof onPlanRowEditCommitted === 'function') onPlanRowEditCommitted();
    } else {
      setPlanItems((prev) => [...prev, { ...newItemBase, id }]);
    }
  };

  const addProcedure = (
    toothId: number,
    sector: ToothSector['sector'] | null,
    date: string,
    procedure: string,
    notes?: string
  ) => {
    if (!procedure.trim()) return false;
    
    // Determine the sector string (could be joined initials for multiple faces)
    let sectorString: string | undefined = undefined;
    const tooth = toothConditions.find(t => t.number === toothId);
    if (tooth?.sectors && tooth.sectors.length > 0) {
       sectorString = getSelectedSectorsInitials(toothId);
    } else if (sector) {
       sectorString = getSectorInitial(toothId, sector);
    }

    const newProc: any = {
      id: editingProcId || String(Date.now()),
      date,
      procedure: procedure.trim(),
      procedure_code: planProcedureCode || undefined,
      sector: sectorString,
      notes,
      performedBy: 'current_doctor'
    };

    const newConditions = toothConditions.map((tooth) => {
      if (tooth.number !== toothId) return tooth;
      const procs = tooth.procedures ? [...tooth.procedures] : [];
      if (editingProcId) {
        const idx = procs.findIndex(p => String(p.id) === editingProcId || String(p.procId) === editingProcId);
        if (idx >= 0) procs[idx] = newProc;
        else procs.push(newProc);
      } else {
        procs.push(newProc);
      }
      return { ...tooth, procedures: procs };
    });

    setToothConditions(newConditions);
    onUpdate(newConditions);
    return true;
  };

  const handleCrownClick = (toothId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (planMode) {
      setPlannedToothConditions(prev => prev.map(t => {
        if (t.number !== toothId) return t;
        return { ...t, hasCrown: !t.hasCrown, hasProsthesis: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
      }));
      setSelectedTooth(toothId);
    } else {
      const newConditions = toothConditions.map(t => {
        if (t.number !== toothId) return t;
        return { ...t, hasCrown: !t.hasCrown, hasProsthesis: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
      });
      setToothConditions(newConditions);
      onUpdate(newConditions);
      setSelectedTooth(toothId);
    }
  };

  const handleProsthesisClick = (toothId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (planMode) {
      setPlannedToothConditions(prev => prev.map(t => {
        if (t.number !== toothId) return t;
        return { ...t, hasProsthesis: !t.hasProsthesis, hasCrown: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
      }));
      setSelectedTooth(toothId);
    } else {
      const newConditions = toothConditions.map(t => {
        if (t.number !== toothId) return t;
        return { ...t, hasProsthesis: !t.hasProsthesis, hasCrown: false, sectors: [], status: t.status === 'extraction' ? 'healthy' : t.status };
      });
      setToothConditions(newConditions);
      onUpdate(newConditions);
      setSelectedTooth(toothId);
    }
  };

  const handleExtractionClick = (toothId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (planMode) {
      setPlannedToothConditions(prev => prev.map(t => {
        if (t.number !== toothId) return t;
        const newStatus = t.status === 'extraction' ? 'healthy' : 'extraction';
        return { ...t, status: newStatus as any, hasCrown: false, hasProsthesis: false, sectors: [] };
      }));
      setSelectedTooth(toothId);
    } else {
      const newConditions = toothConditions.map(t => {
        if (t.number !== toothId) return t;
        const newStatus = t.status === 'extraction' ? 'healthy' : 'extraction';
        return { ...t, status: newStatus as any, hasCrown: false, hasProsthesis: false, sectors: [] };
      });
      setToothConditions(newConditions);
      onUpdate(newConditions);
      setSelectedTooth(toothId);
    }
  };

  const getToothCrown = (toothId: number): boolean => {
    const active = getActiveConditions();
    return active.find(t => t.number === toothId)?.hasCrown || false;
  };

  const getToothProsthesis = (toothId: number): boolean => {
    const active = getActiveConditions();
    return active.find(t => t.number === toothId)?.hasProsthesis || false;
  };

  const getToothCondition = (toothId: number): ToothCondition['status'] => {
    const active = getActiveConditions();
    return active.find(t => t.number === toothId)?.status || 'healthy';
  };

  const openViewFor = (toothId: number, sector?: ToothSector['sector']) => {
    const procs = getProceduresFor(toothId, sector || null);
    if (procs.length > 0) {
      setSelectedProcedure(procs[procs.length - 1]);
      setShowViewModal(true);
    }
  };

  const Tooth = ({ number, position, labelPosition }: { number: number, position: { x: number, y: number }, labelPosition: 'top' | 'bottom' }) => {
    const isSelected = selectedTooth === number;
    const isDisabled = readOnly;
    
    return (
      <g 
        className={`transition-all ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={(e) => handleToothClick(number, e)}
      >
        {/* Etiqueta con el número del diente */}
        <text
          x={position.x + 22}
          y={labelPosition === 'top' ? position.y - 10 : position.y + 60}
          textAnchor="middle"
          className={`text-[12px] font-bold select-none ${isSelected ? 'fill-blue-600' : 'fill-gray-500'}`}
        >
          {number}
        </text>

        {/* Rectángulo exterior (borde del diente) */}
        <rect
          x={position.x}
          y={position.y}
          width="44"
          height="44"
          fill="none"
          stroke={isSelected ? '#2563eb' : '#1f2937'}
          strokeWidth={isSelected ? '2' : '1'}
          className="transition-all"
        />

        {/* Sectores internos (caras) */}
        {true && (
          <>
            {/* Sector superior: topUpper (más afuera) */}
            <polygon
              points={`${position.x},${position.y} ${position.x + 44},${position.y} ${position.x + 33},${position.y + 11} ${position.x + 11},${position.y + 11}`}
              fill={getDisplayedSectorColor(number, 'topUpper') || 'transparent'}
              className="cursor-pointer hover:opacity-70 transition-all"
              onClick={(e) => handleSectorClick(number, 'topUpper', e)}
            >
              <title>{getFaceName(number, 'topUpper')}</title>
            </polygon>

            {/* topLower: más cerca del centro (encima del cuadrado interior) */}
            <polygon
              points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y} ${position.x},${position.y}`}
              fill={getDisplayedSectorColor(number, 'topLower') || 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'topLower', e); }}
            >
              <title>{getFaceName(number, 'topLower')}</title>
            </polygon>
            
            {/* Sector inferior */}
            <polygon
              points={`${position.x + 11},${position.y + 33} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44} ${position.x},${position.y + 44}`}
              fill={getDisplayedSectorColor(number, 'bottom') || 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'bottom', e); }}
            >
              <title>{getFaceName(number, 'bottom')}</title>
            </polygon>
            
            {/* Sector izquierdo */}
            <polygon
              points={`${position.x},${position.y} ${position.x + 11},${position.y + 11} ${position.x + 11},${position.y + 33} ${position.x},${position.y + 44}`}
              fill={getDisplayedSectorColor(number, 'left') || 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'left', e); }}
            >
              <title>{getFaceName(number, 'left')}</title>
            </polygon>
            
            {/* Sector derecho */}
            <polygon
              points={`${position.x + 44},${position.y} ${position.x + 33},${position.y + 11} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44}`}
              fill={getDisplayedSectorColor(number, 'right') || 'transparent'}
              className={`${isDisabled ? 'pointer-events-none opacity-50 cursor-default' : 'cursor-pointer hover:opacity-70'} transition-all`}
              onClick={(e) => { if (!isDisabled) handleSectorClick(number, 'right', e); }}
            >
              <title>{getFaceName(number, 'right')}</title>
            </polygon>
            
            {/* Centro: una sola cara (oclusal/incisal) */}
            <rect
              x={position.x + 11}
              y={position.y + 11}
              width="22"
              height="22"
              fill={getDisplayedSectorColor(number, 'center') || 'transparent'}
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
            {getDisplayedSectorColor(number, 'topUpper') && (
              <polygon
                points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y + 6} ${position.x},${position.y + 6}`}
                fill={getDisplayedSectorColor(number, 'topUpper') || undefined}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'topUpper')}
              >
                <title>{getFaceName(number, 'topUpper')}</title>
              </polygon>
            )}
            {getDisplayedSectorColor(number, 'topLower') && (
              <polygon
                points={`${position.x + 11},${position.y + 11} ${position.x + 33},${position.y + 11} ${position.x + 44},${position.y} ${position.x},${position.y}`}
                fill={getDisplayedSectorColor(number, 'topLower') || undefined}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'topLower')}
              >
                <title>{getFaceName(number, 'topLower')}</title>
              </polygon>
            )}
            {getDisplayedSectorColor(number, 'bottom') && (
              <polygon
                points={`${position.x + 11},${position.y + 33} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44} ${position.x},${position.y + 44}`}
                fill={getDisplayedSectorColor(number, 'bottom') || undefined}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'bottom')}
              >
                <title>{getFaceName(number, 'bottom')}</title>
              </polygon>
            )}
            {getDisplayedSectorColor(number, 'left') && (
              <polygon
                points={`${position.x},${position.y} ${position.x + 11},${position.y + 11} ${position.x + 11},${position.y + 33} ${position.x},${position.y + 44}`}
                fill={getDisplayedSectorColor(number, 'left') || undefined}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'left')}
              >
                <title>{getFaceName(number, 'left')}</title>
              </polygon>
            )}
            {getDisplayedSectorColor(number, 'right') && (
              <polygon
                points={`${position.x + 44},${position.y} ${position.x + 33},${position.y + 11} ${position.x + 33},${position.y + 33} ${position.x + 44},${position.y + 44}`}
                fill={getDisplayedSectorColor(number, 'right') || undefined}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'right')}
              >
                <title>{getFaceName(number, 'right')}</title>
              </polygon>
            )}
            {getDisplayedSectorColor(number, 'center') && (
              <rect
                x={position.x + 11}
                y={position.y + 11}
                width="22"
                height="22"
                fill={getDisplayedSectorColor(number, 'center') || undefined}
                className="cursor-pointer"
                onClick={() => openViewFor(number, 'center')}
              >
                <title>{getFaceName(number, 'center')}</title>
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
        {getDisplayedExtractionColor(number) && (
          <>
            <line
              x1={position.x + 5}
              y1={position.y + 5}
              x2={position.x + 39}
              y2={position.y + 39}
              stroke={getDisplayedExtractionColor(number) || extractionColor}
              strokeWidth="3"
              className="pointer-events-none"
            />
            <line
              x1={position.x + 39}
              y1={position.y + 5}
              x2={position.x + 5}
              y2={position.y + 39}
              stroke={getDisplayedExtractionColor(number) || extractionColor}
              strokeWidth="3"
              className="pointer-events-none"
            />
          </>
        )}
        
        {/* Círculo para coronas - superpuesto y centrado al diente */}
        {getDisplayedCrownColor(number) && (
          <circle
            cx={position.x + 22}
            cy={position.y + 22}
            r="16"
            fill="none"
            stroke={getDisplayedCrownColor(number) || crownColor}
            strokeWidth="3"
            className="pointer-events-none"
          />
        )}

        {/* Líneas paralelas para prótesis - superpuestas al diente */}
        {getDisplayedProsthesisColor(number) && (
          <>
            {/* Primera línea paralela */}
            <line
              x1={position.x + 8}
              y1={position.y + 18}
              x2={position.x + 36}
              y2={position.y + 18}
              stroke={getDisplayedProsthesisColor(number) || prosthesisColor}
              strokeWidth="3"
              className="pointer-events-none"
            />
            {/* Segunda línea paralela */}
            <line
              x1={position.x + 8}
              y1={position.y + 26}
              x2={position.x + 36}
              y2={position.y + 26}
              stroke={getDisplayedProsthesisColor(number) || prosthesisColor}
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
                      const added = addProcedure(
                        selectedTooth,
                        selectedSector,
                        newProcedureDate,
                        planProcedureName.trim(),
                        planNotes || undefined
                      );
                      if (!added) return;
                      setPlanProcedureCode('');
                      setPlanProcedureName('');
                      setPlanNotes('');
                      setSelectedTooth(null);
                      setSelectedSector(null);
                      // Evita que crown/sector/extracción sigan activos y se apliquen al siguiente diente sin re-elegir procedimiento
                      setSectorMode(false);
                      setCrownMode(false);
                      setProsthesisMode(false);
                      setExtractionMode(false);
                      setShowProcedureDropdown(false);
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
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded border border-gray-400"></div>
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Obturación</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 rounded-full"></div>
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Corona</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-t-2 border-b-2 border-green-600"></div>
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Prótesis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-red-600 text-lg font-bold leading-none">✕</div>
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Extracción</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-400 rounded border border-gray-400"></div>
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Ausente</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
