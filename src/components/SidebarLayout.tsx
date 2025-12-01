'use client';

import { useSidebar } from '@/hooks/useSidebar';
import Sidebar from './Sidebar';
import { Building2, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { isCollapsed, isMobile, isClient, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  // Rutas públicas que no deben mostrar el sidebar
  const publicRoutes = ['/login', '/registro', '/recuperar-password', '/terminos', '/privacidad'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Si es una ruta pública, solo renderizar el contenido sin sidebar
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // No renderizar hasta que el cliente esté listo para evitar hydration mismatch
  if (!isClient) {
    return (
      <div className="flex h-screen bg-white">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">{/* Fondo blanco sin marco */}
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        ${isMobile ? 'z-50' : 'z-10'}
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar 
          isCollapsed={!isMobile && isCollapsed} 
          onToggle={toggleSidebar} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <header className="bg-white shadow-sm border-b border-gray-200 p-4 md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">
                  MediCore
                </h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}