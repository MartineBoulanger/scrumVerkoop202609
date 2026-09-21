import logoPrularia from '@/assets/logo_prularia_zwart.png';
import { useState } from 'react';
import type { View } from '../App';

interface Props {
  groups: string[];
  view: View;
  onNavigate: (view: View) => void;
  currentUser: string;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Overzicht', icon: '🏠' },
  { id: 'reports', label: 'Rapporten', icon: '📊' },
  { id: 'customers', label: 'Klanten', icon: '👥' },
  { id: 'orders', label: 'Bestellingen', icon: '📦' },
  { id: 'articles', label: 'Artikelen', icon: '🗂' },
  { id: 'chat', label: 'Klantendienst', icon: '💬' },
  { id: 'password', label: 'Wachtwoord', icon: '🔒' },
  { id: 'admin', label: 'Gebruikers', icon: '👤' },
] as const;

export default function Layout({
  groups,
  view,
  onNavigate,
  currentUser,
  onLogout,
  children,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeView = view.startsWith('customer')
    ? 'customers'
    : view.startsWith('order')
      ? 'orders'
      : view;
  const navigate = (next: string) => {
    onNavigate(next);
    setMenuOpen(false);
  };

  return (
    <div className='app-layout'>
      <header className='mobile-header'>
        <img src={logoPrularia} alt='Prularia' />
        <button
          type='button'
          aria-label='Menu openen'
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className='hamburger'
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <button
          className='sidebar-backdrop'
          aria-label='Menu sluiten'
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sales-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className='sidebar-brand'>
          <img src={logoPrularia} alt='Prularia' className='sidebar-logo' />
          <div className='sidebar-caption'>Team verkoop</div>
        </div>
        <nav className='sidebar-nav'>
          {navItems
            .filter((i) => i.id !== 'admin' || groups.includes('Admin'))
            .filter(
              (i) =>
                i.id !== 'chat' ||
                groups.some((g) =>
                  ['Admin', 'CWebsite', 'Klantendienst'].includes(g),
                ),
            )
            .map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`nav-item ${
                  activeView === item.id ? 'nav-item-active' : 'nav-item-idle'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
        </nav>
        <div className='sidebar-footer'>
          <div className='sidebar-profile'>
            <div className='profile-avatar'>
              <span className='profile-initials'>
                {currentUser
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)}
              </span>
            </div>
            <div className='profile-info'>
              <div className='profile-name'>{currentUser}</div>
              <div className='profile-role'>Medewerker</div>
            </div>
          </div>
          <button onClick={onLogout} className='logout-button'>
            Afmelden
          </button>
        </div>
      </aside>

      <main className='sales-main'>{children}</main>
    </div>
  );
}
