import React, { useState } from 'react';
import { Search, Share2, Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
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
  const { setShareCatalogOpen, shareCatalogOpen } = useAppStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <header
        style={{
          height: '64px',
          background: 'white',
          borderBottom: '1px solid #E8E3FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          boxShadow: '0 2px 8px rgba(108, 92, 231, 0.04)',
          flexShrink: 0,
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }}
          />
          <input
            type="search"
            placeholder="Buscar recetas, pedidos, clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-marea"
            style={{ paddingLeft: '2.25rem', background: '#F4F3FF', border: '1.5px solid #E8E3FF' }}
          />
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Share Catalog */}
          <button
            onClick={() => setShareCatalogOpen(true)}
            className="btn-ghost"
            style={{ gap: '0.5rem', padding: '0.5rem 0.875rem' }}
            title="Compartir catálogo"
          >
            <Share2 size={16} />
            <span style={{ fontSize: '0.8rem' }}>Compartir Catálogo</span>
          </button>

          {/* Notifications */}
          <button
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: '#636E72',
              transition: 'all 0.2s',
            }}
            title="Notificaciones"
          >
            <Bell size={20} />
            <span
              style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '8px', height: '8px',
                background: '#6C5CE7', borderRadius: '50%',
                border: '2px solid white',
              }}
            />
          </button>

          {/* User Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                background: 'none', border: '1.5px solid #E8E3FF',
                borderRadius: '0.75rem', padding: '0.375rem 0.75rem',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.8rem',
                }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#2D3436' }}>
                  {user?.name}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#6C5CE7' }}>
                  {roleLabels[user?.role ?? 'seller']}
                </div>
              </div>
              <ChevronDown size={14} style={{ color: '#636E72' }} />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
                  background: 'white', border: '1px solid #E8E3FF',
                  borderRadius: '0.875rem', boxShadow: '0 8px 24px rgba(108, 92, 231, 0.12)',
                  minWidth: '180px', zIndex: 100, overflow: 'hidden',
                  animation: 'slideUp 0.2s ease',
                }}
              >
                <button
                  onClick={() => { navigate('/configuracion'); setUserMenuOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#2D3436', fontFamily: 'Inter, sans-serif' }}
                >
                  <Settings size={16} style={{ color: '#6C5CE7' }} /> Configuración
                </button>
                <hr style={{ border: 'none', borderTop: '1px solid #E8E3FF', margin: 0 }} />
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#E74C3C', fontFamily: 'Inter, sans-serif' }}
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
