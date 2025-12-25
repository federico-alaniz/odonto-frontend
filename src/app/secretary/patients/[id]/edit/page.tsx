'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Phone, 
  Stethoscope, 
  AlertTriangle, 
  Shield,
  Loader2,
  ArrowLeft,
  MapPin,
  Heart,
  Clock,
  Calendar,
  Save
} from 'lucide-react';
import Link from 'next/link';
import { 
  getProvincias, 
  getDepartamentosPorProvincia, 
  getCiudadesPorProvincia
} from '../../../../../utils';
import { patientsService, UpdatePatientData } from '@/services/api/patients.service';

interface EditPatientFormData {
  // Información Personal
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  
  // Dirección
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  
  // Información Médica
  tipoSangre: string;
  alergias: string[];
  medicamentosActuales: string[];
  antecedentesPersonales: string[];
  antecedentesFamiliares: string[];
  
  // Contacto de Emergencia
  contactoEmergenciaNombre: string;
  contactoEmergenciaRelacion: string;
  contactoEmergenciaTelefono: string;
  
  // Seguro Médico
  tieneSeguro: boolean;
  seguroEmpresa: string;
  seguroNumeroPoliza: string;
  seguroVigencia: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { currentUser } = useAuth();
  const patientId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [formData, setFormData] = useState<EditPatientFormData>({
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    calle: '',
    numero: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    tipoSangre: '',
    alergias: [],
    medicamentosActuales: [],
    antecedentesPersonales: [],
    antecedentesFamiliares: [],
    contactoEmergenciaNombre: '',
    contactoEmergenciaRelacion: '',
    contactoEmergenciaTelefono: '',
    tieneSeguro: false,
    seguroEmpresa: '',
    seguroNumeroPoliza: '',
    seguroVigencia: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeSection, setActiveSection] = useState('personal');
  
  // Estados para campos de texto múltiple
  const [alergiaInput, setAlergiaInput] = useState('');
  const [medicamentoInput, setMedicamentoInput] = useState('');
  const [antecedentePersonalInput, setAntecedentePersonalInput] = useState('');
  const [antecedenteFamiliarInput, setAntecedenteFamiliarInput] = useState('');

  // Cargar datos del paciente
  useEffect(() => {
    const loadPatientData = async () => {
      const clinicId = currentUser?.clinicId;
      if (!clinicId || !patientId) {
        router.push('/secretary/patients');
        return;
      }

      try {
        setLoading(true);
        const response = await patientsService.getPatientById(patientId, clinicId);
        
        if (!response?.data) {
          showError('Paciente no encontrado');
          router.push('/secretary/patients');
          return;
        }

        const patient = response.data;
        setPatientData(patient);

        // Poblar el formulario con los datos del paciente
        setFormData({
          nombres: patient.nombres || '',
          apellidos: patient.apellidos || '',
          telefono: patient.telefono || '',
          email: patient.email || '',
          calle: patient.direccion?.calle || '',
          numero: patient.direccion?.numero || '',
          ciudad: patient.direccion?.ciudad || '',
          provincia: patient.direccion?.provincia || '',
          codigoPostal: patient.direccion?.codigoPostal || '',
          tipoSangre: patient.tipoSangre || '',
          alergias: patient.alergias || [],
          medicamentosActuales: patient.medicamentosActuales || [],
          antecedentesPersonales: patient.antecedentesPersonales || [],
          antecedentesFamiliares: patient.antecedentesFamiliares || [],
          contactoEmergenciaNombre: patient.contactoEmergencia?.nombre || '',
          contactoEmergenciaRelacion: patient.contactoEmergencia?.relacion || '',
          contactoEmergenciaTelefono: patient.contactoEmergencia?.telefono || '',
          tieneSeguro: !!patient.seguroMedico,
          seguroEmpresa: patient.seguroMedico?.empresa || '',
          seguroNumeroPoliza: patient.seguroMedico?.numeroPoliza || '',
          seguroVigencia: patient.seguroMedico?.vigencia || ''
        });

      } catch (error: any) {
        console.error('Error loading patient:', error);
        showError(error.message || 'Error al cargar los datos del paciente');
        router.push('/secretary/patients');
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patientId, currentUser, router, showError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addItem = (field: 'alergias' | 'medicamentosActuales' | 'antecedentesPersonales' | 'antecedentesFamiliares', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeItem = (field: 'alergias' | 'medicamentosActuales' | 'antecedentesPersonales' | 'antecedentesFamiliares', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombres.trim()) newErrors.nombres = 'El nombre es requerido';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'El apellido es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Por favor, corrige los errores en el formulario');
      return;
    }

    const clinicId = currentUser?.clinicId;
    const userId = currentUser?.id;
    
    if (!clinicId || !userId) {
      showError('Error de autenticación');
      return;
    }

    try {
      setSubmitting(true);

      const updateData: UpdatePatientData = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        email: formData.email || undefined,
        direccion: {
          calle: formData.calle,
          numero: formData.numero,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
          codigoPostal: formData.codigoPostal
        },
        tipoSangre: formData.tipoSangre || undefined,
        alergias: formData.alergias,
        medicamentosActuales: formData.medicamentosActuales,
        antecedentesPersonales: formData.antecedentesPersonales,
        antecedentesFamiliares: formData.antecedentesFamiliares,
        contactoEmergencia: formData.contactoEmergenciaNombre ? {
          nombre: formData.contactoEmergenciaNombre,
          telefono: formData.contactoEmergenciaTelefono,
          relacion: formData.contactoEmergenciaRelacion
        } : undefined,
        seguroMedico: formData.tieneSeguro && formData.seguroEmpresa ? {
          empresa: formData.seguroEmpresa,
          numeroPoliza: formData.seguroNumeroPoliza,
          vigencia: formData.seguroVigencia
        } : undefined
      };

      await patientsService.updatePatient(patientId, clinicId, userId, updateData);
      
      showSuccess('Paciente actualizado correctamente');
      router.push(`/secretary/patients/${patientId}`);
      
    } catch (error: any) {
      console.error('Error updating patient:', error);
      showError(error.message || 'Error al actualizar el paciente');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del paciente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return null;
  }

  const provincias = getProvincias();
  const ciudades = formData.provincia ? getCiudadesPorProvincia(formData.provincia) : [];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/secretary/patients/${patientId}`}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Paciente</h1>
                <p className="text-gray-600 mt-1">
                  {patientData.nombres} {patientData.apellidos} • {patientData.tipoDocumento.toUpperCase()}: {patientData.numeroDocumento}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Tabs de Secciones */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'personal', label: 'Información Personal', icon: User },
                  { id: 'medical', label: 'Información Médica', icon: Heart },
                  { id: 'emergency', label: 'Contacto de Emergencia', icon: AlertTriangle },
                  { id: 'insurance', label: 'Seguro Médico', icon: Shield }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveSection(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                        activeSection === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Información Personal */}
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.nombres ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.nombres && <p className="text-red-500 text-sm mt-1">{errors.nombres}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellidos <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.apellidos ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.telefono ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Dirección
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Calle</label>
                        <input
                          type="text"
                          name="calle"
                          value={formData.calle}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                        <input
                          type="text"
                          name="numero"
                          value={formData.numero}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                        <select
                          name="provincia"
                          value={formData.provincia}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Seleccionar provincia</option>
                          {provincias.map(prov => (
                            <option key={prov.value} value={prov.value}>{prov.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                        <select
                          name="ciudad"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!formData.provincia}
                        >
                          <option value="">Seleccionar ciudad</option>
                          {ciudades.map(city => (
                            <option key={city.value} value={city.value}>{city.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                        <input
                          type="text"
                          name="codigoPostal"
                          value={formData.codigoPostal}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información Médica */}
              {activeSection === 'medical' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Sangre</label>
                    <select
                      name="tipoSangre"
                      value={formData.tipoSangre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar tipo de sangre</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alergias</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={alergiaInput}
                        onChange={(e) => setAlergiaInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addItem('alergias', alergiaInput);
                            setAlergiaInput('');
                          }
                        }}
                        placeholder="Agregar alergia y presionar Enter"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addItem('alergias', alergiaInput);
                          setAlergiaInput('');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Agregar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.alergias.map((alergia, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          {alergia}
                          <button
                            type="button"
                            onClick={() => removeItem('alergias', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medicamentos Actuales</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={medicamentoInput}
                        onChange={(e) => setMedicamentoInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addItem('medicamentosActuales', medicamentoInput);
                            setMedicamentoInput('');
                          }
                        }}
                        placeholder="Agregar medicamento y presionar Enter"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addItem('medicamentosActuales', medicamentoInput);
                          setMedicamentoInput('');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Agregar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.medicamentosActuales.map((med, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {med}
                          <button
                            type="button"
                            onClick={() => removeItem('medicamentosActuales', index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Antecedentes Personales</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={antecedentePersonalInput}
                        onChange={(e) => setAntecedentePersonalInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addItem('antecedentesPersonales', antecedentePersonalInput);
                            setAntecedentePersonalInput('');
                          }
                        }}
                        placeholder="Agregar antecedente y presionar Enter"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addItem('antecedentesPersonales', antecedentePersonalInput);
                          setAntecedentePersonalInput('');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Agregar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.antecedentesPersonales.map((ant, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {ant}
                          <button
                            type="button"
                            onClick={() => removeItem('antecedentesPersonales', index)}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Antecedentes Familiares</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={antecedenteFamiliarInput}
                        onChange={(e) => setAntecedenteFamiliarInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addItem('antecedentesFamiliares', antecedenteFamiliarInput);
                            setAntecedenteFamiliarInput('');
                          }
                        }}
                        placeholder="Agregar antecedente familiar y presionar Enter"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addItem('antecedentesFamiliares', antecedenteFamiliarInput);
                          setAntecedenteFamiliarInput('');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Agregar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.antecedentesFamiliares.map((ant, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {ant}
                          <button
                            type="button"
                            onClick={() => removeItem('antecedentesFamiliares', index)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Contacto de Emergencia */}
              {activeSection === 'emergency' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                      <input
                        type="text"
                        name="contactoEmergenciaNombre"
                        value={formData.contactoEmergenciaNombre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Relación</label>
                      <input
                        type="text"
                        name="contactoEmergenciaRelacion"
                        value={formData.contactoEmergenciaRelacion}
                        onChange={handleInputChange}
                        placeholder="Ej: Madre, Padre, Hermano/a"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      <input
                        type="tel"
                        name="contactoEmergenciaTelefono"
                        value={formData.contactoEmergenciaTelefono}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Seguro Médico */}
              {activeSection === 'insurance' && (
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="tieneSeguro"
                        checked={formData.tieneSeguro}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">El paciente tiene seguro médico</span>
                    </label>
                  </div>

                  {formData.tieneSeguro && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Empresa de Seguro</label>
                        <input
                          type="text"
                          name="seguroEmpresa"
                          value={formData.seguroEmpresa}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número de Póliza</label>
                        <input
                          type="text"
                          name="seguroNumeroPoliza"
                          value={formData.seguroNumeroPoliza}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vigencia</label>
                        <input
                          type="date"
                          name="seguroVigencia"
                          value={formData.seguroVigencia}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end space-x-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Link
              href={`/secretary/patients/${patientId}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
