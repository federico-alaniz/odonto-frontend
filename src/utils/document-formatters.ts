/**
 * Utilidades para formateo de documentos de identidad
 */

/**
 * Formatea el tipo de documento a mayúsculas
 * @param type - Tipo de documento (ej: 'dni', 'le', 'lc')
 * @returns Tipo de documento en mayúsculas (ej: 'DNI', 'LE', 'LC')
 */
export const formatDocumentType = (type: string): string => {
  return type.toUpperCase();
};

/**
 * Formatea el número de documento con separador de miles
 * @param number - Número de documento (ej: '12345678')
 * @returns Número de documento formateado con puntos (ej: '12.345.678')
 */
export const formatDocumentNumber = (number: string): string => {
  // Eliminar caracteres no numéricos
  const cleanNumber = number.replace(/\D/g, '');
  
  // Formatear con separador de miles (punto para Argentina)
  if (cleanNumber.length > 3) {
    return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  return cleanNumber;
};

/**
 * Formatea documento completo (tipo y número)
 * @param type - Tipo de documento
 * @param number - Número de documento
 * @returns Documento formateado (ej: 'DNI 12.345.678')
 */
export const formatDocument = (type: string, number: string): string => {
  return `${formatDocumentType(type)} ${formatDocumentNumber(number)}`;
};
