import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { AiProvider } from '@/contexts/AiContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import OrdersPage from '@/pages/OrdersPage';
import ProductsPage from '@/pages/ProductsPage';
import AiCopilotPage from '@/pages/AiCopilotPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import IntegrationsPage from '@/pages/IntegrationsPage';
import NotificationsSettingsPage from '@/pages/NotificationsSettingsPage';
import WhatsAppSettingsPage from '@/pages/WhatsAppSettingsPage';
import FinancingPage from '@/pages/FinancingPage';
import InventoryPage from '@/pages/InventoryPage';
import PurchaseOrdersPage from '@/pages/PurchaseOrdersPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from '@/pages/ProfilePage';
import WebsiteHubPage from '@/pages/WebsiteHubPage';
import WebsitePagesPage from '@/pages/WebsitePagesPage';
import WebsiteBuilderPagePro from '@/pages/WebsiteBuilderPagePro';
import WebsiteWizardPage from '@/pages/WebsiteWizardPage';
import WebsiteSettingsPage from '@/pages/WebsiteSettingsPage';
import WebsiteTemplateGallery from '@/pages/WebsiteTemplateGallery';
import PublicStorePage from '@/pages/PublicStorePage';
import { PublicSitePage } from '@/pages/PublicSitePage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import PaymentReturnPage from '@/pages/PaymentReturnPage';
import MarketingPage from '@/pages/MarketingPage';
import DiscountsPage from '@/pages/DiscountsPage';
import ContentPage from '@/pages/ContentPage';
import MarketsPage from '@/pages/MarketsPage';
import POSPage from '@/pages/POSPage';
import CalculatorPage from '@/pages/CalculatorPage';
import CustomersPage from '@/pages/CustomersPage';
import CurrencySettingsPage from '@/pages/CurrencySettingsPage';
import SitePreviewPage from '@/pages/SitePreviewPage';
import ModernLayout from '@/components/Layout/ModernLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import RoleRoute from '@/components/RoleRoute';
import DriverDashboardPage from '@/pages/driver/DriverDashboardPage';
import DriversPage from '@/pages/merchant/DriversPage';
import ReturnsPage from '@/pages/merchant/ReturnsPage';
import OrderTrackPage from '@/pages/public/OrderTrackPage';
import AdminLayout from '@/admin/AdminLayout';
import UsersPage from '@/admin/UsersPage';
import AdminSettingsPage from '@/admin/SettingsPage';
import SettingsPage from '@/pages/SettingsPage';
import EmailMarketingPage from '@/pages/EmailMarketingPage';
import AbandonedCartPage from '@/pages/AbandonedCartPage';
import ReviewsPage from '@/pages/ReviewsPage';
// BudgetsPage, PaymentMethodsPage et SocialMediaPage sont maintenant intégrés dans IntegrationsPage
import AdsManagerPage from '@/pages/AdsManagerPage';
import ExportImportPage from '@/pages/ExportImportPage';
import MediaGalleryPage from '@/pages/MediaGalleryPage';
import ChatbotPage from '@/pages/ChatbotPage';
import ChatbotConfigPage from '@/pages/ChatbotConfigPage';
import OnboardingSurveyPage from '@/pages/OnboardingSurveyPage';
import BookingPage from '@/pages/BookingPage';
import QuotesInvoicesPage from '@/pages/QuotesInvoicesPage';
import StaffPage from '@/pages/StaffPage';
import ConversionCenterPage from '@/pages/ConversionCenterPage';
import { useTheme } from '@/hooks/use-theme';
import './App.css';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  useTheme(); // Applique le thème basé sur les préférences utilisateur

  return (
    <>
      <Routes>
        {/* Route de connexion */}
        <Route path="/login" element={<LoginPage />} />

        {/* Route de prévisualisation du site */}
        <Route path="/site-preview" element={
          <ProtectedRoute>
            <SitePreviewPage />
          </ProtectedRoute>
        } />

        {/* Route du questionnaire d'onboarding (après inscription) */}
        <Route path="/onboarding/survey" element={
          <ProtectedRoute>
            <OnboardingSurveyPage />
          </ProtectedRoute>
        } />

        {/* Routes publiques du site web */}
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

        {/* Routes protégées avec nouveau layout moderne */}
        <Route path="/" element={
          <ProtectedRoute>
            <ModernLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="conversion" element={<ConversionCenterPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="abandoned-cart" element={<Navigate to="/conversion" replace />} />
          <Route path="discounts" element={<DiscountsPage />} />
          <Route path="whatsapp-settings" element={<WhatsAppSettingsPage />} />
          <Route path="website" element={<WebsiteHubPage />} />
          <Route path="website/templates" element={<Navigate to="/website" replace />} />
          <Route path="website/settings" element={<WebsiteSettingsPage />} />
          <Route path="website/wizard" element={<WebsiteWizardPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="notifications-settings" element={<NotificationsSettingsPage />} />
          <Route path="currency-settings" element={<Navigate to="/settings" replace />} />

          {/* Modules repoussés — redirection MVP */}
          <Route path="ai-copilot" element={<Navigate to="/dashboard" replace />} />
          <Route path="analytics" element={<Navigate to="/dashboard" replace />} />
          <Route path="integrations" element={<Navigate to="/settings" replace />} />
          <Route path="integrations/add" element={<Navigate to="/settings" replace />} />
          <Route path="accounting" element={<Navigate to="/dashboard" replace />} />
          <Route path="booking" element={<Navigate to="/dashboard" replace />} />
          <Route path="staff" element={<Navigate to="/dashboard" replace />} />
          <Route path="quotes" element={<Navigate to="/dashboard" replace />} />
          <Route path="chatbot" element={<Navigate to="/dashboard" replace />} />
          <Route path="chatbot-config" element={<Navigate to="/dashboard" replace />} />
          <Route path="marketing" element={<Navigate to="/dashboard" replace />} />
          <Route path="email-marketing" element={<Navigate to="/dashboard" replace />} />
          <Route path="ads-manager" element={<Navigate to="/dashboard" replace />} />
          <Route path="markets" element={<Navigate to="/dashboard" replace />} />
          <Route path="pos" element={<Navigate to="/dashboard" replace />} />
          <Route path="financing" element={<Navigate to="/dashboard" replace />} />
          <Route path="purchase-orders" element={<Navigate to="/dashboard" replace />} />
          <Route path="inventory" element={<Navigate to="/products" replace />} />
          <Route path="calculator" element={<Navigate to="/dashboard" replace />} />
          <Route path="content" element={<Navigate to="/website" replace />} />
          <Route path="export-import" element={<Navigate to="/products" replace />} />
          <Route path="media-gallery" element={<Navigate to="/website" replace />} />
          <Route path="reviews" element={<Navigate to="/dashboard" replace />} />
          <Route path="website/builder/:pageId" element={<Navigate to="/website" replace />} />
          <Route path="website/builder/new" element={<Navigate to="/website" replace />} />
          <Route path="website/pages" element={<Navigate to="/website" replace />} />
          <Route path="budgets" element={<Navigate to="/dashboard" replace />} />
          <Route path="payment-methods" element={<Navigate to="/settings" replace />} />
          <Route path="social-media" element={<Navigate to="/settings" replace />} />
        </Route>

        {/* Routes Admin */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
      <OnboardingChecklist />
      <OnboardingTour />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <OnboardingProvider>
          <AuthProvider>
            <AiProvider>
              <CurrencyProvider>
                <Router>
                  <AppContent />
                </Router>
              </CurrencyProvider>
            </AiProvider>
          </AuthProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

