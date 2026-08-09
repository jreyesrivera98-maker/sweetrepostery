import React, { useState } from 'react';
import { Search, Share2, Bell, ChevronDown, LogOut, Settings, X, Plus, Package, Users, FileText, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { ShareCatalogModal } from './ShareCatalogModal';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  baker: 'Pastelero/a',
  seller: 'Vendedor/a',
};

export const Topbar: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { setShareCatalogOpen, shareCatalogOpen, mobileSearchOpen, setMobileSearchOpen } = useAppStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm shrink-0">
        
        {/* Mobile Search Toggle Content */}
        <div className={`relative flex-1 max-w-[400px] ${mobileSearchOpen ? 'flex items-center gap-2' : 'hidden md:block'}`}>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar recetas, pedidos, clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-marea pl-9 bg-gray-50 border-gray-200"
              autoFocus={mobileSearchOpen}
            />
          </div>
          {mobileSearchOpen && (
            <button onClick={() => setMobileSearchOpen(false)} className="md:hidden p-2 text-gray-500 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className={`flex items-center gap-2 md:gap-3 ${mobileSearchOpen ? 'hidden md:flex' : ''}`}>
          
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl"
            title="Buscar"
          >
            <Search size={20} />
          </button>

          {/* Share Catalog */}
          <button
            onClick={() => setShareCatalogOpen(true)}
            className="btn-ghost hidden sm:flex items-center gap-2 px-3 py-1.5"
            title="Compartir catálogo"
          >
            <Share2 size={16} />
            <span className="text-sm font-medium">Catálogo</span>
          </button>

          {/* Create Dropdown */}
          <div className="relative ml-1 hidden md:block">
            <button
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              className="btn-primary flex items-center gap-2 px-3 py-1.5"
              title="Crear Nuevo"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">Crear</span>
              <ChevronDown size={14} />
            </button>
            {createMenuOpen && (
              <div className="absolute top-[calc(100%+0.5rem)] right-0 bg-white border border-border rounded-2xl shadow-xl min-w-[200px] z-50 overflow-hidden animate-[slideUp_0.2s_ease]">
                <button
                  onClick={() => { navigate('/pedidos?new=true'); setCreateMenuOpen(false); }}
                  className="flex items-center gap-3 w-full p-3 text-sm text-text font-medium hover:bg-bg transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Package size={16} /></div>
                  Nuevo Pedido
                </button>
                <button
                  onClick={() => { navigate('/clientes?new=true'); setCreateMenuOpen(false); }}
                  className="flex items-center gap-3 w-full p-3 text-sm text-text font-medium hover:bg-bg transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Users size={16} /></div>
                  Nuevo Cliente
                </button>
                <button
                  onClick={() => { navigate('/recetas/nueva'); setCreateMenuOpen(false); }}
                  className="flex items-center gap-3 w-full p-3 text-sm text-text font-medium hover:bg-bg transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><FileText size={16} /></div>
                  Nueva Receta
                </button>
                <button
                  onClick={() => { navigate('/cotizador'); setCreateMenuOpen(false); }}
                  className="flex items-center gap-3 w-full p-3 text-sm text-text font-medium hover:bg-bg transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Calculator size={16} /></div>
                  Nueva Cotización
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            title="Notificaciones"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
          </button>

          {/* User Menu */}
          <div className="relative ml-1">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-poppins font-bold text-sm shadow-sm">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="font-poppins font-semibold text-xs text-gray-900 leading-tight">
                  {user?.name}
                </div>
                <div className="font-inter text-[10px] text-primary font-medium leading-tight">
                  {roleLabels[user?.role ?? 'seller']}
                </div>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden md:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute top-[calc(100%+0.5rem)] right-0 bg-white border border-gray-100 rounded-2xl shadow-xl min-w-[180px] z-50 overflow-hidden animate-[slideUp_0.2s_ease]">
                <div className="md:hidden p-4 border-b border-gray-100 bg-gray-50">
                  <div className="font-poppins font-bold text-sm text-gray-900">{user?.name}</div>
                  <div className="text-xs text-primary font-medium">{roleLabels[user?.role ?? 'seller']}</div>
                </div>
                <button
                  onClick={() => { navigate('/configuracion'); setUserMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full p-3.5 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} className="text-primary" /> Configuración
                </button>
                <div className="h-px bg-gray-100 w-full" />
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="flex items-center gap-2.5 w-full p-3.5 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ShareCatalogModal open={shareCatalogOpen} onClose={() => setShareCatalogOpen(false)} />
    </>
  );
};
