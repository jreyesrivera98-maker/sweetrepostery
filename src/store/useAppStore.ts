import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, SidebarItem } from '../types';

import { DEFAULT_SIDEBAR_ITEMS } from '../types';

interface AppState {
  settings: AppSettings;
  sidebarCollapsed: boolean;
  shareCatalogOpen: boolean;
  mobileMenuOpen: boolean;
  mobileSearchOpen: boolean;
  updateSettings: (partial: Partial<AppSettings>) => void;
  toggleSidebar: () => void;
  setShareCatalogOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setMobileSearchOpen: (open: boolean) => void;
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
        catalog_hero_title: 'Postres artesanales creados con pasión',
        catalog_hero_subtitle: 'Explora nuestro catálogo y agenda tu pedido. Calidad y sabor en cada mordida.',
        catalog_layout: 'grid',
        font_heading: 'Poppins',
        font_body: 'Inter',
        catalog_show_prep: true,
        catalog_show_ingredients: true,
        catalog_show_price: true,
        catalog_show_category: true,
        catalog_show_description: true,
        catalog_require_phone: true,
        catalog_require_date: true,
        catalog_require_address: false,
        catalog_advance_percent: 50,
        catalog_max_daily_orders: 10,
        catalog_whatsapp_message: '¡Hola! Me gustaría hacer un pedido del catálogo:\n\n{pedido}\n\nTotal: {total}\nAnticipo requerido: {anticipo}\n\nQuedo atento(a) para coordinar el pago.',
        updated_at: new Date().toISOString(),
      },
      sidebarCollapsed: false,
      shareCatalogOpen: false,
      mobileMenuOpen: false,
      mobileSearchOpen: false,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setShareCatalogOpen: (open) => set({ shareCatalogOpen: open }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setMobileSearchOpen: (open) => set({ mobileSearchOpen: open }),
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
    { 
      name: 'marea-app',
      merge: (persistedState: any, currentState: AppState) => {
        if (!persistedState) return currentState;
        const state = { ...currentState, ...persistedState };
        if (persistedState.settings) {
          state.settings = { 
            ...currentState.settings, 
            ...persistedState.settings 
          };
          
          // Ensure new config keys from updates exist in persisted settings
          state.settings.font_heading = persistedState.settings.font_heading ?? currentState.settings.font_heading;
          state.settings.font_body = persistedState.settings.font_body ?? currentState.settings.font_body;
          state.settings.catalog_show_price = persistedState.settings.catalog_show_price ?? currentState.settings.catalog_show_price;
          state.settings.catalog_show_category = persistedState.settings.catalog_show_category ?? currentState.settings.catalog_show_category;
          state.settings.catalog_show_description = persistedState.settings.catalog_show_description ?? currentState.settings.catalog_show_description;
          state.settings.catalog_require_phone = persistedState.settings.catalog_require_phone ?? currentState.settings.catalog_require_phone;
          state.settings.catalog_require_date = persistedState.settings.catalog_require_date ?? currentState.settings.catalog_require_date;
          state.settings.catalog_require_address = persistedState.settings.catalog_require_address ?? currentState.settings.catalog_require_address;
          state.settings.catalog_advance_percent = persistedState.settings.catalog_advance_percent ?? currentState.settings.catalog_advance_percent;
          state.settings.catalog_max_daily_orders = persistedState.settings.catalog_max_daily_orders ?? currentState.settings.catalog_max_daily_orders;
          state.settings.catalog_whatsapp_message = persistedState.settings.catalog_whatsapp_message ?? currentState.settings.catalog_whatsapp_message;

          // Deduplicate items by path to avoid duplicates if IDs changed in past updates
          const uniquePaths = new Set();
          const deduplicatedItems: any[] = [];
          
          for (const item of state.settings.sidebar_navigation_order) {
            if (!uniquePaths.has(item.path)) {
              uniquePaths.add(item.path);
              deduplicatedItems.push(item);
            }
          }
          state.settings.sidebar_navigation_order = deduplicatedItems;

          // Ensure new sidebar items from code updates are added to persisted state
          const existingPaths = new Set(state.settings.sidebar_navigation_order.map((i: any) => i.path));
          DEFAULT_SIDEBAR_ITEMS.forEach(item => {
            if (!existingPaths.has(item.path)) {
              state.settings.sidebar_navigation_order.push(item);
            }
          });
        }
        return state;
      }
    }
  )
);
