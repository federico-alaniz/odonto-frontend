/**
 * Helper para manejar fechas con opción de override para testing
 * 
 * Para simular una fecha diferente:
 * 1. Abre la consola del navegador
 * 2. Ejecuta: localStorage.setItem('DEBUG_DATE', '2024-11-18')
 * 3. Recarga la página
 * 
 * Para volver a la fecha real:
 * localStorage.removeItem('DEBUG_DATE')
 */

// Helper para verificar si estamos en el cliente
const isClient = typeof window !== 'undefined';

// Zona horaria de Buenos Aires
const TIMEZONE = 'America/Argentina/Buenos_Aires';

export const dateHelper = {
  /**
   * Obtiene la fecha actual (o la fecha de debug si está configurada)
   */
  now(): Date {
    if (!isClient) {
      return new Date();
    }
    
    const debugDate = localStorage.getItem('DEBUG_DATE');
    
    if (debugDate) {
      // Crear fecha en hora local para evitar problemas de zona horaria
      // Formato esperado: YYYY-MM-DD
      const [year, month, day] = debugDate.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0); // Usar mediodía para evitar cambios de día
      console.log('🐛 DEBUG MODE: Usando fecha simulada:', debugDate);
      return date;
    }
    
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
  },

  /**
   * Configura una fecha de debug
   */
  setDebugDate(dateString: string) {
    if (!isClient) return;
    
    localStorage.setItem('DEBUG_DATE', dateString);
    console.log('🐛 DEBUG MODE activado. Fecha simulada:', dateString);
    console.log('Para desactivar: dateHelper.clearDebugDate()');
  },

  /**
   * Limpia la fecha de debug
   */
  clearDebugDate() {
    if (!isClient) return;
    
    localStorage.removeItem('DEBUG_DATE');
    console.log('✅ DEBUG MODE desactivado. Usando fecha real.');
  },

  /**
   * Verifica si está en modo debug
   */
  isDebugMode(): boolean {
    if (!isClient) return false;
    
    return !!localStorage.getItem('DEBUG_DATE');
  },

  /**
   * Obtiene info del modo debug
   */
  getDebugInfo(): { isDebug: boolean; debugDate?: string; realDate: string } {
    if (!isClient) {
      return {
        isDebug: false,
        debugDate: undefined,
        realDate: this.formatDate(new Date())
      };
    }
    
    const debugDate = localStorage.getItem('DEBUG_DATE');
    return {
      isDebug: !!debugDate,
      debugDate: debugDate || undefined,
      realDate: this.formatDate(new Date())
    };
  }
};

// Exponer globalmente para facilitar el debug desde la consola
if (typeof window !== 'undefined') {
  (window as any).dateHelper = dateHelper;
  
  // Mostrar info si está en modo debug
  if (dateHelper.isDebugMode()) {
    console.log('🐛 DEBUG MODE ACTIVO');
    console.log('📅 Fecha simulada:', localStorage.getItem('DEBUG_DATE'));
    console.log('📅 Fecha real:', dateHelper.formatDate(new Date()));
    console.log('Para desactivar: dateHelper.clearDebugDate()');
  }
}
