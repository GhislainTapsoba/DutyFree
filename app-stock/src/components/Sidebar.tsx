import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useStockStore } from '../store/stockStore';
import {
  LayoutDashboard, Package, FileText, Truck,
  ClipboardList, AlertTriangle, ShoppingCart, ScanSearch, LogOut
} from 'lucide-react';

const nav = [
  { section: 'Vue d\'ensemble' },
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { section: 'Catalogue' },
  { to: '/produits', icon: Package, label: 'Produits' },
  { to: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
  { to: '/commandes', icon: ShoppingCart, label: 'Commandes' },
  { section: 'Mouvements' },
  { to: '/mouvements', icon: ClipboardList, label: 'Mouvements' },
  { to: '/inventaire', icon: ScanSearch, label: 'Inventaire' },
  { section: 'Conformité' },
  { to: '/sommiers', icon: FileText, label: 'Sommiers DJBC' },
  { to: '/alertes', icon: AlertTriangle, label: 'Alertes' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isOffline } = useStockStore();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={14} color="#0A0E1A" />
          </div>
          <div>
            <div className="sidebar-logo-mark">Duty Free</div>
            <div className="sidebar-logo-sub">Stock Manager</div>
          </div>
        </div>
        {isOffline && (
          <div style={{ marginTop: 8, fontSize: 10, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 4, padding: '3px 8px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em' }}>
            ⚠ MODE DÉMO
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {nav.map((item, i) => {
          if ('section' in item && !('to' in item)) {
            return <div key={i} className="nav-section">{item.section}</div>;
          }
          const { to, icon: Icon, label } = item as { to: string; icon: React.ElementType; label: string };
          return (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={15} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
            {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'AD'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'Admin'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user?.role || 'stock_manager'}</div>
          </div>
        </div>
        <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 6, padding: '7px' }}>
          <LogOut size={13} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
