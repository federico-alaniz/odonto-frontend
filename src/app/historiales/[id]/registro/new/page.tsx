'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import Odontogram, { ToothCondition } from '../../../components/Odontogram';
import medicalRecordsService from '@/services/medicalRecords';
import { medicalRecordsService as medicalRecordsApiService } from '@/services/api/medical-records.service';
import { patientsService } from '@/services/api/patients.service';
import { appointmentsService } from '@/services/api/appointments.service';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Save,
  FileText,
  Activity,
  Heart,
  Pill,
  TestTube,
  Calendar,
  User,
  Stethoscope,
  ClipboardList,
  Image as ImageIcon,
  X,
  ChevronDown,
  ChevronUp,
  Phone
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { getOdontogramProcedureFaceInitials } from '@/utils/odontogram-face-initials';

export default function NewMedicalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { buildPath } = useTenant();
  const { currentUser, isLoading: authLoading } = useAuth();
  const patientId = params.id as string;
  const appointmentId = searchParams.get('appointmentId');
  const { showSuccess, showError } = useToast();

  // Estado para prevenir navegación accidental
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    motivoConsulta: '',
    anamnesis: '',
    examenFisico: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    proximoControl: '',
    // Signos vitales
    presionArterial: '',
    frecuenciaCardiaca: '',
    temperatura: '',
    peso: '',
    talla: '',
    saturacionOxigeno: '',
    // Odontología específico
    piezasDentales: '',
    procedimiento: '',
    materiales: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Estados de visibilidad de secciones - Odontología por defecto
  const [showInfoGeneral, setShowInfoGeneral] = useState(true);
  const [showMotivoAntecedentes, setShowMotivoAntecedentes] = useState(true);
  const [showDatosOdonto, setShowDatosOdonto] = useState(true);
  const [showOdontogramas, setShowOdontogramas] = useState(true);
  const [showSignosVitales, setShowSignosVitales] = useState(false);
  const [showDiagnostico, setShowDiagnostico] = useState(false);
  const [showTratamiento, setShowTratamiento] = useState(false);
  const [showObservaciones, setShowObservaciones] = useState(false);
  const [showImagenes, setShowImagenes] = useState(false);
  
  // Estado para tabs de odontogramas
  const [odontogramTab, setOdontogramTab] = useState<'actual' | 'historial'>('actual');
  
  // Estado para tabs de información clínica
  const [clinicalTab, setClinicalTab] = useState<'diagnostico' | 'tratamiento' | 'observaciones' | 'imagenes'>('diagnostico');
  
  // Odontogramas
  const [historicalOdontogram, setHistoricalOdontogram] = useState<ToothCondition[]>([]);
  const [historicalProcedureRows, setHistoricalProcedureRows] = useState<any[]>([]);
  const [currentOdontogram, setCurrentOdontogram] = useState<ToothCondition[]>([]);
  const [extractedTeeth, setExtractedTeeth] = useState<number[]>([]);
  // Plan items created in Odontogram (diagnóstico / prestaciones planificadas)
  const [planItems, setPlanItems] = useState<any[]>([]);
  // Procedimientos aplicados en 'Realizar prestaciones' (extraídos del odontograma actual)
  const [performedProcedures, setPerformedProcedures] = useState<any[]>([]);
  const [odontogramEditHandler, setOdontogramEditHandler] = useState<((proc: any) => void) | null>(null);
  const [planRowPendingEditId, setPlanRowPendingEditId] = useState<string | null>(null);
  const [planEditCancelNonce, setPlanEditCancelNonce] = useState(0);

  // Stable register handler to avoid recreating function each render
  const registerEditHandler = useCallback((fn: (proc: any) => void) => {
    setOdontogramEditHandler(() => fn);
  }, []);

  const handlePlanRowEditCommitted = useCallback(() => {
    setPlanRowPendingEditId(null);
  }, []);

  // Helper para obtener dientes extraídos del historial
  const getExtractedTeethFromHistory = async (patientId: string, clinicId: string): Promise<number[]> => {
    try {
      const response = await medicalRecordsApiService.getPatientRecords(patientId, clinicId, 1, 1000);
      if (response.success && response.data) {
        const toothMap = new Map<number, ToothCondition>();
        
        response.data
          .filter((record: any) => !record.estadoRegistro || record.estadoRegistro === 'guardado')
          .forEach((record: any) => {
            if (record.odontogramas?.actual) {
              record.odontogramas.actual.forEach((condition: any) => {
                const existing = toothMap.get(condition.number);
                if (!existing) {
                  toothMap.set(condition.number, { ...condition });
                } else if (condition.status === 'extraction' || condition.status === 'missing') {
                  toothMap.set(condition.number, { ...condition });
                }
              });
            }
          });
        
        const historicalConditions = Array.from(toothMap.values());
        const extracted = historicalConditions
          .filter(condition => condition.status === 'extraction' || condition.status === 'missing')
          .map(condition => condition.number);
        return extracted;
      }
    } catch (error) {
      console.error('Error getting extracted teeth from history:', error);
    }
    return [];
  };

  // Helper para obtener inicial de sector (usa número de diente para distinguir Palatina/Lingual e Incisal/Oclusal)
  const getSectorInitial = (toothNumber: number | string | undefined, sector: string | undefined) => {
    if (!toothNumber || !sector) return '';
    const num = typeof toothNumber === 'string' ? Number(toothNumber) : toothNumber;
    const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
    const lastDigit = num % 10;
    const isAnterior = [1,2,3].includes(lastDigit) || [61,62,63,71,72,73].includes(num);

    switch (sector) {
      case 'left': return 'M';
      case 'right': return 'D';
      case 'top': return 'V';
      case 'bottom': return isUpper ? 'P' : 'L';
      case 'center': return isAnterior ? 'I' : 'O';
      default: return String(sector).toUpperCase();
    }
  };

  const getPlanStatusLabel = (status?: string | null) => {
    if (!status) return '-';
    const s = String(status).toLowerCase();
    if (s === 'planned' || s === 'plan' || s === 'pending') return 'En Plan';
    if (s === 'executed' || s === 'done' || s === 'performed' || s === 'realizado') return 'Realizado';
    // fallback: capitalize first letter
    return String(status).charAt(0).toUpperCase() + String(status).slice(1);
  };

  const getPlanBadge = (status?: string | null) => {
    const label = getPlanStatusLabel(status);
    const s = String(status || '').toLowerCase();
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    if (s === 'planned' || s === 'plan' || s === 'pending') {
      return <span className={`${base} bg-amber-100 text-amber-800`}>{label}</span>;
    }
    if (s === 'en_proceso' || s === 'en proceso') {
      return <span className={`${base} bg-blue-100 text-blue-800`}>En Proceso</span>;
    }
    if (s === 'executed' || s === 'done' || s === 'performed' || s === 'realizado') {
      return <span className={`${base} bg-emerald-100 text-emerald-800`}>{label}</span>;
    }
    return <span className={`${base} bg-gray-100 text-gray-800`}>{label}</span>;
  };
  
  // Tipo de consulta - Inicializado con la especialidad del médico actual
  const [consultationType, setConsultationType] = useState<string>('Odontología');

  // Determinar si es una consulta odontológica para mostrar secciones específicas
  const isOdontologia = useMemo(() => {
    const type = consultationType.toLowerCase();
    return type.includes('odonto') || type.includes('diente') || type.includes('bucal');
  }, [consultationType]);
  
  // Estado para paciente y cita
  const [patient, setPatient] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [prefilledFromRecord, setPrefilledFromRecord] = useState<{ id: string; fecha: string } | null>(null);

  const clinicId = useMemo(() => {
    return (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  }, [currentUser?.id]);

  const userId = useMemo(() => {
    return (currentUser as any)?.id;
  }, [currentUser?.id]);

  const getMostRecentSavedRecord = (records: any[]) => {
    return [...records]
      .filter((record: any) => record.estado !== 'eliminado' && (!record.estadoRegistro || record.estadoRegistro === 'guardado'))
      .sort((a: any, b: any) => {
        const primaryA = new Date(a.fecha || a.updatedAt || a.createdAt || 0).getTime();
        const primaryB = new Date(b.fecha || b.updatedAt || b.createdAt || 0).getTime();
        if (primaryB !== primaryA) return primaryB - primaryA;

        const secondaryA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const secondaryB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return secondaryB - secondaryA;
      })[0] || null;
  };

  const applyPreviousClinicalBase = (record: any) => {
    if (!record) return;

    const previousPlan = Array.isArray(record.odontogramas?.plan) ? record.odontogramas.plan : [];
    const previousOdontoData = record.datosOdontologicos || {};
    const hasReusableData = Boolean(
      (record.diagnostico && String(record.diagnostico).trim()) ||
      (record.tratamiento && String(record.tratamiento).trim()) ||
      (previousOdontoData.piezasDentales && String(previousOdontoData.piezasDentales).trim()) ||
      (previousOdontoData.procedimiento && String(previousOdontoData.procedimiento).trim()) ||
      (previousOdontoData.materiales && String(previousOdontoData.materiales).trim()) ||
      previousPlan.length > 0
    );

    if (!hasReusableData) return;

    setFormData((prev) => ({
      ...prev,
      diagnostico: prev.diagnostico.trim() ? prev.diagnostico : (record.diagnostico || ''),
      tratamiento: prev.tratamiento.trim() ? prev.tratamiento : (record.tratamiento || ''),
      piezasDentales: prev.piezasDentales.trim() ? prev.piezasDentales : (previousOdontoData.piezasDentales || ''),
      procedimiento: prev.procedimiento.trim() ? prev.procedimiento : (previousOdontoData.procedimiento || ''),
      materiales: prev.materiales.trim() ? prev.materiales : (previousOdontoData.materiales || ''),
    }));

    if (previousPlan.length > 0) {
      setPlanItems((prev) => (prev.length > 0 ? prev : previousPlan));
    }

    setPrefilledFromRecord({
      id: record.id,
      fecha: record.fecha,
    });
  };

  // Cargar datos del paciente y registro borrador si existe
  useEffect(() => {
    const loadPatient = async () => {
      if (!clinicId) {
        return;
      }

      try {
        setLoading(true);
        const response = await patientsService.getPatientById(patientId, clinicId);
        if (response.success) {
          setPatient(response.data);
        } else {
          console.error('Paciente no encontrado');
          console.log(performedProcedures)
          setPatient(null);
        }
      } catch (error: any) {
        console.error('Error cargando paciente:', error);
        // Si el error es 404, el paciente no existe
        if (error.message.includes('404') || error.message.includes('no encontrado')) {
          setPatient(null);
        } else {
          showError('Error al cargar paciente', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (clinicId) {
      loadPatient();
    }
  }, [patientId, clinicId]);

  // Cargar datos de la cita y registro borrador si existe appointmentId
  useEffect(() => {
    const loadAppointmentAndDraft = async () => {
      if (!clinicId || !appointmentId || !userId) {
        return;
      }

      try {
        // Cargar datos de la cita
        const appointmentsResponse = await appointmentsService.getAppointments(clinicId);
        const appointmentData = appointmentsResponse.data.find((a: any) => a.id === appointmentId);
        
        if (appointmentData) {
          setAppointment(appointmentData);
          
          // Si el registro se crea desde una cita, intentar determinar la especialidad
          // Si el doctor tiene especialidades seteadas, usar la primera
          if (currentUser && currentUser.especialidades && currentUser.especialidades.length > 0) {
            setConsultationType(currentUser.especialidades[0]);
          } else if (localStorage.getItem('userSpecialty')) {
            setConsultationType(localStorage.getItem('userSpecialty')!);
          }
          
          setShowDatosOdonto(isOdontologia);
          setShowOdontogramas(isOdontologia);
        }

        // Intentar cargar registro borrador existente para esta cita
        const recordsResponse = await medicalRecordsApiService.getPatientRecords(patientId, clinicId, 1, 1000);
        
        if (recordsResponse.success && recordsResponse.data) {
          // Buscar registro borrador asociado a esta cita
          const draftRecord = recordsResponse.data.find(record => 
            record.appointmentId === appointmentId && 
            record.estadoRegistro === 'borrador'
          );

          if (draftRecord) {
            // Cargar datos del borrador en el formulario
            setExistingRecordId(draftRecord.id);
            setIsDraft(true);
            setFormData({
              fecha: draftRecord.fecha,
              motivoConsulta: draftRecord.motivoConsulta || '',
              anamnesis: draftRecord.anamnesis || '',
              examenFisico: draftRecord.examenFisico || '',
              diagnostico: draftRecord.diagnostico || '',
              tratamiento: draftRecord.tratamiento || '',
              observaciones: draftRecord.observaciones || '',
              proximoControl: draftRecord.proximaCita || '',
              presionArterial: draftRecord.signosVitales?.presionArterial || '',
              frecuenciaCardiaca: draftRecord.signosVitales?.frecuenciaCardiaca?.toString() || '',
              temperatura: draftRecord.signosVitales?.temperatura?.toString() || '',
              peso: draftRecord.signosVitales?.peso?.toString() || '',
              talla: draftRecord.signosVitales?.altura?.toString() || '',
              saturacionOxigeno: draftRecord.signosVitales?.saturacionOxigeno?.toString() || '',
              piezasDentales: draftRecord.datosOdontologicos?.piezasDentales || '',
              procedimiento: draftRecord.datosOdontologicos?.procedimiento || '',
              materiales: draftRecord.datosOdontologicos?.materiales || ''
            });

            // Solo cargar el odontograma actual del borrador
            // El odontograma histórico se cargará desde el otro useEffect con todos los registros guardados
            if (draftRecord.odontogramas?.actual) {
              // Merge extracted teeth from history with draft odontogram
              const extracted = await getExtractedTeethFromHistory(patientId, clinicId);
              const draftOdontogram = draftRecord.odontogramas.actual;
              const mergedOdontogram = [...draftOdontogram];
              
              // Add extracted teeth that are not already in the draft
              extracted.forEach((toothNumber: number) => {
                if (!mergedOdontogram.find(t => t.number === toothNumber)) {
                  mergedOdontogram.push({
                    number: toothNumber,
                    status: 'missing' as const
                  });
                }
              });
              
              setCurrentOdontogram(mergedOdontogram);
            } else {
              // Si no hay odontograma en el borrador, inicializar con dientes extraídos del historial
              const extracted = await getExtractedTeethFromHistory(patientId, clinicId);
              if (extracted.length > 0) {
                const missingTeeth: ToothCondition[] = extracted.map((number: number) => ({
                  number,
                  status: 'missing' as const
                }));
                setCurrentOdontogram(missingTeeth);
              }
            }
            // Cargar plan odontológico si existe en el borrador
            if (draftRecord.odontogramas?.plan) {
              setPlanItems(draftRecord.odontogramas.plan || []);
            }

            setPrefilledFromRecord(null);

            showSuccess('Borrador cargado', 'Se ha cargado el registro médico borrador de esta consulta');
            setIsDirty(false); // Form starts clean when loading draft
          } else if (appointmentData?.motivo) {
            // Si no hay borrador, pre-llenar el motivo de consulta con el motivo de la cita
            setFormData(prev => ({
              ...prev,
              motivoConsulta: appointmentData.motivo
            }));

            const latestSavedRecord = getMostRecentSavedRecord(recordsResponse.data);
            applyPreviousClinicalBase(latestSavedRecord);
          } else {
            const latestSavedRecord = getMostRecentSavedRecord(recordsResponse.data);
            applyPreviousClinicalBase(latestSavedRecord);
          }
        }
      } catch (error) {
        console.error('Error cargando cita y borrador:', error);
      }
    };

    if (clinicId && userId && appointmentId) {
      loadAppointmentAndDraft();
    }
  }, [appointmentId, clinicId, userId, patientId]);

  useEffect(() => {
    const loadPreviousClinicalBase = async () => {
      if (!clinicId || !patientId || appointmentId) {
        return;
      }

      try {
        const response = await medicalRecordsApiService.getPatientRecords(patientId, clinicId, 1, 1000);
        if (response.success && response.data) {
          const latestSavedRecord = getMostRecentSavedRecord(response.data);
          applyPreviousClinicalBase(latestSavedRecord);
        }
      } catch (error) {
        console.error('Error cargando base clínica previa:', error);
      }
    };

    loadPreviousClinicalBase();
  }, [appointmentId, clinicId, patientId]);

  // Inicializar odontograma actual con dientes extraídos como ausentes
  useEffect(() => {
    if (extractedTeeth.length > 0) {
      const missingTeeth: ToothCondition[] = extractedTeeth.map(number => ({
        number,
        status: 'missing' as const
      }));
      setCurrentOdontogram(missingTeeth);
    }
  }, [extractedTeeth]);

  // Cargar registros médicos previos para construir el odontograma histórico
  useEffect(() => {
    const loadHistoricalOdontogram = async () => {
      if (!clinicId || !patientId) {
        return;
      }

      try {
        const response = await medicalRecordsApiService.getPatientRecords(patientId, clinicId, 1, 1000);
        if (response.success && response.data) {
          // Acumular todas las intervenciones de registros previos guardados (no borradores)
          const toothMap = new Map<number, ToothCondition>();

          const procedureAccumulator: any[] = [];

          response.data
            .filter((record: any) => !record.estadoRegistro || record.estadoRegistro === 'guardado')
            .forEach((record: any) => {
              if (record.odontogramas?.actual) {
                record.odontogramas.actual.forEach((condition: any) => {
                  if (condition.procedures?.length) {
                    condition.procedures.forEach((proc: any) => {
                      procedureAccumulator.push({
                        ...proc,
                        toothNumber: condition.number,
                        sectors: condition.sectors || [],
                      });
                    });
                  }

                  const existing = toothMap.get(condition.number);
                  
                  if (!existing) {
                    // Si el diente no existe en el mapa, agregarlo
                    toothMap.set(condition.number, { ...condition });
                  } else {
                    // Si ya existe, combinar las condiciones
                    // Prioridad: extraction > missing > otros estados > healthy
                    if (condition.status === 'extraction' || condition.status === 'missing') {
                      existing.status = condition.status;
                    } else if (condition.status !== 'healthy' && existing.status === 'healthy') {
                      existing.status = condition.status;
                    }
                    
                    // Combinar sectores afectados
                    if (condition.sectors && condition.sectors.length > 0) {
                      if (!existing.sectors) {
                        existing.sectors = [];
                      }
                      condition.sectors.forEach((sector: any) => {
                        if (!existing.sectors!.some((s: any) => s.sector === sector.sector)) {
                          existing.sectors!.push(sector);
                        }
                      });
                    }
                    
                    // Mantener coronas y prótesis
                    if (condition.hasCrown) {
                      existing.hasCrown = true;
                    }
                    if (condition.hasProsthesis) {
                      existing.hasProsthesis = true;
                    }
                  }
                });
              }
            });

          procedureAccumulator.sort((a, b) => {
            const ta = new Date(a.date || 0).getTime();
            const tb = new Date(b.date || 0).getTime();
            if (ta !== tb) return ta - tb;
            return (a.toothNumber || 0) - (b.toothNumber || 0);
          });
          setHistoricalProcedureRows(procedureAccumulator);

          // Convertir el mapa a array
          const historicalConditions = Array.from(toothMap.values());
          setHistoricalOdontogram(historicalConditions);
          
          // Identificar dientes extraídos o ausentes para marcarlos en el odontograma actual
          const extracted = historicalConditions
            .filter(condition => condition.status === 'extraction' || condition.status === 'missing')
            .map(condition => condition.number);
          setExtractedTeeth(extracted);
        }
      } catch (error) {
        console.error('Error cargando odontograma histórico:', error);
      }
    };

    if (clinicId) {
      loadHistoricalOdontogram();
    }
  }, [patientId, clinicId]);

  // Prevenir navegación accidental cuando el formulario tiene cambios
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  // Funciones para manejar navegación con confirmación
  const handleNavigation = (navigationAction: () => void) => {
    if (isDirty) {
      setPendingNavigation(() => navigationAction);
      setShowConfirmDialog(true);
    } else {
      navigationAction();
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      pendingNavigation();
    }
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  };

  const cancelNavigation = () => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    setIsDirty(true);
    
    // Crear previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // Wrapper para actualizar odontograma y marcar como dirty
  const handleOdontogramUpdate = useCallback((conditions: ToothCondition[]) => {
    setCurrentOdontogram(conditions);
    setIsDirty(true);
    // Extraer procedimientos aplicados para la pestaña Tratamiento
    const procs: any[] = [];
    conditions.forEach((tooth) => {
      (tooth.procedures || []).forEach((p: any, idx: number) => {
        procs.push({
          tooth: tooth.number,
          sector: p.sector || null,
          date: p.date || null,
          procedure: p.procedure || p.name || '',
          procedure_code: p.procedure_code || p.code || p.codigo || null,
          notes: p.notes || p.notas || '',
          procIndex: idx,
          procId: p.id || p.procId || `noid_${tooth.number}_${idx}`
        });
      });
    });
    setPerformedProcedures(procs);
  }, []);

  const handleEditPerformedProcedure = (procId: string) => {
    // If Odontogram exposes an edit handler, prefer loading the procedure into its form for editing
    if (odontogramEditHandler) {
      const proc = performedProcedures.find(p => p.procId === procId);
      if (!proc) return;

      // Switch odontogram to 'realizar prestaciones' mode and pre-fill the form
      odontogramEditHandler({
        id: proc.procId,
        procId: proc.procId,
        tooth: proc.tooth,
        sector: proc.sector,
        date: proc.date,
        procedure: proc.procedure,
        notes: proc.notes,
        mode: 'perform' // ensures odontogram switches to 'realizar prestaciones' tab
      });

      // Mark the matching plan item as 'en_proceso' in the diagnosis table
      const toothNum = Number(proc.tooth);
      const procName = (proc.procedure || '').toLowerCase();
      setPlanItems(prev => prev.map(item => {
        const itemTooth = Number(item.tooth || item.pieza);
        const itemProc = (item.procedure_name || item.nombre || item.name || '').toLowerCase();
        if (itemTooth === toothNum && itemProc === procName &&
            (item.status === 'planned' || item.status === 'plan' || item.status === 'pending' || item.status === 'realizado')) {
          return { ...item, status: 'en_proceso' };
        }
        return item;
      }));

      return;
    }

    // Fallback: inline prompt-based edit
    let foundToothNumber: number | null = null;
    let foundIndex: number | null = null;
    let foundProc: any = null;
    for (const tooth of currentOdontogram) {
      const procs = tooth.procedures || [];
      const idx = procs.findIndex((pp: any) => pp.id === procId || pp.procId === procId);
      if (idx >= 0) {
        foundToothNumber = tooth.number;
        foundIndex = idx;
        foundProc = procs[idx];
        break;
      }
    }
    if (!foundToothNumber || foundIndex === null || !foundProc) return;
    const newName = window.prompt('Editar procedimiento', foundProc.procedure || foundProc.procedure_name || '');
    if (newName === null) return; // cancel
    const newNotes = window.prompt('Editar notas', foundProc.notes || foundProc.notas || '') || '';
    // Update local odontogram state so save persists changes
    setCurrentOdontogram(prev => prev.map(t => {
      if (t.number !== foundToothNumber) return t;
      const procs = (t.procedures || []).slice();
      procs[foundIndex!] = { ...procs[foundIndex!], procedure: newName, notes: newNotes };
      return { ...t, procedures: procs };
    }));
    // Update performedProcedures snapshot
    setPerformedProcedures(prev => prev.map(p => p.procId === procId ? { ...p, procedure: newName, notes: newNotes } : p));
    setIsDirty(true);
  };

  // Función para guardar como borrador
  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);

      const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
      const userId = (currentUser as any)?.id;

      if (!clinicId || !userId) {
        showError('No se pudo obtener la información del usuario', 'Por favor inicia sesión e inténtalo de nuevo');
        setSavingDraft(false);
        return;
      }

      // Preparar datos para enviar
      const recordData = {
        pacienteId: patientId,
        doctorId: userId,
        appointmentId: appointmentId || undefined,
        fecha: formData.fecha,
        tipoConsulta: consultationType,
        estadoRegistro: 'borrador' as 'borrador' | 'guardado',
        motivoConsulta: formData.motivoConsulta,
        anamnesis: formData.anamnesis,
        signosVitales: {
          presionArterial: formData.presionArterial,
          frecuenciaCardiaca: formData.frecuenciaCardiaca ? parseInt(formData.frecuenciaCardiaca) : undefined,
          temperatura: formData.temperatura ? parseFloat(formData.temperatura) : undefined,
          peso: formData.peso ? parseFloat(formData.peso) : undefined,
          altura: formData.talla ? parseFloat(formData.talla) : undefined,
          saturacionOxigeno: formData.saturacionOxigeno ? parseInt(formData.saturacionOxigeno) : undefined,
        },
        examenFisico: formData.examenFisico,
        ...(consultationType === 'odontologia' && {
          datosOdontologicos: {
            motivoConsultaOdontologica: formData.motivoConsulta,
            piezasDentales: formData.piezasDentales,
            procedimiento: formData.procedimiento,
            materiales: formData.materiales,
          },
          odontogramas: {
            historico: historicalOdontogram,
            actual: currentOdontogram,
            plan: planItems,
          },
        }),
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
        observaciones: formData.observaciones,
        proximaCita: formData.proximoControl || undefined,
        imagenes: [],
        documentos: [],
      };

      let response;
      if (existingRecordId) {
        // Actualizar borrador existente
        response = await medicalRecordsApiService.createRecord(clinicId, userId, {
          ...recordData,
          id: existingRecordId
        });
      } else {
        // Crear nuevo borrador
        response = await medicalRecordsApiService.createRecord(clinicId, userId, recordData);
        if (response.success && response.data) {
          setExistingRecordId(response.data.id);
          setIsDraft(true);
        }
      }
      
      if (response.success) {
        showSuccess('Borrador guardado', 'El registro médico se guardó como borrador. Puedes continuar editándolo más tarde');
        setIsDirty(false); // Reset dirty state after successful draft save
      } else {
        throw new Error(response.errors?.[0] || 'Error al guardar borrador');
      }
    } catch (error: any) {
      console.error('Error guardando borrador:', error);
      showError('Error al guardar borrador', error.message || 'Error al guardar el registro médico como borrador');
    } finally {
      setSavingDraft(false);
    }
  };

  // Función para guardar definitivamente
  const handleSave = async () => {
    try {
      setSaving(true);

      const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
      const userId = (currentUser as any)?.id;

      if (!clinicId || !userId) {
        showError('No se pudo obtener la información del usuario', 'Por favor inicia sesión e inténtalo de nuevo');
        setSaving(false);
        return;
      }

      // Preparar datos para enviar
      const recordData = {
        pacienteId: patientId,
        doctorId: userId,
        appointmentId: appointmentId || undefined,
        fecha: formData.fecha,
        tipoConsulta: consultationType as 'general' | 'odontologia',
        estadoRegistro: 'guardado' as 'borrador' | 'guardado',
        motivoConsulta: formData.motivoConsulta,
        anamnesis: formData.anamnesis,
        signosVitales: {
          presionArterial: formData.presionArterial,
          frecuenciaCardiaca: formData.frecuenciaCardiaca ? parseInt(formData.frecuenciaCardiaca) : undefined,
          temperatura: formData.temperatura ? parseFloat(formData.temperatura) : undefined,
          peso: formData.peso ? parseFloat(formData.peso) : undefined,
          altura: formData.talla ? parseFloat(formData.talla) : undefined,
          saturacionOxigeno: formData.saturacionOxigeno ? parseInt(formData.saturacionOxigeno) : undefined,
        },
        examenFisico: formData.examenFisico,
        ...(consultationType === 'odontologia' && {
          datosOdontologicos: {
            motivoConsultaOdontologica: formData.motivoConsulta,
            piezasDentales: formData.piezasDentales,
            procedimiento: formData.procedimiento,
            materiales: formData.materiales,
          },
          odontogramas: {
            historico: historicalOdontogram,
            actual: currentOdontogram,
            plan: planItems,
          },
        }),
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
        observaciones: formData.observaciones,
        proximaCita: formData.proximoControl || undefined,
        imagenes: [],
        documentos: [],
      };

      let response;
      if (existingRecordId) {
        // Actualizar registro existente y cambiar estado a guardado
        response = await medicalRecordsApiService.createRecord(clinicId, userId, {
          ...recordData,
          id: existingRecordId
        });
      } else {
        // Crear nuevo registro guardado
        response = await medicalRecordsApiService.createRecord(clinicId, userId, recordData);
      }
      
      if (response.success) {
        showSuccess('Registro guardado', 'El registro médico se guardó exitosamente');
        setIsDirty(false); // Reset dirty state after successful save
        
        // Si hay una cita asociada, marcarla como completada
        if (appointmentId) {
          try {
            await appointmentsService.updateAppointment(clinicId, userId, appointmentId, {
              estado: 'completada'
            });
            showSuccess('Consulta completada', 'La cita ha sido marcada como completada');
          } catch (appointmentError) {
            console.error('Error al actualizar estado de la cita:', appointmentError);
            // No mostrar error al usuario ya que el registro se guardó correctamente
          }
        }
        
        router.push(`/historiales/${patientId}`);
      } else {
        throw new Error(response.errors?.[0] || 'Error al guardar');
      }
    } catch (error: any) {
      console.error('Error guardando registro:', error);
      showError('Error al guardar', error.message || 'Error al guardar el registro médico');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium">Aguarde un instante...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Paciente no encontrado</h2>
            <p className="text-gray-600 mb-1">
              El paciente con ID <code className="bg-gray-100 px-2 py-1 rounded text-sm">{patientId}</code> no existe en la base de datos.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Por favor, verifica que el ID sea correcto o crea el paciente primero desde la sección de Pacientes.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={() => router.push(buildPath('/doctor/patients'))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a Pacientes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavigation(() => router.back())}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={saving}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isDraft ? 'Editar Registro Médico (Borrador)' : 'Nuevo Registro Médico'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {isDraft ? 'Continúa editando el borrador guardado' : 'Complete la información de la consulta'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving || authLoading || !currentUser}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Registro
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">

          {/* 1. Datos del Paciente */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Datos del Paciente</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <p className="text-2xl font-bold text-gray-900">{patient.nombreCompleto}</p>
                <p className="text-sm text-gray-600 mt-1">{patient.tipoDocumento.toUpperCase()}: {patient.numeroDocumento}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Edad: {patient.edad} años</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{patient.telefono}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Obra Social</p>
                <p className="text-sm text-gray-900 font-semibold">{patient.seguroMedico?.empresa || patient.obraSocial || 'Sin cobertura'}</p>
                {(patient.numeroAfiliado || patient.seguroMedico?.numeroPoliza) && (
                  <p className="text-xs text-gray-600">N° {patient.numeroAfiliado || patient.seguroMedico.numeroPoliza}</p>
                )}
                {(patient.planObraSocial || patient.seguroMedico?.plan || patient.seguroMedico?.planObraSocial) && (
                  <p className="text-xs text-gray-600">Plan: {patient.planObraSocial || patient.seguroMedico?.plan || patient.seguroMedico?.planObraSocial}</p>
                )}
              </div>
            </div>
          </div>

          {prefilledFromRecord && !isDraft && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
              Se precargaron el diagnostico, el tratamiento y la tabla del plan desde la ultima consulta guardada del paciente del {new Date(prefilledFromRecord.fecha).toLocaleDateString('es-AR')}.
            </div>
          )}

          {/* 2. Información General */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowInfoGeneral(!showInfoGeneral)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Información General</h2>
              </div>
              {showInfoGeneral ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showInfoGeneral && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Consulta
                    </label>
                    <div className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-700">
                      {new Date(formData.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Próximo Control
                    </label>
                    <input
                      type="date"
                      value={formData.proximoControl}
                      onChange={(e) => handleInputChange('proximoControl', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Motivo de Consulta y Antecedentes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Motivo de Consulta */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Motivo de Consulta
                    </label>
                    <textarea
                      value={formData.motivoConsulta}
                      onChange={(e) => handleInputChange('motivoConsulta', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                      placeholder="Describa el motivo de la consulta..."
                    />
                  </div>

                  {/* Antecedentes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Antecedentes
                    </label>
                    <textarea
                      value={formData.anamnesis}
                      onChange={(e) => handleInputChange('anamnesis', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                      placeholder="Describa los antecedentes relevantes, síntomas previos, evolución del problema..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Secciones Odontológicas (Solo para consultas odontológicas) */}
          {isOdontologia && (
            <>
          {/* Odontogramas */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowOdontogramas(!showOdontogramas)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Odontogramas</h2>
              </div>
              {showOdontogramas ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showOdontogramas && (
              <div className="border-t border-gray-100">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setOdontogramTab('actual')}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
                      odontogramTab === 'actual'
                        ? 'text-green-700 border-b-3 border-green-600 bg-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Práctica Actual
                  </button>
                  <button
                    onClick={() => setOdontogramTab('historial')}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
                      odontogramTab === 'historial'
                        ? 'text-green-700 border-b-3 border-green-600 bg-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Historial
                  </button>
                </div>

                {/* Tab Content */}
                <div className="px-6 py-6">
                  {odontogramTab === 'actual' && (
                    <div className="w-full">
                      <div className="mb-4">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Consulta Actual</h3>
                        <p className="text-sm text-gray-600">
                          Registre los tratamientos de esta consulta
                        </p>
                      </div>
                      <div className="w-full">
                        <Odontogram
                          initialConditions={currentOdontogram}
                          onUpdate={handleOdontogramUpdate}
                          onPlanChange={setPlanItems}
                          medicalRecordId={existingRecordId || undefined}
                          initialPlan={planItems}
                          readOnly={false}
                          showLegend={false}
                          interventionColor="blue"
                          registerEditHandler={registerEditHandler}
                          onPlanRowEditCommitted={handlePlanRowEditCommitted}
                          planEditCancelNonce={planEditCancelNonce}
                          lockedTeeth={extractedTeeth}
                        />
                      </div>
                    </div>
                  )}

                  {odontogramTab === 'historial' && (
                    <div className="w-full">
                      <div className="mb-4">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Historial de Tratamientos</h3>
                        <p className="text-sm text-gray-600">
                          Registro acumulado de tratamientos previos
                        </p>
                      </div>
                      <div className="w-full">
                        <Odontogram
                          initialConditions={historicalOdontogram}
                          onUpdate={setHistoricalOdontogram}
                          readOnly={true}
                          showLegend={false}
                          interventionColor="red"
                        />
                      </div>

                      <div className="mt-8 border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <ClipboardList className="w-5 h-5 text-red-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Prestaciones del historial</h3>
                        </div>
                        {historicalProcedureRows.length > 0 ? (
                          <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pieza</th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cara</th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Código</th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Procedimiento</th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Notas</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {historicalProcedureRows.map((proc: any, idx: number) => {
                                  const procDate = proc.date ? new Date(proc.date) : null;
                                  const fecha =
                                    procDate && !isNaN(procDate.getTime())
                                      ? procDate.toLocaleDateString('es-AR')
                                      : '—';
                                  return (
                                    <tr
                                      key={`${proc.id || proc.procId || idx}_${proc.toothNumber}_${idx}`}
                                      className="hover:bg-gray-50 transition-colors"
                                    >
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{fecha}</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{proc.toothNumber}</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                        {getOdontogramProcedureFaceInitials(proc.toothNumber, proc.sector, proc.sectors)}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-600">
                                        {proc.code || proc.procedure_code || '—'}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{proc.procedure}</td>
                                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{proc.notes || '—'}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 italic text-sm">No hay prestaciones en el historial acumulado.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
            </>
          )}

          {/* Información Clínica con Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg shadow-sm">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Información Clínica</h2>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50">
              <button
                onClick={() => setClinicalTab('diagnostico')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  clinicalTab === 'diagnostico'
                    ? 'text-purple-700 border-b-3 border-purple-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <TestTube className="w-4 h-4" />
                  <span>Diagnóstico</span>
                </div>
              </button>
              <button
                onClick={() => setClinicalTab('tratamiento')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  clinicalTab === 'tratamiento'
                    ? 'text-purple-700 border-b-3 border-purple-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Pill className="w-4 h-4" />
                  <span>Tratamiento</span>
                </div>
              </button>
              <button
                onClick={() => setClinicalTab('observaciones')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  clinicalTab === 'observaciones'
                    ? 'text-purple-700 border-b-3 border-purple-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Observaciones</span>
                </div>
              </button>
              <button
                onClick={() => setClinicalTab('imagenes')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  clinicalTab === 'imagenes'
                    ? 'text-purple-700 border-b-3 border-purple-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Imágenes</span>
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="px-6 py-6">
              {clinicalTab === 'diagnostico' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diagnóstico</label>
                  {planItems && planItems.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plan odontológico</label>
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                          <thead>
                            <tr className="text-left text-xs text-gray-500">
                              <th className="px-3 py-2">Pieza</th>
                              <th className="px-3 py-2">Cara</th>
                              <th className="px-3 py-2">Código</th>
                              <th className="px-3 py-2">Procedimiento</th>
                              <th className="px-3 py-2">Notas</th>
                              <th className="px-3 py-2">Estado</th>
                              <th className="px-3 py-2">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {planItems.map((p, idx) => {
                              const planRowKey = p.id ?? `plan_row_${idx}`;
                              const isThisRowPlanEditing = planRowPendingEditId === planRowKey;
                              const isPlanTableEditPending = planRowPendingEditId !== null;
                              return (
                              <tr key={planRowKey} className="border-t border-gray-100">
                                <td className="px-3 py-2 text-sm text-gray-700">{p.tooth || p.pieza || '-'}</td>
                                <td className="px-3 py-2 text-sm text-gray-700">{(() => {
                                    const sectorRaw = p.surface || p.sector;
                                    if (!sectorRaw) return '-';
                                    const toothNum = p.tooth || p.pieza;

                                    const mapToInitials = (value: any): string[] | null => {
                                      if (!value && value !== 0) return null;
                                      // Already an initials string like "V - P - M" or "V-P-M"
                                      if (typeof value === 'string') {
                                        const trimmed = value.trim();
                                        const normalized = trimmed.replace(/\s+/g, '');
                                        if (/^[A-Z](?:-[A-Z])*$/.test(normalized)) {
                                          return normalized.split('-');
                                        }
                                        // Single-letter initial
                                        if (/^[A-Z]$/.test(trimmed)) return [trimmed];
                                        // Comma or semicolon separated list (e.g. "top,left" or "V,P")
                                        if (/[,;]/.test(trimmed)) {
                                          const parts = trimmed.split(/[,;]/).map(s => s.trim()).filter(Boolean);
                                          const mapped = parts.map(pv => {
                                            if (/^[A-Z]$/.test(pv)) return pv;
                                            return getSectorInitial(toothNum, pv) || pv;
                                          }).filter(Boolean);
                                          return mapped.length ? mapped : null;
                                        }
                                        // Try mapping known sector key (e.g. 'top' -> 'V')
                                        const single = getSectorInitial(toothNum, trimmed);
                                        return single ? [single] : null;
                                      }

                                      if (Array.isArray(value)) {
                                        const mapped = value.map((el: any) => {
                                          if (!el && el !== 0) return null;
                                          if (typeof el === 'string') {
                                            const t = el.trim();
                                            if (/^[A-Z]$/.test(t)) return t;
                                            return getSectorInitial(toothNum, t) || t;
                                          }
                                          return String(el);
                                        }).filter(Boolean) as string[];
                                        return mapped.length ? mapped : null;
                                      }

                                      return null;
                                    };

                                    const initials = mapToInitials(sectorRaw);
                                    if (!initials || initials.length === 0) return '-';
                                    return initials.join(' - ');
                                  })()}</td>
                                <td className="px-3 py-2 text-sm text-gray-700">{p.procedure_code || p.codigo || p.code || '-'}</td>
                                <td className="px-3 py-2 text-sm text-gray-700">{p.procedure_name || p.nombre || p.name || '-'}</td>
                                <td className="px-3 py-2 text-sm text-gray-700">{p.notes || p.notas || '-'}</td>
                                <td className="px-3 py-2 text-sm">{getPlanBadge(p.status || p.estado)}</td>
                                <td className="px-3 py-2 text-sm text-gray-700">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {(p.status === 'planned' || p.status === 'pending' || p.status === 'plan') && (
                                      <>
                                        <button
                                          type="button"
                                          disabled={isPlanTableEditPending}
                                          onClick={() => {
                                            const toothNum = Number(p.tooth || p.pieza);
                                            if (toothNum && odontogramEditHandler) {
                                              setPlanRowPendingEditId(planRowKey);
                                              odontogramEditHandler({
                                                tooth: toothNum,
                                                sector: p.surface || p.sector,
                                                procedure: p.procedure_name || p.nombre || p.name,
                                                procedure_code: p.procedure_code || p.codigo || p.code,
                                                notes: p.notes || p.notas,
                                                id: planRowKey,
                                              });
                                            }
                                          }}
                                          className={`px-2 py-1 rounded text-sm ${
                                            isPlanTableEditPending
                                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                          }`}
                                        >
                                          {isThisRowPlanEditing ? 'Editando...' : 'Editar'}
                                        </button>
                                        {isThisRowPlanEditing && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setPlanEditCancelNonce((n) => n + 1);
                                              setPlanRowPendingEditId(null);
                                            }}
                                            className="text-xs text-gray-600 hover:text-gray-900 underline"
                                          >
                                            Cancelar
                                          </button>
                                        )}
                                      </>
                                    )}
                                    
                                    {(p.status === 'planned' || p.status === 'pending' || p.status === 'plan') && (
                                      <button
                                        type="button"
                                        disabled={isPlanTableEditPending}
                                        onClick={() => {
                                          if (odontogramEditHandler) {
                                            const toothNum = Number(p.tooth || p.pieza);
                                            if (toothNum) {
                                              console.log('Parent: Realizar Prestación clicked', {
                                                tooth: toothNum,
                                                sector: p.surface || p.sector,
                                                procedure: p.procedure_name || p.nombre || p.name,
                                                mode: 'perform'
                                              });
                                              odontogramEditHandler({
                                                tooth: toothNum,
                                                sector: p.surface || p.sector,
                                                procedure: p.procedure_name || p.nombre || p.name,
                                                procedure_code: p.procedure_code || p.codigo || p.code,
                                                notes: p.notes || p.notas,
                                                id: planRowKey,
                                                mode: 'perform'
                                              });
                                              setPlanItems((prev) =>
                                                prev.map((item, itemIdx) => {
                                                  const itemKey = item.id ?? `plan_row_${itemIdx}`;
                                                  return itemKey === planRowKey
                                                    ? { ...item, status: 'en_proceso' }
                                                    : item;
                                                })
                                              );
                                            }
                                          }
                                        }}
                                        className={`px-2 py-1 rounded text-sm ${
                                          isPlanTableEditPending
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                      >
                                        Realizar Prestación
                                      </button>
                                    )}
                                    
                                    {(p.status === 'en_proceso' || p.status === 'realizado') && (
                                      <span className="text-gray-500 text-sm italic">
                                        {p.status === 'en_proceso' ? 'En proceso' : 'Realizado'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notas de diagnostico</label>
                    <textarea
                      value={formData.diagnostico}
                      onChange={(e) => handleInputChange('diagnostico', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                      placeholder="Resumen clinico, impresion diagnostica y evolucion relevante..."
                    />
                  </div>
                </div>
              )}

              {clinicalTab === 'tratamiento' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento</label>

                  {/* Tabla de prestaciones realizadas en esta sesión (extraídas del odontograma) */}
                  {performedProcedures && performedProcedures.length > 0 ? (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full table-auto border-collapse">
                        <thead>
                          <tr className="text-left text-xs text-gray-500">
                            <th className="px-3 py-2">Fecha</th>
                            <th className="px-3 py-2">Pieza</th>
                            <th className="px-3 py-2">Cara</th>
                            <th className="px-3 py-2">Código</th>
                            <th className="px-3 py-2">Procedimiento</th>
                            <th className="px-3 py-2">Notas</th>
                            <th className="px-3 py-2">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {performedProcedures.map((p, idx) => (
                            <tr key={p.procId || `${p.tooth}_${p.procIndex}_${idx}`} className="border-t border-gray-100">
                                <td className="px-3 py-2 text-sm text-gray-700">{p.date ? new Date(p.date).toLocaleDateString('es-AR') : '-'}</td>
                                <td className="px-3 py-2 text-sm text-gray-700">{p.tooth || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-700">{(() => {
                                  const sectorRaw = p.sector;
                                  if (!sectorRaw) return '-';
                                  if (typeof sectorRaw === 'string') {
                                    const normalized = sectorRaw.replace(/\s+/g, '');
                                    if (/^[A-Z](?:-[A-Z])*$/.test(normalized)) return normalized.split('-').join(' - ');
                                    const mapped = getSectorInitial(p.tooth, sectorRaw as string);
                                    return mapped || '-';
                                  }
                                  if (Array.isArray(sectorRaw)) {
                                    const mapped = sectorRaw.map(s => getSectorInitial(p.tooth, s) || s).filter(Boolean);
                                    return mapped.join(' - ');
                                  }
                                  return '-';
                                })()}</td>
                              <td className="px-3 py-2 text-sm text-gray-700">{p.procedure_code || p.code || p.codigo || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-700">{p.procedure || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-700">{p.notes || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-700">
                                <button
                                  type="button"
                                  onClick={() => handleEditPerformedProcedure(p.procId)}
                                  className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                                >
                                  Editar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mb-4">No hay prestaciones registradas en esta sesión.</div>
                  )}

                  <label className="block text-sm font-medium text-gray-700 mb-2">Notas de Tratamiento</label>
                  <textarea
                    value={formData.tratamiento}
                    onChange={(e) => handleInputChange('tratamiento', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                    placeholder="Medicación, indicaciones, estudios complementarios..."
                  />
                </div>
              )}

              {clinicalTab === 'observaciones' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              )}

              {clinicalTab === 'imagenes' && (
                <div className="space-y-4">
                  <div>
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="text-blue-600 font-medium">Haga clic para subir</span> o arrastre archivos aquí
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 10MB</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end pt-6 pb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavigation(() => router.back())}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Guardar Registro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación para navegación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
              onClick={cancelNavigation}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 rounded-t-xl border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <X className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">¿Salir sin guardar?</h3>
                      <p className="text-sm text-gray-600">Hay cambios sin guardar</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelNavigation}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <p className="text-sm text-gray-700">
                    Tienes cambios sin guardar en el registro médico. Si salís ahora, <span className="font-semibold text-red-700">perderás toda la información ingresada</span>.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={cancelNavigation}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continuar editando
                </button>
                <button
                  onClick={confirmNavigation}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Salir sin guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
