'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Heart, AlertCircle, Users as UsersIcon, Shield } from 'lucide-react';
import { patientsService, CreatePatientData } from '@/services/api/patients.service';

export default function NewPatientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreatePatientData>({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'dni',
    numeroDocumento: '',
    fechaNacimiento: '',
    genero: 'masculino',
    telefono: '',
    email: '',
    direccion: {
      calle: '',
      numero: '',
      ciudad: '',
      provincia: '',
      codigoPostal: ''
    },
    tipoSangre: '',
    alergias: [],
    medicamentosActuales: [],
    antecedentesPersonales: [],
    antecedentesFamiliares: [],
    contactoEmergencia: {
      nombre: '',
      telefono: '',
      relacion: ''
    },
    seguroMedico: {
      empresa: '',
      numeroPoliza: '',
      vigencia: ''
    }
  });

  const [alergiaInput, setAlergiaInput] = useState('');
  const [medicamentoInput, setMedicamentoInput] = useState('');
  const [antecedentePersonalInput, setAntecedentePersonalInput] = useState('');
  const [antecedenteFamiliarInput, setAntecedenteFamiliarInput] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof CreatePatientData] as any),
        [field]: value
      }
    }));
  };

  const addToArray = (field: 'alergias' | 'medicamentosActuales' | 'antecedentesPersonales' | 'antecedentesFamiliares', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const removeFromArray = (field: 'alergias' | 'medicamentosActuales' | 'antecedentesPersonales' | 'antecedentesFamiliares', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      // Validaciones básicas
      if (!formData.nombres || !formData.apellidos || !formData.numeroDocumento || !formData.fechaNacimiento || !formData.telefono) {
        alert('Por favor complete todos los campos requeridos (*)');
        return;
      }

      setSaving(true);
      const clinicId = localStorage.getItem('clinicId') || 'CLINIC_001';
      const userId = localStorage.getItem('userId') || 'system';

      const response = await patientsService.createPatient(clinicId, userId, formData);

      if (response.success) {
        alert('Paciente creado exitosamente');
        router.push('/doctor/patients');
      } else {
        throw new Error('Error al crear el paciente');
      }
    } catch (error: any) {
      console.error('Error creando paciente:', error);
      alert(error.message || 'Error al crear el paciente');
    } finally {
      setSaving(false);
    }
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Nuevo Paciente</h1>
                <p className="text-sm text-gray-600 mt-1">Complete la información del paciente</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
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
                  Guardar Paciente
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">

          {/* 1. Información Personal */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombres *
                </label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Juan Carlos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Pérez García"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento *
                </label>
                <select
                  value={formData.tipoDocumento}
                  onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dni">DNI</option>
                  <option value="le">LE</option>
                  <option value="lc">LC</option>
                  <option value="ci">CI</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="extranjero">Extranjero</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  value={formData.numeroDocumento}
                  onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <select
                  value={formData.genero}
                  onChange={(e) => handleInputChange('genero', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Información de Contacto */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-600 rounded-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Información de Contacto</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: +54 9 11 1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: paciente@email.com"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Dirección</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calle
                  </label>
                  <input
                    type="text"
                    value={formData.direccion?.calle}
                    onChange={(e) => handleNestedInputChange('direccion', 'calle', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Av. Corrientes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.direccion?.numero}
                    onChange={(e) => handleNestedInputChange('direccion', 'numero', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.direccion?.ciudad}
                    onChange={(e) => handleNestedInputChange('direccion', 'ciudad', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Buenos Aires"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={formData.direccion?.provincia}
                    onChange={(e) => handleNestedInputChange('direccion', 'provincia', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Buenos Aires"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.direccion?.codigoPostal}
                    onChange={(e) => handleNestedInputChange('direccion', 'codigoPostal', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 1000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Información Médica */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-600 rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Información Médica</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Sangre
                </label>
                <select
                  value={formData.tipoSangre}
                  onChange={(e) => handleInputChange('tipoSangre', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione...</option>
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

              {/* Alergias */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alergias
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={alergiaInput}
                    onChange={(e) => setAlergiaInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('alergias', alergiaInput);
                        setAlergiaInput('');
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Penicilina (presione Enter para agregar)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addToArray('alergias', alergiaInput);
                      setAlergiaInput('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.alergias?.map((alergia, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      {alergia}
                      <button
                        type="button"
                        onClick={() => removeFromArray('alergias', index)}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Medicamentos Actuales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicamentos Actuales
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={medicamentoInput}
                    onChange={(e) => setMedicamentoInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('medicamentosActuales', medicamentoInput);
                        setMedicamentoInput('');
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Ibuprofeno 400mg (presione Enter para agregar)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addToArray('medicamentosActuales', medicamentoInput);
                      setMedicamentoInput('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medicamentosActuales?.map((medicamento, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {medicamento}
                      <button
                        type="button"
                        onClick={() => removeFromArray('medicamentosActuales', index)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Antecedentes Personales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antecedentes Personales
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={antecedentePersonalInput}
                    onChange={(e) => setAntecedentePersonalInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('antecedentesPersonales', antecedentePersonalInput);
                        setAntecedentePersonalInput('');
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Diabetes tipo 2 (presione Enter para agregar)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addToArray('antecedentesPersonales', antecedentePersonalInput);
                      setAntecedentePersonalInput('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.antecedentesPersonales?.map((antecedente, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                    >
                      {antecedente}
                      <button
                        type="button"
                        onClick={() => removeFromArray('antecedentesPersonales', index)}
                        className="hover:text-yellow-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Antecedentes Familiares */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antecedentes Familiares
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={antecedenteFamiliarInput}
                    onChange={(e) => setAntecedenteFamiliarInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('antecedentesFamiliares', antecedenteFamiliarInput);
                        setAntecedenteFamiliarInput('');
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Padre con hipertensión (presione Enter para agregar)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addToArray('antecedentesFamiliares', antecedenteFamiliarInput);
                      setAntecedenteFamiliarInput('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.antecedentesFamiliares?.map((antecedente, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {antecedente}
                      <button
                        type="button"
                        onClick={() => removeFromArray('antecedentesFamiliares', index)}
                        className="hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Contacto de Emergencia */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-600 rounded-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Contacto de Emergencia</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.contactoEmergencia?.nombre}
                  onChange={(e) => handleNestedInputChange('contactoEmergencia', 'nombre', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: María García"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.contactoEmergencia?.telefono}
                  onChange={(e) => handleNestedInputChange('contactoEmergencia', 'telefono', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: +54 9 11 9876-5432"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relación
                </label>
                <input
                  type="text"
                  value={formData.contactoEmergencia?.relacion}
                  onChange={(e) => handleNestedInputChange('contactoEmergencia', 'relacion', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Esposa, Hijo, Hermano"
                />
              </div>
            </div>
          </div>

          {/* 5. Seguro Médico */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Seguro Médico / Obra Social</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa / Obra Social
                </label>
                <input
                  type="text"
                  value={formData.seguroMedico?.empresa}
                  onChange={(e) => handleNestedInputChange('seguroMedico', 'empresa', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: OSDE, Swiss Medical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Póliza / Afiliado
                </label>
                <input
                  type="text"
                  value={formData.seguroMedico?.numeroPoliza}
                  onChange={(e) => handleNestedInputChange('seguroMedico', 'numeroPoliza', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vigencia
                </label>
                <input
                  type="date"
                  value={formData.seguroMedico?.vigencia}
                  onChange={(e) => handleNestedInputChange('seguroMedico', 'vigencia', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-4 pt-6 pb-8">
            <button
              onClick={() => router.back()}
              disabled={saving}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Paciente'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
