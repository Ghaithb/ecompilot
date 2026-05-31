import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="home-page">
      <p className="eyebrow">Phase 4 · Next.js App Router</p>
      <h1>EcomPilot Web</h1>
      <p className="muted">
        Dashboard marchand migré : auth cookie, commandes, livraison (overview, expéditions,
        analytics, connect).
      </p>
      <div className="actions-row" style={{ marginTop: 24 }}>
        <Link href="/login" className="btn-primary">
          Connexion
        </Link>
        <Link href="/dashboard" className="btn-ghost">
          Dashboard
        </Link>
      </div>
      <ul className="home-links">
        <li>
          <Link href="/orders">Commandes</Link>
        </li>
        <li>
          <Link href="/delivery">Livraison</Link>
        </li>
        <li>
          <a href="http://localhost:5173/dashboard">Dashboard Vite (legacy)</a>
        </li>
      </ul>
    </main>
  );
}
