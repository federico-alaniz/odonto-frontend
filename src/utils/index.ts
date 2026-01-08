// Datos geográficos de Argentina
export { 
  provinciaOptions, 
  departamentosPorProvincia, 
  ciudadesPorProvincia,
  type SelectOption,
  type GeographicData
} from './argentina-data';

// Funciones utilitarias para datos geográficos
export {
  getProvincias,
  getDepartamentosPorProvincia,
  getCiudadesPorProvincia,
  findProvincia,
  findDepartamento,
  findCiudad,
  validateGeographicData,
  formatArgentineAddress
} from './argentina-utils';

// Funciones de formato
export {
  formatEnumValue,
  formatGender,
  formatCity
} from './format-helpers';

// Funciones de fecha
export {
  dateHelper,
  calculateAge,
  formatDateShort,
  formatDateFull,
  formatDateWithWeekday
} from './date-helper';

// Funciones de especialidades médicas
export {
  SPECIALTY_NAMES,
  getSpecialtyName,
  getSpecialtyOptions
} from './specialty-helpers';

// Funciones de entidades (pacientes, doctores, usuarios)
export {
  getFullName,
  getInitials,
  getPatientName,
  getDoctorName,
  getUserName
} from './entity-helpers';

// Estados de citas
export {
  type AppointmentStatus,
  type StatusConfig,
  getAppointmentStatusConfig
} from './appointment-status';