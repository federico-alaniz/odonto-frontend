'use client';

import { useState, useEffect } from 'react';
import { useMediaQuery } from './useClient';

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { matches: isMobile, isClient } = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    // En móviles, colapsar por defecto cuando se carga el cliente
    if (isClient && isMobile) {
      setIsCollapsed(true);
    }
  }, [isClient, isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const collapseSidebar = () => {
    setIsCollapsed(true);
  };

  const expandSidebar = () => {
    setIsCollapsed(false);
  };

  return {
    isCollapsed,
    isMobile,
    isClient,
    toggleSidebar,
    collapseSidebar,
    expandSidebar
  };
}