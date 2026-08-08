import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, SidebarItem } from '../types';

import { DEFAULT_SIDEBAR_ITEMS } from '../types';

interface AppState {
  settings: AppSettings;
  sidebarCollapsed: boolean;
  shareCatalogOpen: boolean;
  updateSettings: (partial: Partial<AppSettings>) => void;
  toggleSidebar: () => void;
  setShareCatalogOpen: (open: boolean) => void;
  reorderSidebar: (items: SidebarItem[]) => void;
  toggleSidebarItem: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        id: 'default',
        brand_name: 'MAREA dulce',
        logo_url: null,
        primary_color: '#6C5CE7',
        secondary_color: '#D6BBFB',
        sidebar_navigation_order: DEFAULT_SIDEBAR_ITEMS,
        updated_at: new Date().toISOString(),
      },
      sidebarCollapsed: false,
      shareCatalogOpen: false,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setShareCatalogOpen: (open) => set({ shareCatalogOpen: open }),
      reorderSidebar: (items) =>
        set((state) => ({
          settings: { ...state.settings, sidebar_navigation_order: items },
        })),
      toggleSidebarItem: (id) =>
        set((state) => ({
          settings: {
            ...state.settings,
            sidebar_navigation_order: state.settings.sidebar_navigation_order.map((item) =>
              item.id === id ? { ...item, visible: !item.visible } : item
            ),
          },
        })),
    }),
    { name: 'marea-app' }
  )
);
