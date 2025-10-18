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

// Funciones para manejo de datos fake
export {
  addNewPatient,
  createEmptyMedicalHistory,
  ensureAllPatientsHaveHistory
} from './fake-data';