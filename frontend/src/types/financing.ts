import type {
  FinancingDashboard as ApiFinancingDashboard,
  FinancingSimulation as ApiFinancingSimulation,
  FinancingRequest as ApiFinancingRequest
} from '@/types/api';

export type FinancingDashboard = ApiFinancingDashboard;
export type SimulationResult = ApiFinancingSimulation;
export type FinancingHistoryItem = ApiFinancingDashboard['requests'][number];
export type FinancingRequest = ApiFinancingRequest;