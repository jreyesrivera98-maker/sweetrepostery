-- ============================================================
-- MAREA DULCE — SUPABASE SCHEMA v7.0
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. APP SETTINGS (Brand & Sidebar config)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT DEFAULT 'MAREA dulce',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6C5CE7',
  secondary_color TEXT DEFAULT '#D6BBFB',
  sidebar_navigation_order JSONB DEFAULT '[]'::jsonb,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO app_settings (brand_name) VALUES ('MAREA dulce') ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  category TEXT,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. INGREDIENTS (with package-cost system)
-- ============================================================
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',
  package_cost NUMERIC DEFAULT 0,
  package_quantity NUMERIC DEFAULT 1,
  cost_per_unit NUMERIC GENERATED ALWAYS AS (
    CASE WHEN package_quantity > 0 THEN package_cost / package_quantity ELSE 0 END
  ) STORED,
  stock NUMERIC DEFAULT 0,
  min_stock NUMERIC DEFAULT 0,
  category TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. SUPPLIER INGREDIENT PRICES (price comparison)
-- ============================================================
CREATE TABLE IF NOT EXISTS supplier_ingredient_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  package_presentation TEXT,
  package_cost NUMERIC DEFAULT 0,
  unit_calculated_cost NUMERIC DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- ============================================================
-- 5. RECIPES (supports mold_type 'na', AI generation)
-- ============================================================
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Pastel',
  image_url TEXT,
  yield_portions INTEGER DEFAULT 1,
  prep_minutes INTEGER DEFAULT 0,
  steps TEXT,
  margin_percent NUMERIC DEFAULT 50,
  sale_price NUMERIC DEFAULT 0,
  published BOOLEAN DEFAULT false,
  mold_type TEXT DEFAULT 'circular' CHECK (mold_type IN ('circular', 'rectangular', 'na')),
  mold_dimensions JSONB DEFAULT '{}'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_generated BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. CUSTOMERS (CRM + loyalty)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  loyalty_points INTEGER DEFAULT 0,
  notes TEXT,
  important_dates JSONB DEFAULT '[]'::jsonb,
  allergies TEXT,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. ORDERS (with Kanban status, JSONB items)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT UNIQUE DEFAULT 'MD-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0'),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  delivery_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'production', 'ready', 'delivered', 'cancelled')),
  channel TEXT DEFAULT 'manual' CHECK (channel IN ('manual', 'whatsapp', 'catalog', 'instagram')),
  total NUMERIC DEFAULT 0,
  advance_paid NUMERIC DEFAULT 0,
  balance_due NUMERIC DEFAULT 0,
  qc_checklist JSONB DEFAULT '{}'::jsonb,
  delivery_notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8. QUOTES (Cotizador)
-- ============================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  recipe_name TEXT,
  quantity INTEGER DEFAULT 1,
  complexity TEXT DEFAULT 'simple' CHECK (complexity IN ('simple', 'media', 'alta', 'premium')),
  base_cost NUMERIC DEFAULT 0,
  labor_cost NUMERIC DEFAULT 0,
  overhead_cost NUMERIC DEFAULT 0,
  depreciation_cost NUMERIC DEFAULT 0,
  margin_percent NUMERIC DEFAULT 50,
  final_price NUMERIC DEFAULT 0,
  advance_amount NUMERIC DEFAULT 0,
  balance_amount NUMERIC DEFAULT 0,
  ai_suggestion JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 9. DESIGN RENDERS (AI Image Studio)
-- ============================================================
CREATE TABLE IF NOT EXISTS design_renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  style TEXT,
  occasion TEXT,
  color_palette_type TEXT DEFAULT 'preset',
  custom_color_palette JSONB DEFAULT '[]'::jsonb,
  image_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (enable after configuring auth)
-- ============================================================
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_ingredient_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_renders ENABLE ROW LEVEL SECURITY;

-- Secure tenant isolation policies (RLS Hardening)
CREATE POLICY "tenant_isolation" ON app_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tenant_isolation" ON suppliers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tenant_isolation" ON ingredients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tenant_isolation" ON supplier_ingredient_prices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tenant_isolation" ON recipes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tenant_isolation" ON customers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tenant_isolation" ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tenant_isolation" ON quotes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tenant_isolation" ON design_renders FOR ALL USING (auth.uid() = user_id);
