'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { 
  BarChart3,
  Calendar,
  Users,
  ClipboardList,
  TrendingUp,
  Settings,
  Menu,
  X,
  Building2,
  CircleUser,
  ChevronDown,
  LogOut,
  User,
  Bell,
  Shield,
  HelpCircle
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
        icon: BarChart3,
        description: 'Vista general del sistema'
      },
      {
        label: 'Calendario',
        href: '/calendario',
        icon: Calendar,
        description: 'Gestión de citas y horarios'
      }
    ]
  },
  {
    title: 'Gestión de Pacientes',
    items: [
      {
        label: 'Pacientes',
        href: '/pacientes',
        icon: Users,
        description: 'Gestionar información de pacientes'
      },
      {
        label: 'Historiales',
        href: '/historiales',
        icon: ClipboardList,
        description: 'Historias clínicas completas'
      }
    ]
  },
  {
    title: 'Administración',
    items: [
      {
        label: 'Reportes',
        href: '/reportes',
        icon: TrendingUp,
        description: 'Generar reportes y estadísticas'
      },
      {
        label: 'Configuración',
        href: '/configuracion',
        icon: Settings,
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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cerrar dropdown cuando se colapsa el sidebar
  useEffect(() => {
    if (isCollapsed) {
      setIsUserDropdownOpen(false);
    }
  }, [isCollapsed]);

  return (
    <aside className={`
      bg-white shadow-lg
      border-r border-gray-200
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
      h-screen overflow-y-auto
      flex flex-col
    `}>
      {/* Header */}
      <div className={`border-b border-gray-200 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-3">
            <button
              onClick={onToggle}
              className="w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center"
              aria-label="Expandir sidebar"
            >
              <Menu className="w-5 h-5 text-blue-600" />
            </button>
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  MediCore
                </h1>
                <p className="text-sm text-gray-600">
                  Sistema de Gestión Médica
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Colapsar sidebar"
            >
              <X className="w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-6 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {sidebarSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 px-3">
                {section.title}
              </h2>
            )}
            <ul className={`space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
              {section.items.map((item, itemIndex) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center rounded-lg transition-all duration-200 group
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${isCollapsed ? 'p-3 justify-center' : 'p-3'}
                        ${isActive 
                          ? isCollapsed 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-blue-600 text-white shadow-md border-l-4 border-blue-400'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
                        }
                      `}
                      title={isCollapsed ? item.label : ''}
                    >
                      <IconComponent className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        isCollapsed ? '' : 'mr-3'
                      } ${
                        isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                      }`} />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className={`block font-medium transition-colors ${
                            isActive ? 'text-white' : 'group-hover:text-blue-700'
                          }`}>
                            {item.label}
                          </span>
                          {item.description && (
                            <span className={`block text-xs mt-0.5 transition-colors ${
                              isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-blue-600'
                            }`}>
                              {item.description}
                            </span>
                          )}
                        </div>
                      )}
                      {isActive && !isCollapsed && (
                        <div className="w-2 h-2 bg-white rounded-full ml-auto flex-shrink-0 shadow-sm" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer - Usuario */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 relative" ref={dropdownRef}>
        {!isCollapsed ? (
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <CircleUser className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900">
                  Dr. Usuario
                </p>
                <p className="text-xs text-gray-600">
                  Médico General
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                isUserDropdownOpen ? 'transform rotate-180' : ''
              }`} />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">Dr. Usuario</p>
                  <p className="text-xs text-gray-500">usuario@clinica.com</p>
                </div>
                
                <Link
                  href="/perfil"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Mi Perfil</span>
                </Link>
                
                <Link
                  href="/configuracion"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </Link>
                
                <Link
                  href="/notificaciones"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <Bell className="w-4 h-4" />
                  <span>Notificaciones</span>
                </Link>
                
                <Link
                  href="/seguridad"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  <span>Seguridad</span>
                </Link>
                
                <Link
                  href="/ayuda"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ayuda</span>
                </Link>
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      // Aquí iría la lógica de logout
                      console.log('Cerrando sesión...');
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              // Al hacer clic en el avatar cuando está colapsado, expandir el sidebar
              onToggle?.();
            }}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Ver perfil"
          >
            <CircleUser className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </aside>
  );
}