import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { useShortcuts } from '../../hooks/useShortcuts';

import { CommandPalette } from '../ui/CommandPalette';

export const AppLayout: React.FC = () => {
  useShortcuts();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <main className="flex-1 p-4 md:p-7 overflow-y-auto pb-24 md:pb-7">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
      <CommandPalette />
    </div>
  );
};
