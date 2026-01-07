import { Calendar, Clock, Activity, CheckCircle, XCircle, Timer } from 'lucide-react';

export type AppointmentStatus = 
  | 'programada' 
  | 'confirmada' 
  | 'esperando'
  | 'en_curso' 
  | 'en-curso'
  | 'completada' 
  | 'cancelada' 
  | 'no_asistio'
  | 'no-show';

export interface StatusConfig {
  color: string;
  text: string;
  icon?: any;
  bgCard?: string;
}

export const getAppointmentStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case 'programada':
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Programada',
        icon: Calendar,
        bgCard: 'bg-blue-50'
      };
    case 'confirmada':
      return {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        text: 'Confirmada',
        icon: Clock,
        bgCard: 'bg-orange-50'
      };
    case 'esperando':
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'En espera',
        icon: Timer,
        bgCard: 'bg-yellow-50'
      };
    case 'en_curso':
    case 'en-curso':
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'En consulta',
        icon: Activity,
        bgCard: 'bg-green-50'
      };
    case 'completada':
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Completada',
        icon: CheckCircle,
        bgCard: 'bg-gray-50'
      };
    case 'cancelada':
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Cancelada',
        icon: XCircle,
        bgCard: 'bg-red-50'
      };
    case 'no_asistio':
    case 'no-show':
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'No asistió',
        icon: XCircle,
        bgCard: 'bg-gray-50'
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: status,
        icon: Calendar,
        bgCard: 'bg-gray-50'
      };
  }
};
