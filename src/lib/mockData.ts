import type { Order, Recipe, Ingredient, Customer, Supplier, Quote, DesignRender } from '../types';

// ---- ORDERS ----
export const mockOrders: Order[] = [
  {
    id: '1', folio: 'MD-00001', customer_name: 'Sofía Ramírez', customer_phone: '5551234567',
    delivery_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: 'pending', channel: 'whatsapp', total: 1200, advance_paid: 600, balance_due: 600,
    qc_checklist: {}, delivery_notes: 'Sin gluten en la decoración',
    items: [{ recipe_id: '1', recipe_name: 'Tarta de Frambuesa', quantity: 1, unit_price: 1200, total: 1200 }],
    created_at: new Date().toISOString(),
  },
  {
    id: '2', folio: 'MD-00002', customer_name: 'Carlos Mendoza', customer_phone: '5559876543',
    delivery_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    status: 'production', channel: 'manual', total: 850, advance_paid: 425, balance_due: 425,
    qc_checklist: {}, delivery_notes: '',
    items: [{ recipe_id: '2', recipe_name: 'Cupcakes de Vainilla x12', quantity: 1, unit_price: 850, total: 850 }],
    created_at: new Date().toISOString(),
  },
  {
    id: '3', folio: 'MD-00003', customer_name: 'Ana González', customer_phone: '5554567890',
    delivery_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    status: 'ready', channel: 'catalog', total: 2400, advance_paid: 1200, balance_due: 1200,
    qc_checklist: {}, delivery_notes: 'Entregar en oficina',
    items: [{ recipe_id: '3', recipe_name: 'Pastel de Bodas 3 pisos', quantity: 1, unit_price: 2400, total: 2400 }],
    created_at: new Date().toISOString(),
  },
  {
    id: '4', folio: 'MD-00004', customer_name: 'Luis Torres', customer_phone: '5556543210',
    delivery_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'delivered', channel: 'instagram', total: 650, advance_paid: 650, balance_due: 0,
    qc_checklist: {}, delivery_notes: '',
    items: [{ recipe_id: '4', recipe_name: 'Macarons Surtidos x24', quantity: 1, unit_price: 650, total: 650 }],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// ---- RECIPES ----
export const mockRecipes: Recipe[] = [
  {
    id: '1', name: 'Tarta de Frambuesa y Chocolate Blanco',
    description: 'Elegante tarta con bizcocho húmedo de almendra, ganache de chocolate blanco y coulis de frambuesa fresca.',
    category: 'Tartas', image_url: null as unknown as string, yield_portions: 12, prep_minutes: 90,
    steps: 'Paso 1: Preparar el bizcocho\nPaso 2: Hacer la ganache\nPaso 3: Montar y decorar',
    margin_percent: 55, sale_price: 1200, published: true,
    mold_type: 'circular', mold_dimensions: { diameter: 24 },
    items: [
      { ingredient_id: '1', ingredient_name: 'Harina', quantity: 300, unit: 'g', cost_per_unit: 0.02, total_cost: 6 },
      { ingredient_id: '2', ingredient_name: 'Chocolate Blanco', quantity: 200, unit: 'g', cost_per_unit: 0.18, total_cost: 36 },
      { ingredient_id: '3', ingredient_name: 'Frambuesa Fresca', quantity: 250, unit: 'g', cost_per_unit: 0.12, total_cost: 30 },
    ],
    ai_generated: false, created_at: new Date().toISOString(),
  },
  {
    id: '2', name: 'Cupcakes de Vainilla con Buttercream de Fresa',
    description: 'Esponjosos cupcakes de vainilla Tahití decorados con buttercream de fresa natural y perlas de azúcar.',
    category: 'Cupcakes', image_url: null as unknown as string, yield_portions: 12, prep_minutes: 45,
    steps: 'Paso 1: Batir mantequilla y azúcar\nPaso 2: Hornear\nPaso 3: Decorar con manga',
    margin_percent: 60, sale_price: 850, published: true,
    mold_type: 'na', mold_dimensions: {},
    items: [
      { ingredient_id: '1', ingredient_name: 'Harina', quantity: 250, unit: 'g', cost_per_unit: 0.02, total_cost: 5 },
      { ingredient_id: '4', ingredient_name: 'Mantequilla', quantity: 200, unit: 'g', cost_per_unit: 0.08, total_cost: 16 },
      { ingredient_id: '5', ingredient_name: 'Fresa Fresca', quantity: 300, unit: 'g', cost_per_unit: 0.07, total_cost: 21 },
    ],
    ai_generated: false, created_at: new Date().toISOString(),
  },
  {
    id: '3', name: 'Pastel de Bodas 3 Pisos con Fondant',
    description: 'Magnífico pastel de 3 pisos cubierto con fondant premium, decoración floral y detalles en dorado comestible.',
    category: 'Bodas', image_url: null as unknown as string, yield_portions: 50, prep_minutes: 480,
    steps: 'Paso 1: Hornear 3 bases\nPaso 2: Rellenar y cubrir\nPaso 3: Aplicar fondant\nPaso 4: Decorar',
    margin_percent: 65, sale_price: 2400, published: true,
    mold_type: 'circular', mold_dimensions: { diameter: 30 },
    items: [
      { ingredient_id: '1', ingredient_name: 'Harina', quantity: 1500, unit: 'g', cost_per_unit: 0.02, total_cost: 30 },
      { ingredient_id: '6', ingredient_name: 'Fondant Blanco', quantity: 1000, unit: 'g', cost_per_unit: 0.22, total_cost: 220 },
    ],
    ai_generated: false, created_at: new Date().toISOString(),
  },
  {
    id: '4', name: 'Macarons Surtidos Franceses',
    description: 'Delicados macarons con coquilles de almendra y ganaches en sabores: frambuesa, pistache, vainilla y caramelo salado.',
    category: 'Macarons', image_url: null as unknown as string, yield_portions: 24, prep_minutes: 120,
    steps: 'Paso 1: Tamizar almendra y azúcar glass\nPaso 2: Hacer el merengue italiano\nPaso 3: Macaronage\nPaso 4: Hornear y rellenar',
    margin_percent: 70, sale_price: 650, published: true,
    mold_type: 'na', mold_dimensions: {},
    items: [
      { ingredient_id: '7', ingredient_name: 'Harina de Almendra', quantity: 200, unit: 'g', cost_per_unit: 0.45, total_cost: 90 },
      { ingredient_id: '8', ingredient_name: 'Azúcar Glass', quantity: 200, unit: 'g', cost_per_unit: 0.025, total_cost: 5 },
    ],
    ai_generated: false, created_at: new Date().toISOString(),
  },
];

// ---- INGREDIENTS ----
export const mockIngredients: Ingredient[] = [
  { id: '1', name: 'Harina de Trigo', unit: 'g', package_cost: 45, package_quantity: 2000, cost_per_unit: 0.0225, stock: 5000, min_stock: 1000, category: 'Harinas', created_at: new Date().toISOString() },
  { id: '2', name: 'Chocolate Blanco', unit: 'g', package_cost: 180, package_quantity: 1000, cost_per_unit: 0.18, stock: 800, min_stock: 500, category: 'Chocolates', created_at: new Date().toISOString() },
  { id: '3', name: 'Frambuesa Fresca', unit: 'g', package_cost: 120, package_quantity: 1000, cost_per_unit: 0.12, stock: 300, min_stock: 400, category: 'Frutas', created_at: new Date().toISOString() },
  { id: '4', name: 'Mantequilla sin sal', unit: 'g', package_cost: 90, package_quantity: 1000, cost_per_unit: 0.09, stock: 2000, min_stock: 500, category: 'Lácteos', created_at: new Date().toISOString() },
  { id: '5', name: 'Fresa Fresca', unit: 'g', package_cost: 70, package_quantity: 1000, cost_per_unit: 0.07, stock: 600, min_stock: 300, category: 'Frutas', created_at: new Date().toISOString() },
  { id: '6', name: 'Fondant Blanco', unit: 'g', package_cost: 220, package_quantity: 1000, cost_per_unit: 0.22, stock: 2000, min_stock: 500, category: 'Decoración', created_at: new Date().toISOString() },
  { id: '7', name: 'Harina de Almendra', unit: 'g', package_cost: 225, package_quantity: 500, cost_per_unit: 0.45, stock: 250, min_stock: 300, category: 'Harinas', created_at: new Date().toISOString() },
  { id: '8', name: 'Azúcar Glass', unit: 'g', package_cost: 25, package_quantity: 1000, cost_per_unit: 0.025, stock: 3000, min_stock: 500, category: 'Azúcares', created_at: new Date().toISOString() },
  { id: '9', name: 'Crema para batir', unit: 'ml', package_cost: 65, package_quantity: 1000, cost_per_unit: 0.065, stock: 1500, min_stock: 500, category: 'Lácteos', created_at: new Date().toISOString() },
  { id: '10', name: 'Huevo L', unit: 'pza', package_cost: 90, package_quantity: 30, cost_per_unit: 3, stock: 60, min_stock: 30, category: 'Lácteos', created_at: new Date().toISOString() },
];

// ---- CUSTOMERS ----
export const mockCustomers: Customer[] = [
  { id: '1', name: 'Sofía Ramírez', phone: '5551234567', email: 'sofia@email.com', address: 'Col. Polanco', loyalty_points: 1250, notes: 'Prefiere diseños minimalistas', allergies: 'Nuez', important_dates: [{ label: 'Cumpleaños', date: '1990-03-15' }], created_at: new Date().toISOString() },
  { id: '2', name: 'Carlos Mendoza', phone: '5559876543', email: 'carlos@email.com', address: 'Col. Roma Norte', loyalty_points: 340, notes: '', allergies: '', important_dates: [{ label: 'Aniversario', date: '2015-06-20' }], created_at: new Date().toISOString() },
  { id: '3', name: 'Ana González', phone: '5554567890', email: 'ana@email.com', address: 'Col. Condesa', loyalty_points: 2100, notes: 'Cliente VIP', allergies: 'Gluten', important_dates: [], created_at: new Date().toISOString() },
];

// ---- SUPPLIERS ----
export const mockSuppliers: Supplier[] = [
  { id: '1', name: 'Insumos La Merced', contact_name: 'Don Ramón', phone: '5551112233', email: 'lamerced@email.com', category: 'Harinas y Azúcares', notes: 'Entrega los martes y jueves', created_at: new Date().toISOString() },
  { id: '2', name: 'Chocolates El Cacao', contact_name: 'María Fernández', phone: '5554445566', email: 'cacao@email.com', category: 'Chocolates', notes: 'Requiere pedido mínimo de $500', created_at: new Date().toISOString() },
  { id: '3', name: 'Lácteos del Norte', contact_name: 'Juan Pérez', phone: '5557778899', email: 'lacteosnorte@email.com', category: 'Lácteos', notes: 'Entrega diaria en la mañana', created_at: new Date().toISOString() },
];

// ---- QUOTES ----
export const mockQuotes: Quote[] = [
  { id: '1', customer_name: 'Patricia Luna', recipe_id: '1', recipe_name: 'Tarta de Frambuesa', quantity: 1, complexity: 'alta', base_cost: 312, labor_cost: 200, overhead_cost: 62, depreciation_cost: 30, margin_percent: 55, final_price: 1343, advance_amount: 671, balance_amount: 672, status: 'sent', created_at: new Date().toISOString() },
  { id: '2', customer_name: 'Roberto Salinas', recipe_id: '4', recipe_name: 'Macarons Surtidos', quantity: 48, complexity: 'media', base_cost: 190, labor_cost: 150, overhead_cost: 40, depreciation_cost: 20, margin_percent: 60, final_price: 1000, advance_amount: 500, balance_amount: 500, status: 'accepted', created_at: new Date().toISOString() },
];

// ---- DESIGN RENDERS ----
export const mockDesignRenders: DesignRender[] = [];

// ---- REVENUE CHART ----
export const mockRevenueData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
  revenue: Math.floor(500 + Math.random() * 2500),
  orders: Math.floor(1 + Math.random() * 8),
}));
