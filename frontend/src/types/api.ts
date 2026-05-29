// Types pour les APIs
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Types pour Financement
export interface FinancingRepayment {
  percentRepaid: number;
}

export interface ActiveFinancing {
  amountRequested: number;
  status: string;
  repayment?: FinancingRepayment;
}

export interface FinancingDashboard {
  active: ActiveFinancing | null;
  requests: Array<{
    _id: string;
    amountRequested: number;
    status: string;
    createdAt: string;
  }>;
}

export interface FinancingSimulation {
  amountRequested: number;
  rbfRate: number;
  totalSales: number;
  salesHistory: {
    totalSales: number;
  };
}

export interface FinancingRequest {
  amountRequested: number;
  rbfRate: number;
  salesHistory: {
    totalSales: number;
  };
}

// Types pour Inventaire
export interface InventorySummary {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  platforms: Array<{
    name: string;
    products: Array<{
      sku: string;
      stock: number;
    }>;
  }>;
}

// Types pour Bons de commande
export interface PurchaseOrder {
  id: string;
  financingRequestId?: string;
  amount: number;
  details: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrder {
  financingRequestId?: string;
  amount: number;
  details: string;
}