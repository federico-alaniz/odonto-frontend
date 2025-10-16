'use client';

import { useState, useMemo } from 'react';
import PatientHistoryList from './components/PatientHistoryList';
import HistoryDetailModal from './modals/HistoryDetailModal';
import NewHistoryModal from './modals/NewHistoryModal';
import EditHistoryModal from './modals/EditHistoryModal';

// Interfaz para un registro de historia clínica
export interface MedicalHistory {
  id: string;
  patientId: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    age: number;
    dni: string;
  };
  consultationDate: string;
  consultationTime: string;
  doctor: string;
  specialty: 'clinica-medica' | 'pediatria' | 'cardiologia' | 'traumatologia' | 'ginecologia' | 'dermatologia' | 'neurologia' | 'psiquiatria' | 'odontologia' | 'oftalmologia' | 'otorrinolaringologia' | 'urologia' | 'endocrinologia' | 'gastroenterologia' | 'nefrologia' | 'neumologia';
  type: 'consultation' | 'followup' | 'emergency' | 'checkup' | 'surgery' | 'therapy';
  diagnosis: string;
  symptoms: string;
  treatment: string;
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  notes?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  diagnosticImages?: {
    id: string;
    name: string;
    description?: string;
    type: 'radiografia' | 'ecografia' | 'tomografia' | 'resonancia' | 'endoscopia' | 'laboratorio' | 'otro';
    url: string;
    uploadDate: string;
  }[];
  odontogram?: {
    id: number;
    status: 'healthy' | 'caries' | 'filling' | 'crown' | 'extraction' | 'root_canal' | 'implant' | 'missing';
    notes?: string;
  }[];
  nextAppointment?: string;
  status: 'active' | 'follow_up' | 'closed';
  createdAt: string;
}

// Datos de muestra de historias clínicas
const sampleHistories: MedicalHistory[] = [
  {
    id: 'hist_001',
    patientId: 'pat_001',
    patient: {
      firstName: 'María Elena',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '3001234567',
      age: 45,
      dni: '12345678'
    },
    consultationDate: '2025-10-15',
    consultationTime: '08:00',
    doctor: 'Dr. Carlos Mendoza',
    specialty: 'cardiologia',
    type: 'consultation',
    diagnosis: 'Hipertensión arterial leve',
    symptoms: 'Dolor de cabeza persistente, mareos ocasionales y fatiga general',
    treatment: 'Control dietético y medicación antihipertensiva',
    medications: [
      {
        name: 'Enalapril',
        dosage: '10mg',
        frequency: '1 vez al día',
        duration: '30 días'
      },
      {
        name: 'Amlodipino',
        dosage: '5mg',
        frequency: '1 vez al día',
        duration: '30 días'
      }
    ],
    vitalSigns: {
      bloodPressure: '145/90',
      heartRate: 78,
      temperature: 36.5,
      weight: 68,
      height: 165
    },
    notes: 'Paciente refiere síntomas desde hace 2 semanas. Se recomienda control en 15 días y dieta baja en sodio.',
    attachments: [
      {
        id: 'att_001',
        name: 'Electrocardiograma.pdf',
        type: 'documento',
        url: '/files/ecg_001.pdf'
      }
    ],
    diagnosticImages: [
      {
        id: 'img_001',
        name: 'Radiografia_Torax_PA.jpg',
        description: 'Radiografía de tórax PA - Control rutinario cardiológico',
        type: 'radiografia',
        url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800',
        uploadDate: '2025-10-15T08:15:00Z'
      },
      {
        id: 'img_002', 
        name: 'ECG_12_Derivaciones.jpg',
        description: 'Electrocardiograma 12 derivaciones - Ritmo sinusal normal',
        type: 'otro',
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
        uploadDate: '2025-10-15T08:20:00Z'
      }
    ],
    nextAppointment: '2025-10-30',
    status: 'follow_up',
    createdAt: '2025-10-15T08:00:00Z'
  },
  {
    id: 'hist_002',
    patientId: 'pat_002',
    patient: {
      firstName: 'Juan Carlos',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
      phone: '3109876543',
      age: 38,
      dni: '87654321'
    },
    consultationDate: '2025-10-14',
    consultationTime: '10:30',
    doctor: 'Dr. Ana Rodríguez',
    specialty: 'traumatologia',
    type: 'followup',
    diagnosis: 'Seguimiento post-operatorio - Apendicectomía',
    symptoms: 'Dolor leve en sitio quirúrgico',
    treatment: 'Curación de herida y analgesia',
    medications: [
      {
        name: 'Ibuprofeno',
        dosage: '400mg',
        frequency: 'Cada 8 horas',
        duration: '5 días'
      }
    ],
    vitalSigns: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 36.8,
      weight: 75
    },
    notes: 'Evolución favorable post-cirugía. Herida en buen estado de cicatrización.',
    attachments: [],
    diagnosticImages: [
      {
        id: 'img_003',
        name: 'Ecografia_Abdomen.jpg',
        description: 'Ecografía abdominal post-operatoria - Sin complicaciones',
        type: 'ecografia',
        url: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800',
        uploadDate: '2025-10-14T10:45:00Z'
      }
    ],
    nextAppointment: '2025-10-21',
    status: 'follow_up',
    createdAt: '2025-10-14T10:30:00Z'
  },
  {
    id: 'hist_003',
    patientId: 'pat_003',
    patient: {
      firstName: 'Ana María',
      lastName: 'López',
      email: 'ana.lopez@email.com',
      phone: '3156789012',
      age: 52,
      dni: '11223344'
    },
    consultationDate: '2025-10-13',
    consultationTime: '14:15',
    doctor: 'Dr. Carlos Mendoza',
    specialty: 'cardiologia',
    type: 'checkup',
    diagnosis: 'Evaluación cardiológica de rutina',
    symptoms: 'Asintomática',
    treatment: 'Electrocardiograma y ecocardiograma',
    medications: [],
    vitalSigns: {
      bloodPressure: '130/85',
      heartRate: 68,
      temperature: 36.2,
      weight: 62,
      height: 158
    },
    notes: 'Exámenes cardiológicos dentro de parámetros normales. Continuar con controles anuales.',
    attachments: [
      {
        id: 'att_002',
        name: 'Ecocardiograma.pdf',
        type: 'documento',
        url: '/files/eco_001.pdf'
      },
      {
        id: 'att_003',
        name: 'ECG_Resultado.jpg',
        type: 'imagen',
        url: '/files/ecg_img_001.jpg'
      }
    ],
    diagnosticImages: [
      {
        id: 'img_004',
        name: 'Ecocardiograma_Doppler.jpg',
        description: 'Ecocardiograma con Doppler - Función ventricular conservada',
        type: 'otro',
        url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
        uploadDate: '2025-10-13T14:30:00Z'
      },
      {
        id: 'img_005',
        name: 'Radiografia_Torax_Control.jpg',
        description: 'Radiografía de tórax - Control cardiológico anual',
        type: 'radiografia',
        url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
        uploadDate: '2025-10-13T14:25:00Z'
      }
    ],
    nextAppointment: '2026-10-13',
    status: 'closed',
    createdAt: '2025-10-13T14:15:00Z'
  },
  {
    id: 'hist_004',
    patientId: 'pat_004',
    patient: {
      firstName: 'Roberto García',
      lastName: 'Castillo',
      email: 'roberto.garcia@email.com',
      phone: '3007654321',
      age: 41,
      dni: '44556677'
    },
    consultationDate: '2025-10-12',
    consultationTime: '16:45',
    doctor: 'Dr. Ana Rodríguez',
    specialty: 'endocrinologia',
    type: 'consultation',
    diagnosis: 'Control de diabetes mellitus tipo 2',
    symptoms: 'Polidipsia y poliuria',
    treatment: 'Ajuste de medicación hipoglucemiante',
    medications: [
      {
        name: 'Metformina',
        dosage: '850mg',
        frequency: '2 veces al día',
        duration: '90 días'
      }
    ],
    vitalSigns: {
      bloodPressure: '135/88',
      heartRate: 76,
      weight: 82,
      height: 175
    },
    notes: 'Hemoglobina glucosilada en 7.2%. Se ajusta tratamiento. Control en 3 meses.',
    attachments: [
      {
        id: 'att_004',
        name: 'Laboratorio_Glucosa.pdf',
        type: 'laboratorio',
        url: '/files/lab_001.pdf'
      }
    ],
    nextAppointment: '2025-01-12',
    status: 'active',
    createdAt: '2025-10-12T16:45:00Z'
  },
  {
    id: 'hist_005',
    patientId: 'pat_005',
    patient: {
      firstName: 'Carmen',
      lastName: 'Ruiz Martínez',
      email: 'carmen.ruiz@email.com',
      phone: '3128901234',
      age: 33,
      dni: '99887766'
    },
    consultationDate: '2025-10-11',
    consultationTime: '09:30',
    doctor: 'Dr. Carlos Mendoza',
    specialty: 'gastroenterologia',
    type: 'emergency',
    diagnosis: 'Gastroenteritis aguda',
    symptoms: 'Náuseas, vómitos, dolor abdominal y diarrea',
    treatment: 'Hidratación oral y dieta blanda',
    medications: [
      {
        name: 'Ondansetrón',
        dosage: '8mg',
        frequency: 'Cada 8 horas si hay náuseas',
        duration: '3 días'
      },
      {
        name: 'Suero oral',
        dosage: '250ml',
        frequency: 'Cada 2 horas',
        duration: '2 días'
      }
    ],
    vitalSigns: {
      bloodPressure: '110/70',
      heartRate: 88,
      temperature: 37.2
    },
    notes: 'Cuadro compatible con gastroenteritis viral. Mejoría esperada en 48-72 horas. Hidratación adecuada.',
    attachments: [],
    status: 'closed',
    createdAt: '2025-10-11T09:30:00Z'
  },
  {
    id: 'hist_006',
    patientId: 'pat_006',
    patient: {
      firstName: 'Roberto',
      lastName: 'Fernández',
      email: 'roberto.fernandez@email.com',
      phone: '3156789012',
      age: 42,
      dni: '11223344'
    },
    consultationDate: '2025-10-14',
    consultationTime: '16:00',
    doctor: 'Dr. Patricia Vega',
    specialty: 'odontologia',
    type: 'consultation',
    diagnosis: 'Caries dental múltiple y gingivitis leve',
    symptoms: 'Dolor al masticar, sangrado de encías ocasional',
    treatment: 'Limpieza dental, obturación de caries y tratamiento periodontal',
    medications: [
      {
        name: 'Ibuprofeno',
        dosage: '600mg',
        frequency: 'Cada 8 horas si hay dolor',
        duration: '3 días'
      },
      {
        name: 'Enjuague bucal con clorhexidina',
        dosage: '15ml',
        frequency: '2 veces al día',
        duration: '7 días'
      }
    ],
    vitalSigns: {
      bloodPressure: '125/85',
      heartRate: 75
    },
    notes: 'Paciente con historia de pobre higiene bucal. Se recomienda técnica de cepillado y uso de hilo dental diario.',
    odontogram: [
      { id: 16, status: 'caries', notes: 'Caries oclusal moderada' },
      { id: 17, status: 'filling', notes: 'Obturación amalgama antigua' },
      { id: 26, status: 'caries', notes: 'Caries interproximal' },
      { id: 36, status: 'crown', notes: 'Corona porcelana' },
      { id: 46, status: 'filling', notes: 'Obturación composite' },
      { id: 38, status: 'extraction', notes: 'Extracción programada' }
    ],
    attachments: [],
    status: 'active',
    createdAt: '2025-10-14T16:00:00Z'
  }
];

export default function HistorialesPage() {
  const [histories, setHistories] = useState<MedicalHistory[]>(sampleHistories);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('todos');
  const [selectedHistory, setSelectedHistory] = useState<MedicalHistory | null>(null);
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [showNewHistoryModal, setShowNewHistoryModal] = useState(false);
  const [showEditHistoryModal, setShowEditHistoryModal] = useState(false);

  // Filtrar historiales
  const filteredHistories = useMemo(() => {
    return histories.filter(history => {
      const matchesSearch = 
        `${history.patient.firstName} ${history.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.patientId.includes(searchTerm);

      const matchesType = filterType === 'todos' || history.type === filterType;
      const matchesStatus = filterStatus === 'todos' || history.status === filterStatus;
      const matchesSpecialty = filterSpecialty === 'todos' || history.specialty === filterSpecialty;

      return matchesSearch && matchesType && matchesStatus && matchesSpecialty;
    });
  }, [histories, searchTerm, filterType, filterStatus, filterSpecialty]);

  const handleViewHistory = (history: MedicalHistory) => {
    setSelectedHistory(history);
    setShowNewHistoryModal(false); // Cerrar el modal de nueva historia si está abierto
    setShowHistoryDetail(true);
  };

  const handleCreateNewHistory = (newHistory: any) => {
    const historyWithId = {
      ...newHistory,
      id: `hist_${Date.now()}`,
      consultationDate: new Date().toISOString().split('T')[0],
      consultationTime: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    setHistories(prev => [historyWithId, ...prev]);
    setShowNewHistoryModal(false);
  };

  const handleEditHistory = (history: MedicalHistory) => {
    setSelectedHistory(history);
    setShowHistoryDetail(false);
    setShowEditHistoryModal(true);
  };

  const handleUpdateHistory = (updatedHistory: MedicalHistory) => {
    setHistories(prev => prev.map(h => h.id === updatedHistory.id ? updatedHistory : h));
    setShowEditHistoryModal(false);
    setShowHistoryDetail(true); // Volver al modal de detalle
  };

  // Estadísticas
  const stats = {
    total: histories.length,
    activos: histories.filter(h => h.status === 'active').length,
    seguimiento: histories.filter(h => h.status === 'follow_up').length,
    cerrados: histories.filter(h => h.status === 'closed').length
  };

  return (
    <div className="medical-page">
      <div className="medical-page-header">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📋</span>
          <div>
            <h1 className="medical-page-title">Historias Clínicas</h1>
            <p className="medical-page-description">
              Gestión completa de historias clínicas y registros médicos
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setShowHistoryDetail(false); // Cerrar el modal de detalle si está abierto
              setShowNewHistoryModal(true);
            }}
            className="medical-button-primary"
          >
            <span className="mr-2">➕</span>
            Nueva Historia Clínica
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="medical-stat-card">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-slate-600">Total Historias</div>
        </div>
        <div className="medical-stat-card">
          <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
          <div className="text-sm text-slate-600">Activos</div>
        </div>
        <div className="medical-stat-card">
          <div className="text-2xl font-bold text-yellow-600">{stats.seguimiento}</div>
          <div className="text-sm text-slate-600">En Seguimiento</div>
        </div>
        <div className="medical-stat-card">
          <div className="text-2xl font-bold text-slate-600">{stats.cerrados}</div>
          <div className="text-sm text-slate-600">Cerrados</div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="medical-card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              🔍 Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por paciente, diagnóstico, doctor..."
              className="medical-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              📁 Tipo de Consulta
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="medical-input"
            >
              <option value="todos">Todos los tipos</option>
              <option value="consultation">Consulta</option>
              <option value="followup">Seguimiento</option>
              <option value="emergency">Urgencia</option>
              <option value="checkup">Control</option>
              <option value="surgery">Cirugía</option>
              <option value="therapy">Terapia</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              🩺 Especialidad
            </label>
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="medical-input"
            >
              <option value="todos">Todas las especialidades</option>
              <option value="clinica-medica">Clínica Médica</option>
              <option value="pediatria">Pediatría</option>
              <option value="cardiologia">Cardiología</option>
              <option value="traumatologia">Traumatología</option>
              <option value="ginecologia">Ginecología</option>
              <option value="dermatologia">Dermatología</option>
              <option value="neurologia">Neurología</option>
              <option value="psiquiatria">Psiquiatría</option>
              <option value="odontologia">Odontología</option>
              <option value="oftalmologia">Oftalmología</option>
              <option value="otorrinolaringologia">Otorrinolaringología</option>
              <option value="urologia">Urología</option>
              <option value="endocrinologia">Endocrinología</option>
              <option value="gastroenterologia">Gastroenterología</option>
              <option value="nefrologia">Nefrología</option>
              <option value="neumologia">Neumología</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              🏷️ Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="medical-input"
            >
              <option value="todos">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="follow_up">En Seguimiento</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('todos');
                setFilterStatus('todos');
                setFilterSpecialty('todos');
              }}
              className="medical-button-secondary w-full"
            >
              🔄 Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de historias clínicas */}
      <PatientHistoryList
        histories={filteredHistories}
        onViewHistory={handleViewHistory}
      />

      {/* Modal de detalle de historia clínica */}
      <HistoryDetailModal
        isOpen={showHistoryDetail}
        onClose={() => setShowHistoryDetail(false)}
        history={selectedHistory}
        onEdit={handleEditHistory}
      />

      {/* Modal de edición de historia clínica */}
      <EditHistoryModal
        isOpen={showEditHistoryModal}
        onClose={() => setShowEditHistoryModal(false)}
        history={selectedHistory}
        onSave={handleUpdateHistory}
      />

      {/* Modal de nueva historia clínica */}
      <NewHistoryModal
        isOpen={showNewHistoryModal}
        onClose={() => setShowNewHistoryModal(false)}
        onSave={handleCreateNewHistory}
      />
    </div>
  );
}