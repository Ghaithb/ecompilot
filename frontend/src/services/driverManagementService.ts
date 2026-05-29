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
