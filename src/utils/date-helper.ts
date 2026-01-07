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
