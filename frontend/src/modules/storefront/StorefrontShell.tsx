import { Outlet, useParams } from 'react-router-dom';
import { StorefrontProvider } from './context/StorefrontContext';
import { StoreTracking } from './components/StoreTracking';

/** Shell — session cart + storefront context per slug */
export function StorefrontShell() {
  const { slug = '' } = useParams();

  if (!slug) return null;

  return (
    <StorefrontProvider slug={slug}>
      <StoreTracking />
      <Outlet />
    </StorefrontProvider>
  );
}
