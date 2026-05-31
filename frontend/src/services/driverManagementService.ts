import { api } from '@/lib/api';

export type DriverSummary = {
  _id: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isActive: boolean;
  driverProfile?: { vehicleType?: string };
};

export async function fetchDrivers() {
  const { data } = await api.get<DriverSummary[]>('/merchants/drivers');
  return data;
}

export async function inviteDriver(payload: {
  fullName: string;
  phone: string;
  email?: string;
  vehicleType?: string;
}) {
  const { data } = await api.post<{
    driver: DriverSummary;
    tempPassword: string;
    whatsappSent: boolean;
  }>('/merchants/drivers/invite', payload);
  return data;
}

export async function toggleDriver(driverId: string, isActive: boolean) {
  const { data } = await api.patch(`/merchants/drivers/${driverId}/toggle`, { isActive });
  return data;
}

export type DriverReconciliation = {
  driverId: string;
  name: string;
  phone: string | null;
  isActive: boolean;
  pendingAmount: number;
  pendingCount: number;
  settledAmount: number;
  settledCount: number;
};

export type ReconciliationSummary = {
  summary: {
    totalToCollect: number;
    ordersPending: number;
    driversWithCash: number;
  };
  drivers: DriverReconciliation[];
  updatedAt: string;
};

export async function fetchReconciliation() {
  const { data } = await api.get<ReconciliationSummary>('/merchants/drivers/reconciliation');
  return data;
}

export type SettleResult = {
  settledCount: number;
  settledAmount: number;
  remittedAt: string;
};

export async function settleDriver(driverId: string, orderIds?: string[]) {
  const { data } = await api.post<SettleResult>(
    `/merchants/drivers/${driverId}/settle`,
    orderIds ? { orderIds } : {},
  );
  return data;
}

export type ManifestItem = {
  orderNumber: string;
  customerName: string;
  phone: string | null;
  address: string;
  region: string | null;
  codAmount: number;
  isCod: boolean;
};

export type DriverManifest = {
  driver: { id: string; name: string; phone: string | null };
  generatedAt: string;
  summary: { parcels: number; codParcels: number; codTotal: number };
  items: ManifestItem[];
};

export async function fetchManifest(driverId: string) {
  const { data } = await api.get<DriverManifest>(`/merchants/drivers/${driverId}/manifest`);
  return data;
}
