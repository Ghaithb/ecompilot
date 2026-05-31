import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/core/auth';
import { TenantProvider } from '@/core/tenant/tenant-context';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import CaseStudiesPage from '@/pages/marketing/CaseStudiesPage';
import ServiceLandingPage from '@/pages/marketing/ServiceLandingPage';
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
import { StorefrontShell } from '@/modules/storefront/StorefrontShell';
import { StorefrontHomePage } from '@/modules/storefront/pages/StorefrontHomePage';
import { StorefrontProductPage } from '@/modules/storefront/pages/StorefrontProductPage';
import { StorefrontCheckoutPage } from '@/modules/storefront/pages/StorefrontCheckoutPage';
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
import DeliveryAnalyticsPage from '@/modules/delivery/pages/DeliveryAnalyticsPage';
import DeliveryShipmentDetailPage from '@/modules/delivery/pages/DeliveryShipmentDetailPage';
import AutomationPage from '@/pages/AutomationPage';
import OrderTrackPage from '@/pages/public/OrderTrackPage';
import AdminLayout from '@/admin/AdminLayout';
import UsersPage from '@/admin/UsersPage';
import AdminSettingsPage from '@/admin/SettingsPage';
import StoreTemplatePage from '@/pages/admin/StoreTemplatePage';
import ConversionRevenuePage from '@/pages/ConversionRevenuePage';
import ConversionCenterPage from '@/pages/ConversionCenterPage';
import SettingsPage from '@/pages/SettingsPage';
import IntegrationsPage from '@/pages/IntegrationsPage';
import CustomersPage from '@/pages/CustomersPage';
import DiscountsPage from '@/pages/DiscountsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import StaffPage from '@/pages/StaffPage';
import { ThemeBootstrap } from '@/components/ThemeBootstrap';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AppContent() {
  return (
    <>
      <ThemeBootstrap />
      <Routes>
        {/* Marketing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="/service/:slug" element={<ServiceLandingPage />} />
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

        {/* Public store — conversion-optimized engine */}
        <Route path="/store/:slug" element={<StorefrontShell />}>
          <Route index element={<StorefrontHomePage />} />
          <Route path="product/:productId" element={<StorefrontProductPage />} />
          <Route path="checkout" element={<StorefrontCheckoutPage />} />
          <Route path=":pageSlug" element={<PublicStorePage />} />
        </Route>
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
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/discounts" element={<DiscountsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/delivery" element={<DeliveryLayout />}>
            <Route index element={<DeliveryOverviewPage />} />
            <Route path="shipments" element={<DeliveryShipmentsPage />} />
            <Route path="shipments/:shipmentId" element={<DeliveryShipmentDetailPage />} />
            <Route path="connect" element={<DeliveryConnectPage />} />
            <Route path="providers" element={<Navigate to="/delivery/connect" replace />} />
            <Route path="settings" element={<Navigate to="/delivery/connect" replace />} />
            <Route path="analytics" element={<DeliveryAnalyticsPage />} />
          </Route>
          <Route path="/automation" element={<AutomationPage />} />
          <Route path="/website" element={<WebsiteHubPage />} />
          <Route path="/website/settings" element={<WebsiteSettingsPage />} />
          <Route path="/website/wizard" element={<WebsiteWizardPage />} />
          <Route path="/website/templates" element={<StoreTemplatePage />} />
          <Route path="/conversion" element={<ConversionRevenuePage />} />
          <Route path="/conversion/center" element={<ConversionCenterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="store-template" element={<StoreTemplatePage />} />
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
