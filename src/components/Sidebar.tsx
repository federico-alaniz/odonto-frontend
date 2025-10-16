'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Panel Principal',
    items: [
      {
        label: 'Dashboard',
        href: '/',
        icon: '📊',
        description: 'Vista general del sistema'
      },
      {
        label: 'Calendario',
        href: '/calendario',
        icon: '📅',
        description: 'Gestión de citas y horarios'
      }
    ]
  },
  {
    title: 'Pacientes',
    items: [
      {
        label: 'Lista de Pacientes',
        href: '/pacientes',
        icon: '👥',
        description: 'Gestionar información de pacientes'
      },
      {
        label: 'Nuevo Paciente',
        href: '/pacientes/nuevo',
        icon: '➕',
        description: 'Registrar nuevo paciente'
      },
      {
        label: 'Historias Clínicas',
        href: '/historiales',
        icon: '📋',
        description: 'Ver historias clínicas'
      }
    ]
  },
  {
    title: 'Consultas',
    items: [
      {
        label: 'Citas Médicas',
        href: '/citas',
        icon: '🩺',
        description: 'Programar y gestionar citas'
      },
      {
        label: 'Consultas del Día',
        href: '/consultas/hoy',
        icon: '📅',
        description: 'Consultas programadas para hoy'
      },
      {
        label: 'Expedientes',
        href: '/expedientes',
        icon: '📁',
        description: 'Gestionar expedientes médicos'
      }
    ]
  },
  {
    title: 'Administración',
    items: [
      {
        label: 'Personal Médico',
        href: '/personal',
        icon: '👨‍⚕️',
        description: 'Gestionar médicos y staff'
      },
      {
        label: 'Inventario',
        href: '/inventario',
        icon: '📦',
        description: 'Control de medicamentos y suministros'
      },
      {
        label: 'Reportes',
        href: '/reportes',
        icon: '📈',
        description: 'Generar reportes y estadísticas'
      },
      {
        label: 'Configuración',
        href: '/configuracion',
        icon: '⚙️',
        description: 'Configuración del sistema'
      }
    ]
  }
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`
      bg-white shadow-sm
      border-r medical-border
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
      h-screen overflow-y-auto
      flex flex-col
    `}>
      {/* Header */}
      <div className="p-4 border-b medical-border bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-blue-800">
                🏥 MediCore
              </h1>
              <p className="text-sm medical-text-secondary">
                Sistema de Gestión Médica
              </p>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-white/70 transition-colors focus-ring"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <span className="text-lg text-blue-600">
              {isCollapsed ? '☰' : '✕'}
            </span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {sidebarSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {!isCollapsed && (
              <h2 className="text-xs font-semibold medical-text-muted uppercase tracking-wider mb-3">
                {section.title}
              </h2>
            )}
            <ul className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const isActive = pathname === item.href;
                return (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center p-3 rounded-lg transition-all duration-200 group focus-ring
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'
                        }
                      `}
                      title={isCollapsed ? item.label : ''}
                    >
                      <span className="text-xl mr-3 flex-shrink-0">
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="block font-medium">
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="block text-xs medical-text-muted mt-0.5">
                              {item.description}
                            </span>
                          )}
                        </div>
                      )}
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto flex-shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t medical-border bg-gradient-to-r from-slate-50 to-gray-50">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-medium">👨‍⚕️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">
                Dr. Usuario
              </p>
              <p className="text-xs medical-text-secondary">
                Médico General
              </p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <span className="text-white text-sm font-medium">👨‍⚕️</span>
          </div>
        )}
      </div>
    </aside>
  );
}