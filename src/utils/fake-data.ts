// Exportaciones de tipos
export * from './fake-data-types';

// Importaciones para uso interno
import { 
  roles as _roles,
  users as _users,
  currentUser as _currentUser,
  getUserById as _getUserById,
  getUsersByRole as _getUsersByRole,
  getAvailableDoctors as _getAvailableDoctors
} from './fake-users';

import {
  patients as _patients,
  getPatientById as _getPatientById,
  getPatientsByDoctor as _getPatientsByDoctor,
  getActivePatients as _getActivePatients,
  searchPatients as _searchPatients,
  getPatientsByAgeRange as _getPatientsByAgeRange
} from './fake-patients';

import {
  appointments as _appointments,
  getAppointmentById as _getAppointmentById,
  getAppointmentsByDate as _getAppointmentsByDate,
  getAppointmentsByDoctor as _getAppointmentsByDoctor,
  getAppointmentsByPatient as _getAppointmentsByPatient,
  getAppointmentsByStatus as _getAppointmentsByStatus,
  getTodayAppointments as _getTodayAppointments,
  getUpcomingAppointments as _getUpcomingAppointments,
  getAppointmentsByDateRange as _getAppointmentsByDateRange,
  getDoctorAvailableSlots as _getDoctorAvailableSlots
} from './fake-appointments';

import {
  medicalRecords as _medicalRecords,
  getMedicalRecordById as _getMedicalRecordById,
  getMedicalRecordsByPatient as _getMedicalRecordsByPatient,
  getMedicalRecordsByDoctor as _getMedicalRecordsByDoctor,
  getMedicalRecordsBySpecialty as _getMedicalRecordsBySpecialty,
  getMedicalRecordsByDateRange as _getMedicalRecordsByDateRange,
  getRecentMedicalRecords as _getRecentMedicalRecords,
  getMedicalRecordsByAppointment as _getMedicalRecordsByAppointment
} from './fake-medical-records';

import {
  bills as _bills,
  getBillById as _getBillById,
  getBillsByPatient as _getBillsByPatient,
  getBillsByStatus as _getBillsByStatus,
  getBillsByDateRange as _getBillsByDateRange,
  getPendingBills as _getPendingBills,
  getOverdueBills as _getOverdueBills,
  getRevenueByDateRange as _getRevenueByDateRange,
  getBillsByPaymentMethod as _getBillsByPaymentMethod,
  getMonthlyRevenue as _getMonthlyRevenue,
  getBillsStatistics as _getBillsStatistics
} from './fake-billing';

import {
  notifications as _notifications,
  systemLogs as _systemLogs,
  dashboardStats as _dashboardStats,
  clinicSettings as _clinicSettings,
  getNotificationsByUser as _getNotificationsByUser,
  getUnreadNotifications as _getUnreadNotifications,
  getNotificationsByType as _getNotificationsByType,
  getNotificationsByPriority as _getNotificationsByPriority,
  markNotificationAsRead as _markNotificationAsRead,
  getLogsByUser as _getLogsByUser,
  getLogsByAction as _getLogsByAction,
  getLogsByDateRange as _getLogsByDateRange,
  getFailedLoginAttempts as _getFailedLoginAttempts,
  getSystemActivity as _getSystemActivity
} from './fake-notifications';

// Re-exportaciones para uso externo
export {
  _roles as roles,
  _users as users,
  _currentUser as currentUser,
  _getUserById as getUserById,
  _getUsersByRole as getUsersByRole,
  _getAvailableDoctors as getAvailableDoctors,
  _patients as patients,
  _getPatientById as getPatientById,
  _getPatientsByDoctor as getPatientsByDoctor,
  _getActivePatients as getActivePatients,
  _searchPatients as searchPatients,
  _getPatientsByAgeRange as getPatientsByAgeRange,
  _appointments as appointments,
  _getAppointmentById as getAppointmentById,
  _getAppointmentsByDate as getAppointmentsByDate,
  _getAppointmentsByDoctor as getAppointmentsByDoctor,
  _getAppointmentsByPatient as getAppointmentsByPatient,
  _getAppointmentsByStatus as getAppointmentsByStatus,
  _getTodayAppointments as getTodayAppointments,
  _getUpcomingAppointments as getUpcomingAppointments,
  _getAppointmentsByDateRange as getAppointmentsByDateRange,
  _getDoctorAvailableSlots as getDoctorAvailableSlots,
  _medicalRecords as medicalRecords,
  _getMedicalRecordById as getMedicalRecordById,
  _getMedicalRecordsByPatient as getMedicalRecordsByPatient,
  _getMedicalRecordsByDoctor as getMedicalRecordsByDoctor,
  _getMedicalRecordsBySpecialty as getMedicalRecordsBySpecialty,
  _getMedicalRecordsByDateRange as getMedicalRecordsByDateRange,
  _getRecentMedicalRecords as getRecentMedicalRecords,
  _getMedicalRecordsByAppointment as getMedicalRecordsByAppointment,
  _bills as bills,
  _getBillById as getBillById,
  _getBillsByPatient as getBillsByPatient,
  _getBillsByStatus as getBillsByStatus,
  _getBillsByDateRange as getBillsByDateRange,
  _getPendingBills as getPendingBills,
  _getOverdueBills as getOverdueBills,
  _getRevenueByDateRange as getRevenueByDateRange,
  _getBillsByPaymentMethod as getBillsByPaymentMethod,
  _getMonthlyRevenue as getMonthlyRevenue,
  _getBillsStatistics as getBillsStatistics,
  _notifications as notifications,
  _systemLogs as systemLogs,
  _dashboardStats as dashboardStats,
  _clinicSettings as clinicSettings,
  _getNotificationsByUser as getNotificationsByUser,
  _getUnreadNotifications as getUnreadNotifications,
  _getNotificationsByType as getNotificationsByType,
  _getNotificationsByPriority as getNotificationsByPriority,
  _markNotificationAsRead as markNotificationAsRead,
  _getLogsByUser as getLogsByUser,
  _getLogsByAction as getLogsByAction,
  _getLogsByDateRange as getLogsByDateRange,
  _getFailedLoginAttempts as getFailedLoginAttempts,
  _getSystemActivity as getSystemActivity
};

// Funciones de utilidad global
export const getCurrentDate = (): string => '2025-10-18';

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('es-AR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
};

export const calculateAge = (birthDate: string): number => {
  const today = new Date(getCurrentDate());
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Datos consolidados para diferentes vistas
export const getSystemOverview = () => {
  return {
    stats: _dashboardStats,
    settings: _clinicSettings,
    totalUsers: _users.length,
    activeUsers: _users.filter(u => u.estado === 'activo').length,
    totalPatients: _patients.length,
    activePatients: _patients.filter(p => p.estado === 'activo').length,
    todayAppointments: _getTodayAppointments().length,
    pendingBills: _getPendingBills().length,
    overdueBills: _getOverdueBills().length
  };
};

export const getDoctorDashboard = (doctorId: string) => {
  const doctor = _getUserById(doctorId);
  const doctorPatients = _getPatientsByDoctor(doctorId);
  const doctorAppointments = _getAppointmentsByDoctor(doctorId);
  const todayAppointments = doctorAppointments.filter(apt => apt.fecha === getCurrentDate());
  const doctorNotifications = _getUnreadNotifications(doctorId);
  
  return {
    doctor,
    patients: doctorPatients,
    todayAppointments,
    totalAppointments: doctorAppointments.length,
    notifications: doctorNotifications,
    recentRecords: _getMedicalRecordsByDoctor(doctorId).slice(0, 5)
  };
};

export const getSecretaryDashboard = (secretaryId: string) => {
  const secretary = _getUserById(secretaryId);
  const todayAppointments = _getTodayAppointments();
  const pendingBills = _getPendingBills();
  const secretaryNotifications = _getUnreadNotifications(secretaryId);
  
  return {
    secretary,
    todayAppointments,
    upcomingAppointments: _getUpcomingAppointments(7),
    pendingBills: pendingBills.slice(0, 10),
    notifications: secretaryNotifications,
    recentActivity: _getSystemActivity(24).slice(0, 10)
  };
};

export const getAdminDashboard = (adminId: string) => {
  const admin = _getUserById(adminId);
  const systemOverview = getSystemOverview();
  const adminNotifications = _getUnreadNotifications(adminId);
  const recentLogs = _getSystemActivity(24);
  const billsStats = _getBillsStatistics();
  
  return {
    admin,
    systemOverview,
    notifications: adminNotifications,
    recentActivity: recentLogs.slice(0, 15),
    billsStatistics: billsStats,
    failedLogins: _getFailedLoginAttempts().slice(0, 5)
  };
};

// Funciones de búsqueda global
export const globalSearch = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  
  const foundPatients = _searchPatients(query);
  const foundUsers = _users.filter(user => 
    user.nombres.toLowerCase().includes(lowercaseQuery) ||
    user.apellidos.toLowerCase().includes(lowercaseQuery) ||
    user.email.toLowerCase().includes(lowercaseQuery)
  );
  
  const foundAppointments = _appointments.filter(apt =>
    apt.motivo.toLowerCase().includes(lowercaseQuery) ||
    apt.consultorio.toLowerCase().includes(lowercaseQuery)
  );
  
  return {
    patients: foundPatients,
    users: foundUsers,
    appointments: foundAppointments,
    total: foundPatients.length + foundUsers.length + foundAppointments.length
  };
};

// Validaciones
export const validateUserPermissions = (userId: string, resource: string, action: string): boolean => {
  const user = _getUserById(userId);
  if (!user) return false;
  
  const userRole = _roles.find(role => role.name === user.role);
  if (!userRole) return false;
  
  const permission = userRole.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  
  return permission.actions.includes(action as 'create' | 'read' | 'update' | 'delete');
};

// Funciones de utilidad para testing
export const resetFakeData = () => {
  // Función para resetear datos en testing
  console.log('Fake data reset - useful for testing');
};

export const generateRandomData = (type: 'patient' | 'appointment' | 'user', count: number = 1) => {
  // Función para generar datos aleatorios adicionales
  console.log(`Generate ${count} random ${type}(s)`);
};

// Funciones para agregar nuevos datos
import type { Patient, MedicalRecord } from './fake-data-types';

export const addNewPatient = (patientData: Omit<Patient, 'id' | 'fechaRegistro' | 'estado' | 'ultimaConsulta' | 'proximaCita'>): Patient => {
  // Generar ID único
  const newId = `pat_${Date.now()}`;
  
  // Crear nuevo paciente
  const newPatient: Patient = {
    ...patientData,
    id: newId,
    fechaRegistro: new Date().toISOString(),
    estado: 'activo',
    ultimaConsulta: undefined,
    proximaCita: undefined
  };
  
  // Agregar a la lista de pacientes
  _patients.push(newPatient);
  
  // Crear historia clínica vacía para el nuevo paciente
  createEmptyMedicalHistory(newId);

  // Notificar a la UI en el navegador que la lista de pacientes cambió
  try {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('patients:updated', { detail: { patientId: newId } }));
    }
  } catch {
    // no-op en entornos no browser
  }
  
  return newPatient;
};

export const createEmptyMedicalHistory = (patientId: string): MedicalRecord => {
  // Generar ID único para la historia clínica
  const historyId = `med_${Date.now()}`;
  
  // Buscar un doctor por defecto (usar el primero disponible)
  const defaultDoctor = _users.find(user => user.role === 'doctor');
  const doctorId = defaultDoctor?.id || 'user_doc_001';
  
  // Crear historia clínica vacía
  const emptyHistory: MedicalRecord = {
    id: historyId,
    patientId: patientId,
    appointmentId: undefined,
    doctorId: doctorId,
    fecha: new Date().toISOString().split('T')[0],
    especialidad: 'clinica-medica',
    tipo: 'consulta',
    motivoConsulta: 'Primera consulta - Historia clínica inicial',
    sintomas: 'Sin síntomas reportados',
    examenFisico: 'Pendiente de evaluación médica',
    diagnostico: 'Sin diagnóstico establecido',
    tratamiento: 'Pendiente de evaluación médica',
    medicamentos: [],
    signosVitales: undefined,
    proximaConsulta: undefined,
    estado: 'borrador',
    fechaCreacion: new Date().toISOString()
  };
  
  // Agregar a la lista de registros médicos
  _medicalRecords.push(emptyHistory);
  
  return emptyHistory;
};

// Función para asegurar que todos los pacientes tengan al menos una historia clínica
export const ensureAllPatientsHaveHistory = (): void => {
  _patients.forEach(patient => {
    // Verificar si el paciente tiene al menos una historia clínica
    const hasHistory = _medicalRecords.some(record => record.patientId === patient.id);
    
    if (!hasHistory) {
      console.log(`Creando historia clínica vacía para paciente: ${patient.nombres} ${patient.apellidos}`);
      createEmptyMedicalHistory(patient.id);
    }
  });
};

// Ejecutar la verificación al cargar el módulo
ensureAllPatientsHaveHistory();

// Exportación por defecto con todos los datos principales
const fakeDataExport = {
  users: _users,
  patients: _patients,
  appointments: _appointments,
  medicalRecords: _medicalRecords,
  bills: _bills,
  notifications: _notifications,
  systemLogs: _systemLogs,
  dashboardStats: _dashboardStats,
  clinicSettings: _clinicSettings,
  roles: _roles,
  currentUser: _currentUser
};

export default fakeDataExport;