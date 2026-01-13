'use client';

import { useState, useEffect, useMemo } from 'react';
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

export default function NewMedicalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { buildPath } = useTenant();
  const { currentUser } = useAuth();
  const patientId = params.id as string;
  const appointmentId = searchParams.get('appointmentId');
  const { showSuccess, showError } = useToast();

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
  const [currentOdontogram, setCurrentOdontogram] = useState<ToothCondition[]>([]);
  const [extractedTeeth, setExtractedTeeth] = useState<number[]>([]);
  
  // Tipo de consulta - Por defecto odontología ya que es la única especialidad del sistema
  const [consultationType, setConsultationType] = useState<'general' | 'odontologia'>('odontologia');
  
  // Estado para paciente y cita
  const [patient, setPatient] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);

  const clinicId = useMemo(() => {
    return (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  }, [currentUser?.id]);

  const userId = useMemo(() => {
    return (currentUser as any)?.id;
  }, [currentUser?.id]);

  // Cargar datos del paciente y registro borrador si existe
  useEffect(() => {
    const loadPatient = async () => {
      if (!clinicId) {
        console.log('⏳ Esperando clinicId...');
        return;
      }

      try {
        setLoading(true);
        const response = await patientsService.getPatientById(patientId, clinicId);
        if (response.success) {
          setPatient(response.data);
        } else {
          console.error('Paciente no encontrado');
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
          
          // Mantener tipo de consulta como odontología (sistema exclusivo de odontología)
          setConsultationType('odontologia');
          setShowDatosOdonto(true);
          setShowOdontogramas(true);
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
              setCurrentOdontogram(draftRecord.odontogramas.actual);
            }

            showSuccess('Borrador cargado', 'Se ha cargado el registro médico borrador de esta consulta');
          } else if (appointmentData?.motivo) {
            // Si no hay borrador, pre-llenar el motivo de consulta con el motivo de la cita
            setFormData(prev => ({
              ...prev,
              motivoConsulta: appointmentData.motivo
            }));
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

          response.data
            .filter((record: any) => !record.estadoRegistro || record.estadoRegistro === 'guardado')
            .forEach((record: any) => {
              if (record.odontogramas?.actual) {
                record.odontogramas.actual.forEach((condition: any) => {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    
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
  };

  // Función para guardar como borrador
  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);

      const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
      const userId = (currentUser as any)?.id;

      if (!clinicId || !userId) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      // Preparar datos para enviar
      const recordData = {
        pacienteId: patientId,
        doctorId: userId,
        appointmentId: appointmentId || undefined,
        fecha: formData.fecha,
        tipoConsulta: consultationType as 'general' | 'odontologia',
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
        throw new Error('No se pudo obtener la información del usuario');
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del paciente...</p>
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
                onClick={() => router.back()}
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
                onClick={handleSaveDraft}
                disabled={savingDraft || saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingDraft ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Guardar Borrador
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || savingDraft}
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
                <p className="text-sm text-gray-900 font-semibold">{patient.seguroMedico?.empresa || 'Sin cobertura'}</p>
                {patient.seguroMedico?.numeroPoliza && (
                  <p className="text-xs text-gray-600">N° {patient.seguroMedico.numeroPoliza}</p>
                )}
              </div>
            </div>
          </div>

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
          {consultationType === 'odontologia' && (
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
                          onUpdate={setCurrentOdontogram}
                          readOnly={false}
                          showLegend={false}
                          interventionColor="blue"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnóstico
                  </label>
                  <textarea
                    value={formData.diagnostico}
                    onChange={(e) => handleInputChange('diagnostico', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                    placeholder="Diagnóstico presuntivo o definitivo..."
                  />
                </div>
              )}

              {clinicalTab === 'tratamiento' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tratamiento
                  </label>
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
                onClick={() => router.back()}
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
    </div>
  );
}
