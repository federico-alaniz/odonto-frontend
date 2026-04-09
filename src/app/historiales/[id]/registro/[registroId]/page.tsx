'use client';

import { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { useParams, useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { ArrowLeft, Info, User, Calendar, Stethoscope, Activity, Pill, ClipboardList, FileText, Printer } from 'lucide-react';
import medicalRecordsService, { MedicalRecord } from '@/services/medicalRecords';
import { dateHelper } from '@/utils/date-helper';
import { patientsService } from '@/services/api/patients.service';
import { usersService } from '@/services/api/users.service';
import { useAuth } from '@/hooks/useAuth';
import Odontogram from '../../../components/Odontogram';
import ImageViewerModal from '../../../modals/ImageViewerModal';
import printOdontogram from '@/components/pdf/printOdontogram';

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

  const handlePrintOdontogram = async () => {
    if (!clinicId) {
      alert('No se pudo obtener la clínica');
      return;
    }

    try {
      if (!registro) {
        alert('No hay registro médico disponible para imprimir.');
        return;
      }

      const doctorFullName = doctorName || 'N/A';
      const doctorMatricula = doctorLicense || '';

      await printOdontogram({
        patient,
        patientName: patient?.nombreCompleto || '',
        consultationDate: registro.fecha,
        doctorName: doctorFullName,
        doctorMatricula,
        odontogramConditions: registro.odontogramas?.actual || [],
        observaciones: registro.observaciones || ''
      });
    } catch (error) {
      console.error('❌ Error al imprimir odontograma:', error);
      alert('Error al generar la impresión. Intente nuevamente.');
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
      'general': 'Consulta General',
      'odontologia': 'Odontología',
      'pediatria': 'Pediatría',
      'cardiologia': 'Cardiología',
      'traumatologia': 'Traumatología',
      'ginecologia': 'Ginecología',
      'dermatologia': 'Dermatología',
      'neurologia': 'Neurología',
      'psiquiatria': 'Psiquiatría',
      'oftalmologia': 'Oftalmología'
    };
    return types[type] || type;
  };

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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="text-sm">Imprimir Odontograma</span>
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
        {registro.tipoConsulta === 'odontologia' && registro.odontogramas && (
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