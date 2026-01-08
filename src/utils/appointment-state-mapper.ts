/**
 * Centralized appointment state mapping utility
 * Handles conversion between backend states (with underscores) and frontend states (with hyphens)
 */

// Backend states (as stored in database)
export type BackendAppointmentState = 
  | 'programada' 
  | 'confirmada' 
  | 'en_curso' 
  | 'completada' 
  | 'cancelada' 
  | 'no_asistio';

// Frontend states (as used in UI)
export type FrontendAppointmentState = 
  | 'programada' 
  | 'confirmada' 
  | 'esperando'  // Virtual state - maps to 'confirmada' in backend
  | 'en-curso' 
  | 'completada' 
  | 'cancelada' 
  | 'no-show';

/**
 * Convert backend state to frontend state
 */
export function backendToFrontend(backendState: BackendAppointmentState): FrontendAppointmentState {
  switch (backendState) {
    case 'en_curso':
      return 'en-curso';
    case 'no_asistio':
      return 'no-show';
    case 'programada':
    case 'confirmada':
    case 'completada':
    case 'cancelada':
      return backendState;
    default:
      console.warn(`Unknown backend state: ${backendState}`);
      return backendState as FrontendAppointmentState;
  }
}

/**
 * Convert frontend state to backend state
 */
export function frontendToBackend(frontendState: FrontendAppointmentState): BackendAppointmentState {
  switch (frontendState) {
    case 'en-curso':
      return 'en_curso';
    case 'no-show':
      return 'no_asistio';
    case 'esperando':
      // "Esperando" is a virtual frontend state that maps to "confirmada" in backend
      return 'confirmada';
    case 'programada':
    case 'confirmada':
    case 'completada':
    case 'cancelada':
      return frontendState;
    default:
      console.warn(`Unknown frontend state: ${frontendState}`);
      return frontendState as BackendAppointmentState;
  }
}

/**
 * Check if a state represents a pending/upcoming appointment
 */
export function isPendingState(state: FrontendAppointmentState | BackendAppointmentState): boolean {
  const normalized = typeof state === 'string' && state.includes('_') 
    ? backendToFrontend(state as BackendAppointmentState)
    : state as FrontendAppointmentState;
    
  return ['programada', 'confirmada', 'esperando'].includes(normalized);
}

/**
 * Check if a state represents an active appointment
 */
export function isActiveState(state: FrontendAppointmentState | BackendAppointmentState): boolean {
  const normalized = typeof state === 'string' && state.includes('_') 
    ? backendToFrontend(state as BackendAppointmentState)
    : state as FrontendAppointmentState;
    
  return normalized === 'en-curso';
}

/**
 * Check if a state represents a completed appointment
 */
export function isCompletedState(state: FrontendAppointmentState | BackendAppointmentState): boolean {
  const normalized = typeof state === 'string' && state.includes('_') 
    ? backendToFrontend(state as BackendAppointmentState)
    : state as FrontendAppointmentState;
    
  return normalized === 'completada';
}

/**
 * Check if a state represents a cancelled/no-show appointment
 */
export function isCancelledState(state: FrontendAppointmentState | BackendAppointmentState): boolean {
  const normalized = typeof state === 'string' && state.includes('_') 
    ? backendToFrontend(state as BackendAppointmentState)
    : state as FrontendAppointmentState;
    
  return ['cancelada', 'no-show'].includes(normalized);
}
