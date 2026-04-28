'use client';

import { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Info, User, Calendar, Stethoscope, Activity, ClipboardList, Printer } from 'lucide-react';
import medicalRecordsService, { MedicalRecord } from '@/services/medicalRecords';
import { dateHelper } from '@/utils/date-helper';
import { patientsService } from '@/services/api/patients.service';
import { usersService } from '@/services/api/users.service';
import { medicalRecordsService as medicalRecordsApiService } from '@/services/api/medical-records.service';
import { useAuth } from '@/hooks/useAuth';
import Odontogram from '../../../components/Odontogram';
import ImageViewerModal from '../../../modals/ImageViewerModal';
import * as ReactDOM from 'react-dom/client';
import { OdontogramTemplate } from '@/components/pdf/OdontogramTemplate';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { getOdontogramProcedureFaceInitials } from '@/utils/odontogram-face-initials';

/**
 * Página de detalle de registro médico (Solo lectura)
 * 
 * IMPORTANTE: Los registros médicos NO deben ser editables para mantener
 * la integridad y trazabilidad de la historia clínica del paciente.
 * 
 * Si se necesita corregir información, se debe implementar un sistema de
 * rectificaciones que mantenga el registro original y agregue una nota
 * de corrección con fecha, usuario y motivo.
 */
export default function RegistroDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const patientId = params.id as string;
  const registroId = params.registroId as string;
  
  const [registro, setRegistro] = useState<MedicalRecord | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [doctorName, setDoctorName] = useState<string>('');
  const [doctorLicense, setDoctorLicense] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Estados para el visor de imágenes
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Estado para tabs de odontogramas
  const [odontogramTab, setOdontogramTab] = useState<'actual' | 'historial'>('actual');

  const clinicId = useMemo(() => {
    return (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  }, [currentUser?.id]);

  useEffect(() => {
    const loadData = async () => {
      if (!clinicId) {
        return;
      }

      try {
        setLoading(true);
        
        // Load patient data
        const patientResponse = await patientsService.getPatientById(patientId, clinicId);
        if (patientResponse.success) {
          setPatient(patientResponse.data);
        }
        
        // Load medical record
        const recordResponse = await medicalRecordsService.getById(registroId, clinicId);
        if (recordResponse.success && recordResponse.data) {
          setRegistro(recordResponse.data);
          
          // Load doctor information if doctorId exists, otherwise use createdBy
          const userIdToLoad = recordResponse.data.doctorId || recordResponse.data.createdBy;
          
          if (userIdToLoad) {
            try {
              if (userIdToLoad === 'system') {
                setDoctorName('N/A');
                setDoctorLicense('');
              } else if (userIdToLoad.includes('@')) {
                const doctorResponse = await usersService.authenticateByEmail(userIdToLoad, clinicId);
                if (doctorResponse.success && doctorResponse.data) {
                  const fullName = doctorResponse.data.name || 
                    `${doctorResponse.data.nombres} ${doctorResponse.data.apellidos}`.trim();
                  setDoctorName(fullName || 'N/A');
                  
                  // Intentar diferentes campos para la matrícula
                  const license = (doctorResponse.data as any).matriculaProfesional || 
                                 (doctorResponse.data as any).matricula || 
                                 (doctorResponse.data as any).license || 
                                 (doctorResponse.data as any).numeroMatricula || '';
                  setDoctorLicense(license);
                } else {
                  setDoctorName('N/A');
                  setDoctorLicense('');
                }
              } else {
                const doctorResponse = await usersService.getUserById(userIdToLoad, clinicId);
                if (doctorResponse.success && doctorResponse.data) {
                  const fullName = doctorResponse.data.name || 
                    `${doctorResponse.data.nombres} ${doctorResponse.data.apellidos}`.trim();
                  setDoctorName(fullName || 'N/A');
                  
                  // Intentar diferentes campos para la matrícula
                  const license = (doctorResponse.data as any).matriculaProfesional || 
                                 (doctorResponse.data as any).matricula || 
                                 (doctorResponse.data as any).license || 
                                 (doctorResponse.data as any).numeroMatricula || '';
                  setDoctorLicense(license);
                } else {
                  setDoctorName('N/A');
                  setDoctorLicense('');
                }
              }
            } catch (error) {
              console.error('❌ Error al cargar información del doctor:', error);
              setDoctorName('N/A');
              setDoctorLicense('');
            }
          } else {
            setDoctorName('N/A');
            setDoctorLicense('');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (clinicId) {
      loadData();
    }
  }, [patientId, registroId, clinicId]);

  const handleBack = () => {
    router.push(`/historiales/${patientId}`);
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintOdontogram = async () => {
    if (!clinicId || !registro) {
      alert('No hay registro médico disponible para imprimir.');
      return;
    }
    if (isPrinting) return;
    setIsPrinting(true);

    // Obtener todas las prestaciones del mes de la consulta
    const consultationDate = new Date(registro.fecha);
    const month = consultationDate.getMonth();
    const year = consultationDate.getFullYear();

    // Recopilar todas las prestaciones de todos los dientes que ocurrieron en este mes
    const monthlyProcedures: any[] = [];
    const odontogramConditions = registro.odontogramas?.actual || [];
    
    odontogramConditions.forEach((tooth: any) => {
      if (tooth.procedures && Array.isArray(tooth.procedures)) {
        tooth.procedures.forEach((proc: any) => {
          const procDate = new Date(proc.date);
          if (procDate.getMonth() === month && procDate.getFullYear() === year) {
            monthlyProcedures.push({ ...proc, toothNumber: tooth.number });
          }
        });
      }
    });

    // Ordenar por día
    monthlyProcedures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const mountDiv = document.createElement('div');
    mountDiv.style.cssText =
      'position:fixed;top:0;left:-10000px;width:794px;' +
      'background:#fff;z-index:-9999;overflow:visible;pointer-events:none;';
    document.body.appendChild(mountDiv);
    const reactRoot = ReactDOM.createRoot(mountDiv);

    try {
      await new Promise<void>((resolve) => {
        reactRoot.render(
          <div style={{ width: '794px', background: '#ffffff' }}>
            <OdontogramTemplate
              patientName={patient?.nombreCompleto || ''}
              patient={patient}
              consultationDate={registro.fecha}
              doctorName={doctorName || 'N/A'}
              doctorMatricula={doctorLicense || ''}
              odontogramConditions={odontogramConditions}
              monthlyProcedures={monthlyProcedures}
              observaciones={registro.observaciones || ''}
              printMode={true}
            />
          </div>
        );
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      if ('fonts' in document) {
        await (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready;
      }

      const canvas = await html2canvas(mountDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;
      const widthRatio = maxWidth / canvas.width;
      const heightRatio = maxHeight / canvas.height;
      const scale = Math.min(widthRatio, heightRatio);
      const renderWidth = canvas.width * scale;
      const renderHeight = canvas.height * scale;
      const offsetX = (pageWidth - renderWidth) / 2;
      const offsetY = (pageHeight - renderHeight) / 2;
      const imageData = canvas.toDataURL('image/png');

      pdf.addImage(imageData, 'PNG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');

      const safePatientName = (patient?.nombreCompleto || 'paciente')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();

      pdf.save(`odontograma_${safePatientName || 'paciente'}_${registroId}.pdf`);

    } catch (error) {
      console.error('❌ Error al generar PDF del odontograma:', error);
      alert('Error al generar el PDF del odontograma. Intente nuevamente.');
    } finally {
      try {
        reactRoot.unmount();
        document.body.removeChild(mountDiv);
      } catch {
        // Ignorar errores de limpieza del DOM temporal.
      }
      setIsPrinting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const parsed = dateHelper.parse(dateString);
    if (!parsed) return 'N/A';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(parsed);
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const parsed = dateHelper.parse(dateString);
    if (!parsed) return 'N/A';

    const hasTime = parsed.getHours() !== 0 || parsed.getMinutes() !== 0;
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    if (hasTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('es-ES', options).format(parsed);
  };

  const getConsultaTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'odontologia': 'Odontología',
      'general': 'General'
    };
    return types[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Memoize consultation procedures for the current record
  const currentProcedures = useMemo(() => {
    if (!registro || !registro.odontogramas?.actual) return [];
    
    const recordProcedures: any[] = [];
    const recordDate = new Date(registro.fecha).toISOString().split('T')[0];
    
    registro.odontogramas.actual.forEach((tooth: any) => {
      if (tooth.procedures && Array.isArray(tooth.procedures)) {
        tooth.procedures.forEach((proc: any) => {
          const procDate = new Date(proc.date).toISOString().split('T')[0];
          if (procDate === recordDate) {
            recordProcedures.push({
              ...proc,
              toothNumber: tooth.number,
              sectors: tooth.sectors || []
            });
          }
        });
      }
    });
    
    return recordProcedures;
  }, [registro]);

  const [historicalProcedures, setHistoricalProcedures] = useState<any[]>([]);

  useEffect(() => {
    const extractFromHistoricoSnapshot = () => {
      if (!registro?.odontogramas?.historico) return [];
      const list: any[] = [];
      registro.odontogramas.historico.forEach((tooth: any) => {
        if (tooth.procedures && Array.isArray(tooth.procedures)) {
          tooth.procedures.forEach((proc: any) => {
            list.push({
              ...proc,
              toothNumber: tooth.number,
              sectors: tooth.sectors || [],
            });
          });
        }
      });
      return list;
    };

    const sortProcList = (list: any[]) =>
      [...list].sort((a, b) => {
        const ta = new Date(a.date || 0).getTime();
        const tb = new Date(b.date || 0).getTime();
        if (ta !== tb) return ta - tb;
        return (a.toothNumber || 0) - (b.toothNumber || 0);
      });

    if (!clinicId || !patientId || !registro?.id) {
      setHistoricalProcedures([]);
      return;
    }

    const loadHistoricalProcedures = async () => {
      try {
        const response = await medicalRecordsApiService.getPatientRecords(patientId, clinicId, 1, 1000);
        if (!response.success || !response.data) {
          setHistoricalProcedures(sortProcList(extractFromHistoricoSnapshot()));
          return;
        }
        const cutoff = new Date(registro.fecha).getTime();
        const list: any[] = [];
        response.data
          .filter(
            (r: any) =>
              (!r.estadoRegistro || r.estadoRegistro === 'guardado') &&
              r.id !== registro.id &&
              new Date(r.fecha).getTime() < cutoff
          )
          .forEach((r: any) => {
            r.odontogramas?.actual?.forEach((tooth: any) => {
              tooth.procedures?.forEach((proc: any) => {
                list.push({
                  ...proc,
                  toothNumber: tooth.number,
                  sectors: tooth.sectors || [],
                });
              });
            });
          });
        const sorted = sortProcList(list);
        setHistoricalProcedures(sorted.length > 0 ? sorted : sortProcList(extractFromHistoricoSnapshot()));
      } catch {
        setHistoricalProcedures(sortProcList(extractFromHistoricoSnapshot()));
      }
    };

    loadHistoricalProcedures();
  }, [clinicId, patientId, registro?.id, registro?.fecha, registro?.odontogramas?.historico]);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando registro..." />
      </div>
    );
  }

  if (!registro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Registro médico no encontrado</h2>
          <p className="text-gray-600 mb-4">El registro médico que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Volver a Historia Clínica
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Registro Médico</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {patient?.nombreCompleto || 'Paciente'} • {formatDate(registro.fecha)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={handlePrintOdontogram}
                disabled={isPrinting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                {isPrinting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span className="text-sm">Generando PDF...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span className="text-sm">Imprimir Odontograma</span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Info className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800 font-medium">Registro de solo lectura</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <span>Gestión</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">Historiales Clínicos</span>
            <span>•</span>
            <span>{patient?.nombreCompleto || 'Paciente'}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
          
        {/* Información General */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Información de la Consulta</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Datos generales del registro médico</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Fecha</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{formatDate(registro.fecha)}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Tipo de Consulta</label>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{getConsultaTypeLabel(registro.tipoConsulta)}</p>
                </div>
              </div>
              
              {doctorName && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Odontólogo</label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{doctorName}</p>
                      {doctorLicense && (
                        <p className="text-sm text-gray-600">Matrícula: {doctorLicense}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Creado</label>
                <p className="text-sm text-gray-600">{formatDateTime(registro.createdAt)}</p>
              </div>
            </div>
            
            {/* Motivo de Consulta */}
            {registro.motivoConsulta && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de Consulta</label>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">{registro.motivoConsulta}</p>
              </div>
            )}
          </div>
        </div>

        {/* Anamnesis */}
        {registro.anamnesis && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Anamnesis</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Historia clínica del paciente</p>
            </div>
            <div className="p-6">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.anamnesis}</p>
            </div>
          </div>
        )}

        {/* Diagnóstico y Tratamiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {registro.diagnostico && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Diagnóstico</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">Diagnóstico médico establecido</p>
              </div>
              <div className="p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.diagnostico}</p>
              </div>
            </div>
          )}
          
          {registro.tratamiento && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Tratamiento</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">Plan de tratamiento recomendado</p>
              </div>
              <div className="p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.tratamiento}</p>
              </div>
            </div>
          )}
        </div>

        {/* Signos Vitales */}
        {registro.signosVitales && registro.signosVitales.presionArterial && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">Signos Vitales</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Mediciones de signos vitales</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {registro.signosVitales.presionArterial && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-red-600">{registro.signosVitales.presionArterial}</div>
                    <div className="text-sm text-gray-600">Presión Arterial</div>
                    <div className="text-xs text-gray-500">mmHg</div>
                  </div>
                )}
                {registro.signosVitales.frecuenciaCardiaca && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-blue-600">{registro.signosVitales.frecuenciaCardiaca}</div>
                    <div className="text-sm text-gray-600">Frecuencia Cardíaca</div>
                    <div className="text-xs text-gray-500">bpm</div>
                  </div>
                )}
                {registro.signosVitales.temperatura && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-green-600">{registro.signosVitales.temperatura}</div>
                    <div className="text-sm text-gray-600">Temperatura</div>
                    <div className="text-xs text-gray-500">°C</div>
                  </div>
                )}
                {registro.signosVitales.peso && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-purple-600">{registro.signosVitales.peso}</div>
                    <div className="text-sm text-gray-600">Peso</div>
                    <div className="text-xs text-gray-500">kg</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Examen Físico */}
        {registro.examenFisico && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Examen Físico</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Hallazgos del examen físico</p>
            </div>
            <div className="p-6">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.examenFisico}</p>
            </div>
          </div>
        )}

        {/* Odontogramas con Tabs - Solo para especialidad odontología */}
        {registro.tipoConsulta && (registro.tipoConsulta.toLowerCase().includes('odonto') || 
         registro.tipoConsulta.toLowerCase().includes('diente') || 
         registro.tipoConsulta.toLowerCase().includes('bucal')) && registro.odontogramas && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Odontogramas</h3>
                  <p className="text-sm text-gray-600 mt-1">Estado dental del paciente</p>
                </div>
              </div>
            </div>
            
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
                    <h4 className="text-base font-semibold text-gray-900 mb-1">Consulta Actual</h4>
                    <p className="text-sm text-gray-600">
                      Tratamientos realizados en esta consulta
                    </p>
                  </div>
                  <div className="w-full">
                    <Odontogram
                      initialConditions={registro.odontogramas.actual || []}
                      onUpdate={() => {}} // Solo lectura
                      readOnly={true}
                      showLegend={false}
                      interventionColor="blue"
                    />
                  </div>

                  {/* Tabla de Prestaciones Realizadas */}
                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Prestaciones Realizadas en esta Consulta</h4>
                    </div>
                    
                    {currentProcedures.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Día</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pieza</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cara</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Código</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Procedimiento</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Notas</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {currentProcedures.map((proc: any, idx: number) => {
                              const procDate = new Date(proc.date);
                              const day = !isNaN(procDate.getTime()) ? String(procDate.getDate()).padStart(2, '0') : '';
                              return (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{day}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{proc.toothNumber}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {getOdontogramProcedureFaceInitials(proc.toothNumber, proc.sector, proc.sectors)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                    {proc.code || proc.procedure_code || '---'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proc.procedure}</td>
                                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{proc.notes || '---'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 italic">No se registraron prestaciones específicas en esta consulta.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {odontogramTab === 'historial' && (
                <div className="w-full">
                  <div className="mb-4">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">Historial de Tratamientos</h4>
                    <p className="text-sm text-gray-600">
                      Registro acumulado de tratamientos previos
                    </p>
                  </div>
                  <div className="w-full">
                    <Odontogram
                      initialConditions={registro.odontogramas.historico || []}
                      onUpdate={() => {}} // Solo lectura
                      readOnly={true}
                      showLegend={false}
                      interventionColor="red"
                    />
                  </div>

                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ClipboardList className="w-5 h-5 text-red-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Prestaciones del historial</h4>
                    </div>
                    {historicalProcedures.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pieza</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cara</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Código</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Procedimiento</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Notas</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {historicalProcedures.map((proc: any, idx: number) => {
                              const procDate = proc.date ? new Date(proc.date) : null;
                              const fecha =
                                procDate && !isNaN(procDate.getTime())
                                  ? procDate.toLocaleDateString('es-AR')
                                  : '—';
                              return (
                                <tr key={`${proc.id || proc.procId || idx}_${proc.toothNumber}_${idx}`} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{fecha}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{proc.toothNumber}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {getOdontogramProcedureFaceInitials(proc.toothNumber, proc.sector, proc.sectors)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                    {proc.code || proc.procedure_code || '—'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proc.procedure}</td>
                                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{proc.notes || '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 italic">No hay prestaciones registradas en el historial acumulado.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {registro.tipoConsulta === 'odontologia' && registro.odontogramas && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-900">Observaciones</h3>
            </div>
            <div className="p-6">
              {registro.observaciones?.trim() ? (
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">{registro.observaciones}</p>
              ) : (
                <p className="text-gray-600 italic">Sin observaciones.</p>
              )}
            </div>
          </div>
        )}

        {/* Imágenes */}
        {registro.imagenes && registro.imagenes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Imágenes</h3>
                </div>
                <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {registro.imagenes.length} {registro.imagenes.length === 1 ? 'imagen' : 'imágenes'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Imágenes adjuntas al registro</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {registro.imagenes.map((image, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-gray-50">
                    <div className="p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{image.nombre || `Imagen ${index + 1}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Viewer Modal */}
        {registro.imagenes && registro.imagenes.length > 0 && (
          <ImageViewerModal
            images={registro.imagenes.map((img, idx) => ({
              id: `img-${idx}`,
              name: img.nombre,
              description: '',
              type: img.tipo === 'imagen' ? 'otro' : 'otro',
              url: img.url,
              uploadDate: img.fecha
            }))}
            initialIndex={selectedImageIndex}
            isOpen={imageViewerOpen}
            onClose={() => setImageViewerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
