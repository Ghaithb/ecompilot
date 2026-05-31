'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutRequest } from '@/lib/auth';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/orders', label: 'Commandes' },
  { href: '/delivery', label: 'Livraison' },
];

export function MerchantNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutRequest();
    window.location.href = '/login';
  };

  return (
    <header className="merchant-header">
      <div className="merchant-header-inner">
        <Link href="/dashboard" className="brand">
          EcomPilot
        </Link>
        <nav className="nav-links">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href || pathname.startsWith(l.href + '/') ? 'active' : ''}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button type="button" className="btn-ghost" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
