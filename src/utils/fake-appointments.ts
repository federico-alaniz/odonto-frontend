import { Appointment } from './fake-data-types';

export const appointments: Appointment[] = [
  // Citas de hoy (18 de octubre de 2025)
  {
    id: 'apt_001',
    patientId: 'pat_001',
    doctorId: 'user_doc_001',
    especialidad: 'clinica-medica',
    fecha: '2025-10-18',
    horaInicio: '09:00',
    horaFin: '09:30',
    tipo: 'control',
    estado: 'completada',
    consultorio: 'Consultorio 1',
    motivo: 'Control de hipertensión arterial',
    notas: 'Presión controlada, continuar con medicación actual',
    recordatorioEnviado: true,
    fechaCreacion: '2025-10-15T10:00:00Z',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'apt_002',
    patientId: 'pat_003',
    doctorId: 'user_doc_001',
    especialidad: 'clinica-medica',
    fecha: '2025-10-18',
    horaInicio: '10:00',
    horaFin: '10:30',
    tipo: 'consulta',
    estado: 'en-curso',
    consultorio: 'Consultorio 1',
    motivo: 'Dolor abdominal',
    recordatorioEnviado: true,
    fechaCreacion: '2025-10-16T14:30:00Z',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'apt_003',
    patientId: 'pat_005',
    doctorId: 'user_doc_003',
    especialidad: 'pediatria',
    fecha: '2025-10-18',
    horaInicio: '15:00',
    horaFin: '15:30',
    tipo: 'control',
    estado: 'confirmada',
    consultorio: 'Consultorio Pediátrico',
    motivo: 'Control de crecimiento y desarrollo',
    recordatorioEnviado: true,
    fechaCreacion: '2025-10-10T09:00:00Z',
    creadoPor: 'user_sec_002'
  },
  {
    id: 'apt_004',
    patientId: 'pat_002',
    doctorId: 'user_doc_002',
    especialidad: 'odontologia',
    fecha: '2025-10-18',
    horaInicio: '16:00',
    horaFin: '17:00',
    tipo: 'consulta',
    estado: 'programada',
    consultorio: 'Consultorio Odontológico A',
    motivo: 'Limpieza dental y revisión',
    recordatorioEnviado: true,
    fechaCreacion: '2025-10-12T11:20:00Z',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'apt_005',
    patientId: 'pat_008',
    doctorId: 'user_doc_005',
    especialidad: 'traumatologia',
    fecha: '2025-10-18',
    horaInicio: '11:00',
    horaFin: '11:30',
    tipo: 'control',
    estado: 'completada',
    consultorio: 'Consultorio 4',
    motivo: 'Control post-fractura',
    notas: 'Evolución favorable, retirar yeso en 2 semanas',
    recordatorioEnviado: true,
    fechaCreacion: '2025-10-15T08:00:00Z',
    creadoPor: 'user_sec_003'
  },

  // Citas de mañana (19 de octubre de 2025)
  {
    id: 'apt_006',
    patientId: 'pat_004',
    doctorId: 'user_doc_004',
    especialidad: 'cardiologia',
    fecha: '2025-10-19',
    horaInicio: '09:00',
    horaFin: '09:30',
    tipo: 'control',
    estado: 'confirmada',
    consultorio: 'Consultorio 3',
    motivo: 'Control cardiovascular - diabetes',
    recordatorioEnviado: true,
    fechaCreacion: '2025-10-13T15:00:00Z',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'apt_007',
    patientId: 'pat_006',
    doctorId: 'user_doc_001',
    especialidad: 'clinica-medica',
    fecha: '2025-10-19',
    horaInicio: '10:30',
    horaFin: '11:00',
    tipo: 'consulta',
    estado: 'programada',
    consultorio: 'Consultorio 1',
    motivo: 'Dolor epigástrico',
    recordatorioEnviado: false,
    fechaCreacion: '2025-10-17T16:30:00Z',
    creadoPor: 'user_sec_002'
  },
  {
    id: 'apt_008',
    patientId: 'pat_007',
    doctorId: 'user_doc_006',
    especialidad: 'ginecologia',
    fecha: '2025-10-19',
    horaInicio: '14:00',
    horaFin: '14:30',
    tipo: 'control',
    estado: 'confirmada',
    consultorio: 'Consultorio Ginecológico',
    motivo: 'Control ginecológico anual',
    recordatorioEnviado: true,
    fechaCreacion: '2025-10-12T10:00:00Z',
    creadoPor: 'user_sec_003'
  },

  // Citas de la próxima semana
  {
    id: 'apt_009',
    patientId: 'pat_009',
    doctorId: 'user_doc_004',
    especialidad: 'cardiologia',
    fecha: '2025-10-22',
    horaInicio: '08:30',
    horaFin: '09:00',
    tipo: 'control',
    estado: 'programada',
    consultorio: 'Consultorio 3',
    motivo: 'Control de hipertensión y dislipidemia',
    recordatorioEnviado: false,
    fechaCreacion: '2025-10-16T11:00:00Z',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'apt_010',
    patientId: 'pat_010',
    doctorId: 'user_doc_002',
    especialidad: 'odontologia',
    fecha: '2025-10-22',
    horaInicio: '10:00',
    horaFin: '11:00',
    tipo: 'consulta',
    estado: 'programada',
    consultorio: 'Consultorio Odontológico A',
    motivo: 'Primera consulta odontológica',
    recordatorioEnviado: false,
    fechaCreacion: '2025-10-17T13:20:00Z',
    creadoPor: 'user_sec_002'
  },
  {
    id: 'apt_011',
    patientId: 'pat_001',
    doctorId: 'user_doc_001',
    especialidad: 'clinica-medica',
    fecha: '2025-10-25',
    horaInicio: '09:30',
    horaFin: '10:00',
    tipo: 'control',
    estado: 'programada',
    consultorio: 'Consultorio 1',
    motivo: 'Control de presión arterial',
    recordatorioEnviado: false,
    fechaCreacion: '2025-10-18T09:35:00Z',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'apt_012',
    patientId: 'pat_005',
    doctorId: 'user_doc_003',
    especialidad: 'pediatria',
    fecha: '2025-10-28',
    horaInicio: '16:00',
    horaFin: '16:30',
    tipo: 'control',
    estado: 'programada',
    consultorio: 'Consultorio Pediátrico',
    motivo: 'Vacunación y control',
    recordatorioEnviado: false,
    fechaCreacion: '2025-10-18T15:15:00Z',
    creadoPor: 'user_sec_002'
  },

  // Citas próximas semanas
  {
    id: 'apt_013',
    patientId: 'pat_007',
    doctorId: 'user_doc_006',
    especialidad: 'ginecologia',
    fecha: '2025-11-01',
    horaInicio: '11:00',
    horaFin: '11:30',
    tipo: 'control',
    estado: 'programada',
    consultorio: 'Consultorio Ginecológico',
    motivo: 'Control post-tratamiento anemia',
    recordatorioEnviado: false,
    fechaCreacion: '2025-10-15T14:00:00Z',
    creadoPor: 'user_sec_003'
  },
  {
    id: 'apt_014',
    patientId: 'pat_002',
    doctorId: 'user_doc_002',
    especialidad: 'odontologia',
    fecha: '2025-11-09',
    horaInicio: '15:00',
    horaFin: '16:00',
    tipo: 'procedimiento',
    estado: 'programada',
    consultorio: 'Consultorio Odontológico A',
    motivo: 'Extracción de muela del juicio',
    recordatorioEnviado: false,
    fechaCreacion: '2025-10-09T17:00:00Z',
    creadoPor: 'user_sec_001'
  },
  {
    id: 'apt_015',
    patientId: 'pat_006',
    doctorId: 'user_doc_001',
    especialidad: 'clinica-medica',
    fecha: '2025-11-12',
    horaInicio: '08:00',
    horaFin: '08:30',
    tipo: 'control',
    estado: 'programada',
    consultorio: 'Consultorio 1',
    motivo: 'Control gastritis - resultados laboratorio',
    recordatorioEnviado: false,
    fechaCreacion: '2025-10-12T12:00:00Z',
    creadoPor: 'user_sec_001'
  },

  // Citas canceladas/no asistieron (para estadísticas)
  {
    id: 'apt_016',
    patientId: 'pat_003',
    doctorId: 'user_doc_001',
    especialidad: 'clinica-medica',
    fecha: '2025-10-15',
    horaInicio: '14:00',
    horaFin: '14:30',
    tipo: 'consulta',
    estado: 'cancelada',
    consultorio: 'Consultorio 1',
    motivo: 'Dolor de cabeza persistente',
    notas: 'Cancelada por el paciente - motivos personales',
    recordatorioEnviado: true,
    fechaCreacion: '2025-10-10T10:00:00Z',
    creadoPor: 'user_sec_002'
  },
  {
    id: 'apt_017',
    patientId: 'pat_008',
    doctorId: 'user_doc_005',
    especialidad: 'traumatologia',
    fecha: '2025-10-17',
    horaInicio: '09:00',
    horaFin: '09:30',
    tipo: 'control',
    estado: 'no-asistio',
    consultorio: 'Consultorio 4',
    motivo: 'Control fractura',
    notas: 'Paciente no asistió sin aviso previo',
    recordatorioEnviado: true,
    fechaCreacion: '2025-10-10T14:00:00Z',
    creadoPor: 'user_sec_003'
  }
];

// Funciones helper para manejo de appointments
export const getAppointmentById = (id: string): Appointment | undefined => {
  return appointments.find(appointment => appointment.id === id);
};

export const getAppointmentsByDate = (date: string): Appointment[] => {
  return appointments.filter(appointment => appointment.fecha === date);
};

export const getAppointmentsByDoctor = (doctorId: string): Appointment[] => {
  return appointments.filter(appointment => appointment.doctorId === doctorId);
};

export const getAppointmentsByPatient = (patientId: string): Appointment[] => {
  return appointments.filter(appointment => appointment.patientId === patientId);
};

export const getAppointmentsByStatus = (estado: Appointment['estado']): Appointment[] => {
  return appointments.filter(appointment => appointment.estado === estado);
};

export const getTodayAppointments = (): Appointment[] => {
  const today = '2025-10-18'; // Fecha actual simulada
  return getAppointmentsByDate(today);
};

export const getUpcomingAppointments = (days: number = 7): Appointment[] => {
  const today = new Date('2025-10-18');
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.fecha);
    return appointmentDate >= today && appointmentDate <= futureDate;
  });
};

export const getAppointmentsByDateRange = (startDate: string, endDate: string): Appointment[] => {
  return appointments.filter(appointment => {
    return appointment.fecha >= startDate && appointment.fecha <= endDate;
  });
};

export const getDoctorAvailableSlots = (doctorId: string, date: string): string[] => {
  // Obtener citas del doctor para la fecha
  const doctorAppointments = appointments.filter(
    appointment => appointment.doctorId === doctorId && 
    appointment.fecha === date &&
    appointment.estado !== 'cancelada'
  );
  
  // Slots básicos de 30 minutos (esto se podría hacer más sofisticado)
  const allSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];
  
  // Filtrar slots ocupados
  const occupiedSlots = doctorAppointments.map(apt => apt.horaInicio);
  return allSlots.filter(slot => !occupiedSlots.includes(slot));
};