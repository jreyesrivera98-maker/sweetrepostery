import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Package, Users, Menu, X, Store, Calculator, Wand2, ClipboardList, Truck, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, BookOpen, Package, Users, Store, Calculator, Wand2, ClipboardList, Truck, BarChart3, Settings,
};

export const MobileBottomNav: React.FC = () => {
  const { settings, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const primaryItems = [
    { id: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'recipes', path: '/recetas', icon: BookOpen, label: 'Recetario' },
    { id: 'orders', path: '/pedidos', icon: Package, label: 'Pedidos' },
    { id: 'customers', path: '/clientes', icon: Users, label: 'Clientes' },
  ];

  const visibleSidebarItems = settings.sidebar_navigation_order.filter(
    (item) => item.visible && (user ? item.roles.includes(user.role) : false)
  );

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 px-2 pb-safe pt-1 flex items-center justify-around shadow-[0_-4px_24px_rgba(108,92,231,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {primaryItems.map((item) => {
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className="flex flex-col items-center justify-center w-16 h-14 relative"
            >
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
        
        {/* 'Más' button to open bottom sheet */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center justify-center w-16 h-14 relative"
        >
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${mobileMenuOpen ? 'bg-gray-100 text-gray-800' : 'text-gray-400'}`}>
            <Menu size={22} strokeWidth={mobileMenuOpen ? 2.5 : 2} />
          </div>
        </button>
      </nav>

      {/* Mobile "Más" Bottom Sheet / Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div 
            className="absolute bottom-[4.25rem] left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 flex flex-col gap-4 animate-[slideUp_0.3s_ease]"
            style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-bold text-lg text-gray-900">Menú Adicional</h3>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {visibleSidebarItems.filter(i => !primaryItems.find(p => p.path === i.path)).map((item) => {
                const Icon = ICON_MAP[item.icon];
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-primary/5 hover:border-primary/20 transition-colors"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-primary">
                      {Icon && <Icon size={20} />}
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => { logout(); navigate('/login'); setMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 w-full p-4 bg-red-50 text-red-600 rounded-2xl font-semibold text-sm border border-red-100"
              >
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
