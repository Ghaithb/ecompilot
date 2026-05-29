import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface UpdateOrderStatusParams {
  orderId: string;
  status?: string;
  paymentStatus?: string;
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderId, status, paymentStatus }: UpdateOrderStatusParams) => {
      const updateData: { status?: string; paymentStatus?: string } = {};
      if (status) updateData.status = status;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      
      return await ordersApi.updateStatus({ orderId, ...updateData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la commande a été mis à jour avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la mise à jour du statut',
        variant: 'destructive',
      });
    },
  });
};