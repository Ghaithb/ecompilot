/**
 * Routes MVP EcomPilot — seules routes exposées aux commerçants.
 */
import { Navigate, Route } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import OrdersPage from '@/pages/OrdersPage';
import ProductsPage from '@/pages/ProductsPage';
import DriversPage from '@/pages/merchant/DriversPage';
import ReturnsPage from '@/pages/merchant/ReturnsPage';
import WebsiteHubPage from '@/pages/WebsiteHubPage';
import WebsiteSettingsPage from '@/pages/WebsiteSettingsPage';
import WebsiteWizardPage from '@/pages/WebsiteWizardPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import LoginPage from '@/pages/LoginPage';
import DeliveryLayout from '@/modules/delivery/DeliveryLayout';
import DeliveryOverviewPage from '@/modules/delivery/pages/DeliveryOverviewPage';
import DeliveryShipmentsPage from '@/modules/delivery/pages/DeliveryShipmentsPage';
import DeliveryConnectPage from '@/modules/delivery/pages/DeliveryConnectPage';
import DeliveryShipmentDetailPage from '@/modules/delivery/pages/DeliveryShipmentDetailPage';

export const mvpPublicRoutes = (
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/track" element={<Navigate to="/track" replace />} />
  </>
);

export const mvpMerchantRoutes = (
  <>
    <Route index element={<Navigate to="/dashboard" replace />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="drivers" element={<DriversPage />} />
    <Route path="returns" element={<ReturnsPage />} />
    <Route path="delivery" element={<DeliveryLayout />}>
      <Route index element={<DeliveryOverviewPage />} />
      <Route path="shipments" element={<DeliveryShipmentsPage />} />
      <Route path="shipments/:shipmentId" element={<DeliveryShipmentDetailPage />} />
      <Route path="connect" element={<DeliveryConnectPage />} />
    </Route>
    <Route path="website" element={<WebsiteHubPage />} />
    <Route path="website/settings" element={<WebsiteSettingsPage />} />
    <Route path="website/wizard" element={<WebsiteWizardPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="profile" element={<ProfilePage />} />
    {/* Redirections legacy → MVP */}
    <Route path="customers" element={<Navigate to="/orders" replace />} />
    <Route path="conversion" element={<Navigate to="/dashboard" replace />} />
    <Route path="whatsapp-settings" element={<Navigate to="/settings" replace />} />
    <Route path="discounts" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </>
);
