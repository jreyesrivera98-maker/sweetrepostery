// ============================================================
// MAREA DULCE — TYPE DEFINITIONS
// ============================================================

export type UserRole = 'admin' | 'baker' | 'seller';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar_url?: string;
}

export interface AppSettings {
  id: string;
  brand_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  sidebar_navigation_order: SidebarItem[];
  updated_at: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  visible: boolean;
  roles: UserRole[];
}

// ---- Supplier ----
export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  contact?: string;
  phone?: string;
  email?: string;
  category?: string;
  notes?: string;
  prices?: any[];
  created_at: string;
}

// ---- Ingredient ----
export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  package_cost: number;
  package_quantity: number;
  cost_per_unit: number;
  stock: number;
  min_stock: number;
  category?: string;
  supplier_id?: string;
  created_at: string;
}

// ---- Recipe ----
export type MoldType = 'circular' | 'rectangular' | 'na';

export interface RecipeItem {
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
}

export interface MoldDimensions {
  diameter?: number;
  width?: number;
  height?: number;
  length?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category?: string;
  image_url?: string;
  yield_portions: number;
  prep_minutes: number;
  steps?: string;
  margin_percent: number;
  sale_price: number;
  published: boolean;
  mold_type: MoldType;
  mold_dimensions: MoldDimensions;
  items: RecipeItem[];
  ai_generated: boolean;
  created_at: string;
}

// ---- Customer ----
export interface ImportantDate {
  label: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  loyalty_points: number;
  notes?: string;
  allergies?: string;
  important_dates: ImportantDate[];
  created_at: string;
}

// ---- Order ----
export type OrderStatus = 'pending' | 'production' | 'ready' | 'delivered' | 'cancelled';
export type OrderChannel = 'manual' | 'whatsapp' | 'catalog' | 'instagram';

export interface OrderItem {
  recipe_id: string;
  recipe_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: string;
  folio: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  delivery_date?: string;
  status: OrderStatus;
  channel: OrderChannel;
  total: number;
  advance_paid: number;
  balance_due: number;
  qc_checklist: Record<string, boolean>;
  delivery_notes?: string;
  items: OrderItem[];
  created_at: string;
}

// ---- Quote ----
export type ComplexityLevel = 'simple' | 'media' | 'alta' | 'premium';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface AISuggestion {
  recommended_price: number;
  argument: string;
  confidence: number;
}

export interface Quote {
  id: string;
  customer_name: string;
  recipe_id?: string;
  recipe_name?: string;
  quantity: number;
  complexity: ComplexityLevel;
  base_cost: number;
  labor_cost: number;
  overhead_cost: number;
  depreciation_cost: number;
  margin_percent: number;
  final_price: number;
  advance_amount: number;
  balance_amount: number;
  ai_suggestion?: AISuggestion;
  status: QuoteStatus;
  created_at: string;
}

// ---- Design Render ----
export type PaletteType = 'preset' | 'custom';

export interface ColorSwatch {
  hex: string;
  name: string;
}

export interface DesignRender {
  id: string;
  prompt: string;
  style?: string;
  occasion?: string;
  color_palette_type: PaletteType;
  custom_color_palette: ColorSwatch[];
  image_url: string;
  created_at: string;
}

// ---- Supplier Price ----
export interface SupplierIngredientPrice {
  id: string;
  supplier_id: string;
  ingredient_id: string;
  package_presentation?: string;
  package_cost: number;
  unit_calculated_cost: number;
}

// ---- KPI ----
export interface KPIData {
  activeOrders: number;
  monthlyRevenue: number;
  totalRecipes: number;
  lowStockCount: number;
  revenueChange: number;
  ordersChange: number;
}

export const DEFAULT_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard', visible: true, roles: ['admin', 'baker', 'seller'] },
  { id: 'nav-recipes', label: 'Recetario', path: '/recetas', icon: 'BookOpen', visible: true, roles: ['admin', 'baker', 'seller'] },
  { id: 'nav-quoter', label: 'Cotizador', path: '/cotizador', icon: 'Calculator', visible: true, roles: ['admin', 'seller'] },
  { id: 'nav-designer', label: 'Diseñador', path: '/disenador', icon: 'Wand2', visible: true, roles: ['admin', 'seller'] },
  { id: 'nav-orders', label: 'Pedidos', path: '/pedidos', icon: 'ClipboardList', visible: true, roles: ['admin', 'baker', 'seller'] },
  { id: 'nav-bitacora', label: 'Bitácora', path: '/pedidos/bitacora', icon: 'ClipboardList', visible: true, roles: ['admin', 'seller'] },
  { id: 'nav-customers', label: 'Clientes', path: '/clientes', icon: 'Users', visible: true, roles: ['admin', 'seller'] },
  { id: 'nav-inventory', label: 'Inventario', path: '/inventario', icon: 'Package', visible: true, roles: ['admin', 'baker'] },
  { id: 'nav-suppliers', label: 'Proveedores', path: '/proveedores', icon: 'Truck', visible: true, roles: ['admin', 'baker'] },
  { id: 'nav-reports', label: 'Reportes', path: '/reportes', icon: 'BarChart3', visible: true, roles: ['admin'] },
  { id: 'nav-catalog', label: 'Catálogo Público', path: '/catalogo', icon: 'Store', visible: true, roles: ['admin', 'seller'] },
  { id: 'nav-settings', label: 'Configuración', path: '/configuracion', icon: 'Settings', visible: true, roles: ['admin'] },
];
