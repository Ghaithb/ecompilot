import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/core/auth';
import { TenantProvider } from '@/core/tenant/tenant-context';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import LandingPage from '@/pages/marketing/LandingPage';
import LoginPage from '@/pages/LoginPage';
import ActivationFlowPage from '@/pages/onboarding/ActivationFlowPage';
import MvpDashboardPage from '@/pages/MvpDashboardPage';
import OrdersPage from '@/pages/OrdersPage';
import ProductsPage from '@/pages/ProductsPage';
import ProfilePage from '@/pages/ProfilePage';
import WebsiteHubPage from '@/pages/WebsiteHubPage';
import WebsiteWizardPage from '@/pages/WebsiteWizardPage';
import WebsiteSettingsPage from '@/pages/WebsiteSettingsPage';
import PublicStorePage from '@/pages/PublicStorePage';
import { PublicSitePage } from '@/pages/PublicSitePage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import PaymentReturnPage from '@/pages/PaymentReturnPage';
import SitePreviewPage from '@/pages/SitePreviewPage';
import ModernLayout from '@/components/Layout/ModernLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import RoleRoute from '@/components/RoleRoute';
import DriverDashboardPage from '@/pages/driver/DriverDashboardPage';
import DriversPage from '@/pages/merchant/DriversPage';
import ReturnsPage from '@/pages/merchant/ReturnsPage';
import DeliveryLayout from '@/modules/delivery/DeliveryLayout';
import DeliveryOverviewPage from '@/modules/delivery/pages/DeliveryOverviewPage';
import DeliveryShipmentsPage from '@/modules/delivery/pages/DeliveryShipmentsPage';
import DeliveryConnectPage from '@/modules/delivery/pages/DeliveryConnectPage';
import DeliveryShipmentDetailPage from '@/modules/delivery/pages/DeliveryShipmentDetailPage';
import OrderTrackPage from '@/pages/public/OrderTrackPage';
import AdminLayout from '@/admin/AdminLayout';
import UsersPage from '@/admin/UsersPage';
import AdminSettingsPage from '@/admin/SettingsPage';
import SettingsPage from '@/pages/SettingsPage';
import { useTheme } from '@/hooks/use-theme';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AppContent() {
  useTheme();

  return (
    <>
      <Routes>
        {/* Marketing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/onboarding/activate"
          element={
            <ProtectedRoute>
              <ActivationFlowPage />
            </ProtectedRoute>
          }
        />
        <Route path="/onboarding/survey" element={<Navigate to="/onboarding/activate" replace />} />
        <Route path="/site-preview" element={<ProtectedRoute><SitePreviewPage /></ProtectedRoute>} />

        {/* Public store */}
        <Route path="/store/:slug" element={<PublicStorePage />} />
        <Route path="/store/:slug/:pageSlug" element={<PublicStorePage />} />
        <Route path="/site/:slug" element={<PublicSitePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/return" element={<PaymentReturnPage />} />
        <Route path="/track" element={<OrderTrackPage />} />
        <Route
          path="/driver"
          element={
            <RoleRoute roles={['driver', 'admin', 'super_admin']}>
              <DriverDashboardPage />
            </RoleRoute>
          }
        />

        {/* App merchant */}
        <Route element={<ProtectedRoute><ModernLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<MvpDashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/delivery" element={<DeliveryLayout />}>
            <Route index element={<DeliveryOverviewPage />} />
            <Route path="shipments" element={<DeliveryShipmentsPage />} />
            <Route path="shipments/:shipmentId" element={<DeliveryShipmentDetailPage />} />
            <Route path="connect" element={<DeliveryConnectPage />} />
            <Route path="providers" element={<Navigate to="/delivery/connect" replace />} />
            <Route path="settings" element={<Navigate to="/delivery/connect" replace />} />
            <Route path="analytics" element={<Navigate to="/delivery" replace />} />
          </Route>
          <Route path="/website" element={<WebsiteHubPage />} />
          <Route path="/website/settings" element={<WebsiteSettingsPage />} />
          <Route path="/website/wizard" element={<WebsiteWizardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <OnboardingProvider>
          <AuthProvider>
            <TenantProvider>
              <CurrencyProvider>
                <Router>
                  <AppContent />
                </Router>
              </CurrencyProvider>
            </TenantProvider>
          </AuthProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
