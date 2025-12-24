'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  Calendar, 
  Clock, 
  UserCog, 
  UserPlus,
  CalendarPlus,
  ClipboardList,
  Activity,
  TrendingUp,
  type LucideIcon,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  BarChart3
} from 'lucide-react';
import { getRoleConfig } from '@/utils/roleConfig';

// TODO: Reemplazar con llamadas al backend
// import { patients } from '../utils/fake-patients';
// import { appointments } from '../utils/fake-appointments';
// import { users } from '../utils/fake-users';

// Datos temporales vacíos hasta integrar con backend
const patients: any[] = [];
const appointments: any[] = [];
const users: any[] = [];

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    const role = (session as any)?.user?.role as 'admin' | 'doctor' | 'secretary' | undefined;
    if (!role) {
      router.replace('/login');
      return;
    }

    router.replace(getRoleConfig(role).defaultHomePage);
  }, [router, session, status]);

  const [stats, setStats] = useState([
    { label: 'Pacientes Registrados', value: '0', icon: Users, color: 'blue' },
    { label: 'Citas Hoy', value: '0', icon: Calendar, color: 'green' },
    { label: 'Consultas Pendientes', value: '0', icon: Clock, color: 'yellow' },
    { label: 'Personal Activo', value: '0', icon: UserCog, color: 'purple' }
  ]);

  const [recentActivity, setRecentActivity] = useState<Array<{
    patient: string;
    action: string;
    time: string;
    type: string;
    icon: LucideIcon;
  }>>([]);

  useEffect(() => {
    // Calcular estadísticas reales
    const calculateStats = () => {
      // 1. Pacientes registrados - total de pacientes activos
      const totalPatients = patients.filter(p => p.estado === 'activo').length;

      // 2. Citas de hoy - citas para la fecha actual (18 de octubre de 2025)
      const today = '2025-10-18';
      const todayAppointments = appointments.filter(apt => apt.fecha === today).length;

      // 3. Consultas pendientes - citas confirmadas o programadas (no completadas ni canceladas)
      const pendingConsultations = appointments.filter(apt => 
        apt.estado === 'confirmada' || apt.estado === 'programada'
      ).length;

      // 4. Personal activo - usuarios con roles de doctor, enfermero, etc. que están activos
      const activeStaff = users.filter(user => 
        user.estado === 'activo' && 
        ['doctor', 'nurse', 'admin', 'secretary'].includes(user.role)
      ).length;

      setStats([
        { label: 'Pacientes Registrados', value: totalPatients.toLocaleString(), icon: Users, color: 'blue' },
        { label: 'Citas Hoy', value: todayAppointments.toString(), icon: Calendar, color: 'green' },
        { label: 'Consultas Pendientes', value: pendingConsultations.toString(), icon: Clock, color: 'yellow' },
        { label: 'Personal Activo', value: activeStaff.toString(), icon: UserCog, color: 'purple' }
      ]);
    };

    // Calcular actividad reciente basada en citas de hoy
    const calculateRecentActivity = () => {
      const today = '2025-10-18';
      const todayAppointments = appointments
        .filter(apt => apt.fecha === today)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
        .slice(0, 4) // Mostrar solo las primeras 4
        .map(apt => {
          const patient = patients.find(p => p.id === apt.patientId);
          const patientName = patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente desconocido';
          
          // Determinar tipo y acción basado en estado
          let type, action, icon;
          switch (apt.estado) {
            case 'completada':
              type = 'success';
              action = 'Consulta completada';
              icon = CheckCircle;
              break;
            case 'en-curso':
              type = 'info';
              action = 'Consulta en curso';
              icon = Activity;
              break;
            case 'confirmada':
              type = 'info';
              action = 'Cita confirmada';
              icon = Info;
              break;
            case 'programada':
              type = 'warning';
              action = 'Cita programada';
              icon = AlertCircle;
              break;
            case 'cancelada':
              type = 'error';
              action = 'Cita cancelada';
              icon = XCircle;
              break;
            default:
              type = 'info';
              action = 'Estado desconocido';
              icon = Info;
          }

          return {
            patient: patientName,
            action: action,
            time: apt.horaInicio,
            type: type,
            icon: icon
          };
        });

      setRecentActivity(todayAppointments);
    };

    calculateStats();
    calculateRecentActivity();
  }, []);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border border-blue-200',
      green: 'bg-green-50 text-green-700 border border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      purple: 'bg-purple-50 text-purple-700 border border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTypeClasses = (type: string) => {
    const types = {
      success: 'bg-green-100 text-green-800',
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return types[type as keyof typeof types] || types.info;
  };

  return null;

}