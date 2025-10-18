'use client';

import { useSidebar } from '@/hooks/useSidebar';
import Sidebar from './Sidebar';
import { Building2, Menu } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { isCollapsed, isMobile, isClient, toggleSidebar } = useSidebar();

  // Usar valores seguros para evitar hydration mismatch
  const safeMobile = isClient ? isMobile : false;
  const safeCollapsed = isClient ? isCollapsed : false;

  return (
    <div className="flex h-screen bg-slate-200">{/* Color más definido */}
      {/* Mobile Overlay */}
      {safeMobile && !safeCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${safeMobile ? 'fixed' : 'relative'} 
        ${safeMobile && safeCollapsed ? '-translate-x-full' : 'translate-x-0'}
        ${safeMobile ? 'z-50' : 'z-10'}
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar 
          isCollapsed={!safeMobile && safeCollapsed} 
          onToggle={toggleSidebar} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {safeMobile && (
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
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}