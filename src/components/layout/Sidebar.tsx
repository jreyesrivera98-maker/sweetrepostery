import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Calculator, Wand2, ClipboardList, Users,
  Package, Truck, Store, BarChart3, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';


const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, BookOpen, Calculator, Wand2, ClipboardList, Users,
  Package, Truck, Store, BarChart3, Settings,
};

export const Sidebar: React.FC = () => {
  const { settings, sidebarCollapsed, toggleSidebar } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();


  const visibleItems = settings.sidebar_navigation_order.filter(
    (item) => item.visible && (user ? item.roles.includes(user.role) : false)
  );

  return (
    <aside
      style={{
        width: sidebarCollapsed ? '72px' : '256px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'white',
        borderRight: '1px solid #E8E3FF',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        boxShadow: '2px 0 12px rgba(108, 92, 231, 0.06)',
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: sidebarCollapsed ? '1rem 0.75rem' : '1.25rem 1rem',
          borderBottom: '1px solid #E8E3FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: '0.75rem',
          minHeight: '72px',
        }}
      >
        <BrandLogo
          logoUrl={settings.logo_url}
          brandName={settings.brand_name}
          className={sidebarCollapsed ? 'h-9 w-9' : 'h-10 w-auto'}
          variant={sidebarCollapsed ? 'icon' : 'full'}
        />
        {!sidebarCollapsed && (
          <div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#2D3436' }}>
              {settings.brand_name}
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#6C5CE7', fontWeight: 500 }}>
              Panel Administrativo
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {visibleItems.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
              style={sidebarCollapsed ? { justifyContent: 'center', padding: '0.625rem' } : {}}
            >
              {Icon && <Icon size={18} />}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div style={{ padding: '0.75rem 0.625rem', borderTop: '1px solid #E8E3FF' }}>
        <button
          onClick={toggleSidebar}
          className="sidebar-link"
          style={{
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Colapsar</span></>}
        </button>
      </div>
    </aside>
  );
};
