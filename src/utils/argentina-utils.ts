import { 
  provinciaOptions, 
  departamentosPorProvincia, 
  ciudadesPorProvincia, 
  SelectOption 
} from './argentina-data';

/**
 * Obtiene todas las provincias argentinas
 */
export const getProvincias = (): SelectOption[] => {
  return provinciaOptions;
};

/**
 * Obtiene los departamentos de una provincia específica
 */
export const getDepartamentosPorProvincia = (provincia: string): SelectOption[] => {
  return departamentosPorProvincia[provincia] || [];
};

/**
 * Obtiene las ciudades de una provincia específica
 */
export const getCiudadesPorProvincia = (provincia: string): SelectOption[] => {
  return ciudadesPorProvincia[provincia] || [];
};

/**
 * Busca una provincia por su valor
 */
export const findProvincia = (value: string): SelectOption | undefined => {
  return provinciaOptions.find(provincia => provincia.value === value);
};

/**
 * Busca un departamento por su valor en una provincia específica
 */
export const findDepartamento = (provincia: string, value: string): SelectOption | undefined => {
  const departamentos = getDepartamentosPorProvincia(provincia);
  return departamentos.find(departamento => departamento.value === value);
};

/**
 * Busca una ciudad por su valor en una provincia específica
 */
export const findCiudad = (provincia: string, value: string): SelectOption | undefined => {
  const ciudades = getCiudadesPorProvincia(provincia);
  return ciudades.find(ciudad => ciudad.value === value);
};

/**
 * Valida si una combinación provincia-departamento-ciudad es válida
 */
export const validateGeographicData = (
  provincia: string, 
  departamento?: string, 
  ciudad?: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validar provincia
  const provinciaExists = findProvincia(provincia);
  if (!provinciaExists) {
    errors.push('Provincia no válida');
    return { isValid: false, errors };
  }

  // Validar departamento si se proporciona
  if (departamento) {
    const departamentoExists = findDepartamento(provincia, departamento);
    if (!departamentoExists) {
      errors.push('Departamento no válido para la provincia seleccionada');
    }
  }

  // Validar ciudad si se proporciona
  if (ciudad) {
    const ciudadExists = findCiudad(provincia, ciudad);
    if (!ciudadExists) {
      errors.push('Ciudad no válida para la provincia seleccionada');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Obtiene el label completo de una dirección argentina
 */
export const formatArgentineAddress = (
  domicilio: string,
  provincia: string,
  departamento?: string,
  ciudad?: string
): string => {
  const parts: string[] = [domicilio];

  if (ciudad) {
    const ciudadData = findCiudad(provincia, ciudad);
    if (ciudadData) {
      parts.push(ciudadData.label);
    }
  }

  if (departamento) {
    const departamentoData = findDepartamento(provincia, departamento);
    if (departamentoData) {
      parts.push(departamentoData.label);
    }
  }

  const provinciaData = findProvincia(provincia);
  if (provinciaData) {
    parts.push(provinciaData.label);
  }

  return parts.join(', ');
};