import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Package, Users, Menu, X, Store, Calculator, Wand2, ClipboardList, Truck, BarChart3, Settings, LogOut, Plus, UserPlus, FilePlus } from 'lucide-react';
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
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const primaryItems = [
    { id: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'orders', path: '/pedidos', icon: Package, label: 'Pedidos' },
    { id: 'create', isAction: true, icon: Plus, label: 'Crear' },
    { id: 'production', path: '/recetas', icon: BookOpen, label: 'Producción' },
  ];

  const visibleSidebarItems = settings.sidebar_navigation_order.filter(
    (item) => item.visible && (user ? item.roles.includes(user.role) : false)
  );

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 px-2 pb-safe flex items-center justify-around shadow-[0_-4px_24px_rgba(108,92,231,0.06)] h-16"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {primaryItems.map((item) => {
          if (item.isAction) {
            return (
              <div key={item.id} className="relative -top-5">
                <button
                  onClick={() => { setCreateMenuOpen(true); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full shadow-lg shadow-primary/30 transform transition-transform hover:scale-105 active:scale-95"
                >
                  <Plus size={28} />
                </button>
              </div>
            );
          }

          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path || '');

          return (
            <NavLink
              key={item.id}
              to={item.path || '/'}
              className="flex flex-col items-center justify-center w-16 h-full relative"
            >
              <div 
                className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400'}`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
        
        {/* 'Más' button to open bottom sheet */}
        <button
          onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setCreateMenuOpen(false); }}
          className="flex flex-col items-center justify-center w-16 h-full relative"
        >
          <div className={`flex flex-col items-center justify-center transition-all duration-300 ${mobileMenuOpen ? 'text-primary' : 'text-gray-400'}`}>
            <Menu size={22} strokeWidth={mobileMenuOpen ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 font-medium ${mobileMenuOpen ? 'text-primary' : 'text-gray-400'}`}>Más</span>
          </div>
        </button>
      </nav>

      {/* FAB Create Menu Bottom Sheet */}
      {createMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setCreateMenuOpen(false)}
          />
          <div 
            className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-2 animate-[slideUp_0.2s_ease]"
          >
            <div className="text-sm font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">Crear Nuevo</div>
            <button 
              onClick={() => { setCreateMenuOpen(false); navigate('/pedidos?new=true'); }}
              className="flex items-center gap-3 p-3 w-full text-left bg-gray-50 hover:bg-primary/10 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm"><Package size={20} /></div>
              <span className="font-semibold text-gray-800">Pedido</span>
            </button>
            <button 
              onClick={() => { setCreateMenuOpen(false); navigate('/clientes?new=true'); }}
              className="flex items-center gap-3 p-3 w-full text-left bg-gray-50 hover:bg-primary/10 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm"><UserPlus size={20} /></div>
              <span className="font-semibold text-gray-800">Cliente</span>
            </button>
            <button 
              onClick={() => { setCreateMenuOpen(false); navigate('/recetas/nueva'); }}
              className="flex items-center gap-3 p-3 w-full text-left bg-gray-50 hover:bg-primary/10 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm"><FilePlus size={20} /></div>
              <span className="font-semibold text-gray-800">Receta</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile "Más" Bottom Sheet / Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div 
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 flex flex-col gap-4 animate-[slideUp_0.3s_ease]"
            style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-bold text-lg text-gray-900">Menú Principal</h3>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {visibleSidebarItems.map((item) => {
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
