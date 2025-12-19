'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { 
  BarChart3,
  Calendar,
  Users,
  ClipboardList,
  Settings,
  Menu,
  ChevronLeft,
  Building2,
  CircleUser,
  ChevronDown,
  LogOut,
  User,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  Stethoscope,
  TestTube,
  Crown,
  UserCog,
  TrendingUp,
  CalendarPlus,
  DoorOpen,
  Receipt
} from 'lucide-react';

// Importar hooks de autenticación y roles
import { useCurrentRole, useAuth } from '../hooks/useAuth';

// Mapeo de iconos por nombre de string
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart3,
  Calendar,
  Users,
  ClipboardList,
  Settings,
  Stethoscope,
  FileText,
  TestTube,
  Crown,
  User,
  Bell,
  Shield,
  HelpCircle,
  UserCog,
  TrendingUp,
  CalendarPlus,
  DoorOpen,
  Receipt
};

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color: {
    bg: string;
    text: string;
    hover: string;
    active: string;
    iconBg: string;
    iconText: string;
  };
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
        description: 'Vista general del sistema',
        color: {
          bg: 'hover:bg-gray-100',
          text: 'hover:text-blue-700',
          hover: 'hover:text-blue-700',
          active: 'bg-blue-600 text-white border-l-blue-400',
          iconBg: 'bg-gray-100',
          iconText: 'hover:text-blue-600'
        }
      },
      {
        label: 'Calendario',
        href: '/calendario',
        icon: Calendar,
        description: 'Gestión de citas y horarios',
        color: {
          bg: 'hover:bg-gray-100',
          text: 'hover:text-blue-700',
          hover: 'hover:text-blue-700',
          active: 'bg-blue-600 text-white border-l-blue-400',
          iconBg: 'bg-gray-100',
          iconText: 'hover:text-blue-600'
        }
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
        description: 'Gestionar información de pacientes',
        color: {
          bg: 'hover:bg-gray-100',
          text: 'hover:text-blue-700',
          hover: 'hover:text-blue-700',
          active: 'bg-blue-600 text-white border-l-blue-400',
          iconBg: 'bg-gray-100',
          iconText: 'hover:text-blue-600'
        }
      },
      {
        label: 'Historiales',
        href: '/historiales',
        icon: ClipboardList,
        description: 'Historias clínicas completas',
        color: {
          bg: 'hover:bg-gray-100',
          text: 'hover:text-blue-700',
          hover: 'hover:text-blue-700',
          active: 'bg-blue-600 text-white border-l-blue-400',
          iconBg: 'bg-gray-100',
          iconText: 'hover:text-blue-600'
        }
      }
    ]
  },
  {
    title: 'Área Médica',
    items: [
      {
        label: 'Dashboard Doctor',
        href: '/doctor/dashboard',
        icon: BarChart3,
        description: 'Panel médico especializado',
        color: {
          bg: 'hover:bg-indigo-50',
          text: 'hover:text-indigo-700',
          hover: 'hover:text-indigo-700',
          active: 'bg-indigo-600 text-white border-l-indigo-400',
          iconBg: 'bg-indigo-100',
          iconText: 'hover:text-indigo-600'
        }
      }
    ]
  },
  {
    title: 'Administración',
    items: [
      {
        label: 'Registros',
        href: '/registros',
        icon: FileText,
        description: 'Consultas y registros médicos',
        color: {
          bg: 'hover:bg-cyan-50',
          text: 'hover:text-cyan-700',
          hover: 'hover:text-cyan-700',
          active: 'bg-cyan-600 text-white border-l-cyan-400',
          iconBg: 'bg-cyan-100',
          iconText: 'hover:text-cyan-600'
        }
      },
      {
        label: 'Configuración',
        href: '/configuracion',
        icon: Settings,
        description: 'Configuración del sistema',
        color: {
          bg: 'hover:bg-indigo-50',
          text: 'hover:text-indigo-700',
          hover: 'hover:text-indigo-700',
          active: 'bg-indigo-600 text-white border-l-indigo-400',
          iconBg: 'bg-indigo-100',
          iconText: 'hover:text-indigo-600'
        }
      }
    ]
  }
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const currentRole = useCurrentRole();
  const { currentUser, logout } = useAuth();
  const pathname = usePathname();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener secciones del sidebar basadas en el rol actual
  const getSidebarSections = (): SidebarSection[] => {
    if (!currentRole) {
      // Fallback a secciones básicas si no hay rol definido
      return [
        {
          title: 'Panel Principal',
          items: [
            {
              label: 'Dashboard',
              href: '/',
              icon: BarChart3,
              description: 'Vista general del sistema',
              color: {
                bg: 'hover:bg-gray-100',
                text: 'hover:text-blue-700',
                hover: 'hover:text-blue-700',
                active: 'bg-blue-600 text-white border-l-blue-400',
                iconBg: 'bg-gray-100',
                iconText: 'hover:text-blue-600'
              }
            }
          ]
        }
      ];
    }
    
    return currentRole.sidebarSections.map(section => ({
      title: section.title,
      items: section.items.map(item => ({
        label: item.label,
        href: item.href,
        icon: iconMap[item.icon] || User,
        description: item.description,
        color: item.color
      }))
    }));
  };

  const dynamicSidebarSections = getSidebarSections();

  // Helper function para obtener las clases CSS correctas basadas en el color
  const getItemClasses = (item: SidebarItem, isActive: boolean, isCollapsed: boolean) => {
    const baseClasses = 'flex items-center rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-offset-2';
    const paddingClasses = isCollapsed ? 'p-2 justify-center' : 'px-3 py-2';
    
    if (isActive) {
      if (isCollapsed) {
        return `${baseClasses} ${paddingClasses} ${item.color.active.split(' border-l-')[0]} shadow-md`;
      }
      return `${baseClasses} ${paddingClasses} ${item.color.active} shadow-md border-l-4`;
    }
    
    return `${baseClasses} ${paddingClasses} text-gray-700 ${item.color.bg} ${item.color.text} hover:shadow-sm`;
  };

  const getIconClasses = (item: SidebarItem, isActive: boolean, isCollapsed: boolean) => {
    const baseClasses = 'w-5 h-5 flex-shrink-0 transition-colors';
    const marginClass = isCollapsed ? '' : 'mr-3';
    
    if (isActive) {
      return `${baseClasses} ${marginClass} text-white`;
    }
    
    return `${baseClasses} ${marginClass} text-gray-500 ${item.color.iconText}`;
  };

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
      <div className={`border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-3">
            <button
              onClick={onToggle}
              className="w-10 h-10 rounded-lg bg-white shadow-sm hover:shadow-md hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center border border-gray-200"
              aria-label="Expandir sidebar"
            >
              <Menu className="w-5 h-5 text-blue-600" />
            </button>
            <div className="p-1.5 bg-white shadow-sm rounded-lg border border-gray-200">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white shadow-sm rounded-lg border border-gray-200">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  MediCore
                </h1>
                <p className="text-sm text-blue-600 font-medium">
                  Sistema de Gestión Médica
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Colapsar sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 hover:text-blue-700 transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-4 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {dynamicSidebarSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h2>
            )}
            <ul className={`space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
              {section.items.map((item, itemIndex) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const IconComponent = item.icon;
                return (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      className={getItemClasses(item, isActive, isCollapsed)}
                      title={isCollapsed ? item.label : ''}
                    >
                      <IconComponent className={getIconClasses(item, isActive, isCollapsed)} />
                      {!isCollapsed && (
                        <span className={`block font-medium transition-colors ${
                          isActive ? 'text-white' : item.color.text
                        }`}>
                          {item.label}
                        </span>
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
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name || 'Usuario'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.name || 'Usuario'}
                </p>
                <p className="text-xs text-blue-600 font-medium truncate">
                  {currentUser?.role === 'admin' ? 'Administrador' : 
                   currentUser?.role === 'doctor' ? 'Doctor' : 
                   currentUser?.role === 'secretary' ? 'Secretaria' : 'Usuario'}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                isUserDropdownOpen ? 'transform rotate-180' : ''
              }`} />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-300 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{currentUser?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-700 font-medium">{currentUser?.email || 'Sin email'}</p>
                </div>
                
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-950 transition-colors duration-200"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Mi Perfil</span>
                </Link>
                
                <Link
                  href="/configuracion"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-950 transition-colors duration-200"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </Link>
                
                <Link
                  href="/notificaciones"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-950 transition-colors duration-200"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <Bell className="w-4 h-4" />
                  <span>Notificaciones</span>
                </Link>
                
                <Link
                  href="/seguridad"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-950 transition-colors duration-200"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  <span>Seguridad</span>
                </Link>
                
                <Link
                  href="/ayuda"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-900 font-medium hover:bg-gray-100 hover:text-gray-950 transition-colors duration-200"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ayuda</span>
                </Link>

                <div className="border-t border-gray-300 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-red-700 font-semibold hover:bg-red-50 hover:text-red-800 transition-colors duration-200 w-full text-left"
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
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden"
            title="Ver perfil"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name || 'Usuario'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-bold">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}