/**
 * Helper functions for entity data formatting
 */

/**
 * Get full name from entity with nombres and apellidos
 * @param entity - Entity with nombres and apellidos properties
 * @returns Full name or empty string
 */
export const getFullName = (entity: { nombres?: string; apellidos?: string } | null | undefined): string => {
  if (!entity) return '';
  return `${entity.nombres || ''} ${entity.apellidos || ''}`.trim();
};

/**
 * Get initials from entity name
 * @param entity - Entity with nombres and apellidos properties
 * @returns Initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (entity: { nombres?: string; apellidos?: string } | null | undefined): string => {
  if (!entity) return '';
  const nombres = entity.nombres?.trim() || '';
  const apellidos = entity.apellidos?.trim() || '';
  
  const firstInitial = nombres.charAt(0).toUpperCase();
  const lastInitial = apellidos.charAt(0).toUpperCase();
  
  return `${firstInitial}${lastInitial}`;
};

/**
 * Get patient name from patient object
 * @param patient - Patient object
 * @returns Full name or "Paciente"
 */
export const getPatientName = (patient: { nombres?: string; apellidos?: string } | null | undefined): string => {
  const name = getFullName(patient);
  return name || 'Paciente';
};

/**
 * Get doctor name from doctor/user object
 * @param doctor - Doctor/User object
 * @returns Full name or "Doctor"
 */
export const getDoctorName = (doctor: { nombres?: string; apellidos?: string } | null | undefined): string => {
  const name = getFullName(doctor);
  return name || 'Doctor';
};

/**
 * Get user name from user object
 * @param user - User object
 * @returns Full name or "Usuario"
 */
export const getUserName = (user: { nombres?: string; apellidos?: string } | null | undefined): string => {
  const name = getFullName(user);
  return name || 'Usuario';
};
