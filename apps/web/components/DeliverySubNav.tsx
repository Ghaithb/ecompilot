'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const deliveryLinks = [
  { href: '/delivery', label: 'Vue d\'ensemble' },
  { href: '/delivery/shipments', label: 'Expéditions' },
  { href: '/delivery/analytics', label: 'Analytics' },
  { href: '/delivery/connect', label: 'Connecter' },
];

export function DeliverySubNav() {
  const pathname = usePathname();

  return (
    <nav className="subnav">
      {deliveryLinks.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={
            pathname === l.href || (l.href !== '/delivery' && pathname.startsWith(l.href))
              ? 'active'
              : ''
          }
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
