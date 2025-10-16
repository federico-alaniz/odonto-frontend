'use client';

import { useSidebar } from '@/hooks/useSidebar';
import Sidebar from './Sidebar';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { isCollapsed, isMobile, isClient, toggleSidebar } = useSidebar();

  // Usar valores seguros para evitar hydration mismatch
  const safeMobile = isClient ? isMobile : false;
  const safeCollapsed = isClient ? isCollapsed : false;

  return (
    <div className="flex h-screen bg-slate-50">
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
          <header className="bg-white shadow-sm medical-border border-b p-4 md:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-blue-800">
                🏥 MediCore
              </h1>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-blue-50 transition-colors focus-ring"
                aria-label="Abrir menú"
              >
                <span className="text-xl text-blue-600">☰</span>
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