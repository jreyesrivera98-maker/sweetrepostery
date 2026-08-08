import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { useAuthStore } from './store/useAuthStore';

// Auth pages (eager load)
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Lazy-loaded module pages
const DashboardPage    = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const RecipesPage      = lazy(() => import('./pages/recipes/RecipesPage').then(m => ({ default: m.RecipesPage })));
const RecipeDetailPage = lazy(() => import('./pages/recipes/RecipeDetailPage').then(m => ({ default: m.RecipeDetailPage })));
const RecipeFormPage   = lazy(() => import('./pages/recipes/RecipeFormPage').then(m => ({ default: m.RecipeFormPage })));
const QuoterPage       = lazy(() => import('./pages/QuoterPage').then(m => ({ default: m.QuoterPage })));
const DesignerPage     = lazy(() => import('./pages/DesignerPage').then(m => ({ default: m.DesignerPage })));
const OrdersPage       = lazy(() => import('./pages/orders/OrdersPage').then(m => ({ default: m.OrdersPage })));
const BitacoraPage     = lazy(() => import('./pages/orders/BitacoraPage').then(m => ({ default: m.BitacoraPage })));
const CustomersPage    = lazy(() => import('./pages/CustomersPage').then(m => ({ default: m.CustomersPage })));
const InventoryPage    = lazy(() => import('./pages/InventoryPage').then(m => ({ default: m.InventoryPage })));
const SuppliersPage    = lazy(() => import('./pages/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const ReportsPage      = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const ConfigPage       = lazy(() => import('./pages/ConfigPage').then(m => ({ default: m.ConfigPage })));
const CatalogPage      = lazy(() => import('./pages/catalog/CatalogPage').then(m => ({ default: m.CatalogPage })));

// Loader
const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '60vh', flexDirection: 'column', gap: '1rem',
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      border: '3px solid #E8E3FF', borderTopColor: '#6C5CE7',
      animation: 'spin 0.8s linear infinite',
    }} />
    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#636E72', fontSize: '0.875rem' }}>
      Cargando...
    </span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />

          {/* Protected app routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="recetas" element={<RecipesPage />} />
            <Route path="recetas/nueva" element={<RecipeFormPage />} />
            <Route path="recetas/:id" element={<RecipeDetailPage />} />
            <Route path="recetas/:id/editar" element={<RecipeFormPage />} />
            <Route path="cotizador" element={<QuoterPage />} />
            <Route path="disenador" element={<DesignerPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="pedidos/bitacora" element={<BitacoraPage />} />
            <Route path="clientes" element={<CustomersPage />} />
            <Route path="inventario" element={<InventoryPage />} />
            <Route path="proveedores" element={<SuppliersPage />} />
            <Route path="reportes" element={<ReportsPage />} />
            <Route path="configuracion" element={<ConfigPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
