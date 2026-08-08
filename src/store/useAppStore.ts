import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, SidebarItem } from '../types';

const defaultSidebar: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard', visible: true, roles: ['admin', 'baker', 'seller'] },
  { id: 'recipes', label: 'Recetario', path: '/recetas', icon: 'BookOpen', visible: true, roles: ['admin', 'baker'] },
  { id: 'quoter', label: 'Cotizador', path: '/cotizador', icon: 'Calculator', visible: true, roles: ['admin', 'seller'] },
  { id: 'designer', label: 'Diseñador IA', path: '/disenador', icon: 'Wand2', visible: true, roles: ['admin', 'seller'] },
  { id: 'orders', label: 'Pedidos', path: '/pedidos', icon: 'ClipboardList', visible: true, roles: ['admin', 'baker', 'seller'] },
  { id: 'customers', label: 'Clientes', path: '/clientes', icon: 'Users', visible: true, roles: ['admin', 'seller'] },
  { id: 'inventory', label: 'Inventario', path: '/inventario', icon: 'Package', visible: true, roles: ['admin', 'baker'] },
  { id: 'suppliers', label: 'Proveedores', path: '/proveedores', icon: 'Truck', visible: true, roles: ['admin'] },
  { id: 'catalog', label: 'Catálogo', path: '/catalogo', icon: 'Store', visible: true, roles: ['admin', 'seller'] },
  { id: 'reports', label: 'Reportes', path: '/reportes', icon: 'BarChart3', visible: true, roles: ['admin'] },
  { id: 'config', label: 'Configuración', path: '/configuracion', icon: 'Settings', visible: true, roles: ['admin'] },
];

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
        sidebar_navigation_order: defaultSidebar,
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
