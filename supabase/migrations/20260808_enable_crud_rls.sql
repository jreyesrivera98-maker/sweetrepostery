-- ==============================================================================
-- MIGRATE: Enable UPDATE and DELETE RLS Policies for Authenticated Users
-- ==============================================================================

-- 1. INGREDIENTS
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to update ingredients" ON public.ingredients;
CREATE POLICY "Allow authenticated users to update ingredients" ON public.ingredients FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to delete ingredients" ON public.ingredients;
CREATE POLICY "Allow authenticated users to delete ingredients" ON public.ingredients FOR DELETE TO authenticated USING (true);

-- 2. RECIPES
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to update recipes" ON public.recipes;
CREATE POLICY "Allow authenticated users to update recipes" ON public.recipes FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to delete recipes" ON public.recipes;
CREATE POLICY "Allow authenticated users to delete recipes" ON public.recipes FOR DELETE TO authenticated USING (true);

-- 3. ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON public.orders;
CREATE POLICY "Allow authenticated users to update orders" ON public.orders FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to delete orders" ON public.orders;
CREATE POLICY "Allow authenticated users to delete orders" ON public.orders FOR DELETE TO authenticated USING (true);

-- 4. CUSTOMERS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to update customers" ON public.customers;
CREATE POLICY "Allow authenticated users to update customers" ON public.customers FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to delete customers" ON public.customers;
CREATE POLICY "Allow authenticated users to delete customers" ON public.customers FOR DELETE TO authenticated USING (true);

-- 5. SUPPLIERS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to update suppliers" ON public.suppliers;
CREATE POLICY "Allow authenticated users to update suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to delete suppliers" ON public.suppliers;
CREATE POLICY "Allow authenticated users to delete suppliers" ON public.suppliers FOR DELETE TO authenticated USING (true);

-- 6. SUPPLIER INGREDIENT PRICES
ALTER TABLE public.supplier_ingredient_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to update supplier_prices" ON public.supplier_ingredient_prices;
CREATE POLICY "Allow authenticated users to update supplier_prices" ON public.supplier_ingredient_prices FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to delete supplier_prices" ON public.supplier_ingredient_prices;
CREATE POLICY "Allow authenticated users to delete supplier_prices" ON public.supplier_ingredient_prices FOR DELETE TO authenticated USING (true);

-- 7. APP SETTINGS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to update app_settings" ON public.app_settings;
CREATE POLICY "Allow authenticated users to update app_settings" ON public.app_settings FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to delete app_settings" ON public.app_settings;
CREATE POLICY "Allow authenticated users to delete app_settings" ON public.app_settings FOR DELETE TO authenticated USING (true);
