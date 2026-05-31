import { api } from '@/lib/api';

export type PilotStatus = {
  maxSlots: number;
  usedSlots: number;
  remainingSlots: number;
  enrolled: boolean;
  enrolledAt: string | null;
  source?: string | null;
  alreadyEnrolled?: boolean;
};

export const pilotsApi = {
  getStatus: async () => {
    const { data } = await api.get<PilotStatus>('/pilots/status');
    return data;
  },
  getMe: async () => {
    const { data } = await api.get<PilotStatus>('/pilots/me');
    return data;
  },
  enroll: async (source = 'app') => {
    const { data } = await api.post<PilotStatus>('/pilots/enroll', { source });
    return data;
  },
};
