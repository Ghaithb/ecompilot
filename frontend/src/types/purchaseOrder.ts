export interface PurchaseOrder {
  _id: string;
  financingRequestId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  details?: {
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderInput {
  financingRequestId: string;
  amount: number;
  details?: {
    description?: string;
  };
}