/**
 * Helper para manejar fechas
 */

// Zona horaria de Buenos Aires
const TIMEZONE = 'America/Argentina/Buenos_Aires';

export const dateHelper = {
  /**
   * Obtiene la fecha actual
   */
  now(): Date {
    return new Date();
  },

  /**
   * Obtener fecha/hora actual en zona horaria de Buenos Aires
   */
  nowInBuenosAires(): Date {
    const now = this.now();
    // Convertir a Buenos Aires timezone
    const baTime = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
    return baTime;
  },

  /**
   * Obtiene la fecha actual como string en formato YYYY-MM-DD
   */
  today(): string {
    return this.formatDate(this.now());
  },

  /**
   * Formatea una fecha a YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Parse a date string into a Date object while treating
   * ISO date-only strings (YYYY-MM-DD) as local dates instead
   * of midnight UTC. This avoids timezone shifts that move the
   * day backwards for South American timezones.
   */
  parse(dateString: string | Date | null | undefined): Date | null {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;
    const str = dateString.toString();
    // If the string is exactly a date with no time component,
    // construct using local year/month/day values.
    const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDateOnly.test(str)) {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    // fallback to default parsing (which handles ISO with timezone)
    return new Date(str);
  },

  /**
   * Convenience formatter accepting either a Date or a string.
   */
  formatDateFromString(dateString: string | Date | null | undefined): string {
    const date = this.parse(dateString);
    if (!date || isNaN(date.getTime())) return 'N/A';
    return this.formatDate(date);
  },

  formatTimeFromString(dateString: string | Date | null | undefined): string {
    const date = this.parse(dateString);
    if (!date || isNaN(date.getTime())) return 'N/A';
    return this.formatTimeBuenosAires(date);
  },

  formatDateTimeFromString(dateString: string | Date | null | undefined): string {
    const date = this.parse(dateString);
    if (!date || isNaN(date.getTime())) return 'N/A';
    return this.formatDateTimeBuenosAires(date);
  },

  /**
   * Formatea hora en zona horaria de Buenos Aires (HH:mm)
   */
  formatTimeBuenosAires(date: Date = new Date()): string {
    return date.toLocaleTimeString('es-AR', { 
      timeZone: TIMEZONE,
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  },

  /**
   * Formatea fecha en zona horaria de Buenos Aires (DD/MM/YYYY)
   */
  formatDateBuenosAires(date: Date = new Date()): string {
    return date.toLocaleDateString('es-AR', { 
      timeZone: TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  /**
   * Formatea fecha y hora completa en zona horaria de Buenos Aires
   */
  formatDateTimeBuenosAires(date: Date = new Date()): string {
    return date.toLocaleString('es-AR', { 
      timeZone: TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
};

/**
 * Calculate age from birth date
 * @param birthDate - Birth date as string (YYYY-MM-DD) or Date object
 * @returns Age in years
 */
export const calculateAge = (birthDate: string | Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Format date in short format (DD MMM YYYY)
 * @param date - Date as string or Date object
 * @returns Formatted date string
 */
export const formatDateShort = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format date in full format (Weekday, DD de Month de YYYY)
 * @param date - Date as string or Date object
 * @returns Formatted date string
 */
export const formatDateFull = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Format date with weekday short (Lun 15)
 * @param date - Date as string or Date object
 * @returns Formatted date string
 */
export const formatDateWithWeekday = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric'
  });
};
