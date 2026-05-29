import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { fetchDrivers, type DriverSummary } from '@/services/driverManagementService';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const ASSIGNABLE_STATUSES = new Set(['prepared', 'shipped', 'assigned_to_driver']);

type Props = {
  orderId: string;
  orderStatus: string;
  assignedDriverId?: string;
};

const driverLabel = (d: DriverSummary) =>
  d.fullName || `${d.firstName} ${d.lastName}`.trim() || d.phone;

export const AssignDriverSelect: React.FC<Props> = ({
  orderId,
  orderStatus,
  assignedDriverId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['merchant-drivers'],
    queryFn: fetchDrivers,
  });

  const assignMutation = useMutation({
    mutationFn: (driverId: string) => ordersApi.assignDriver(orderId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Livreur assigné', description: 'La commande est assignée au livreur.' });
    },
    onError: (err: Error) => {
      toast({
        title: 'Assignation impossible',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const canAssign = ASSIGNABLE_STATUSES.has(orderStatus);
  const activeDrivers = drivers.filter((d) => d.isActive);

  if (!canAssign && !assignedDriverId) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (activeDrivers.length === 0) {
    return (
      <span className="text-xs text-muted-foreground" title="Invitez un livreur depuis Livreurs">
        Aucun livreur
      </span>
    );
  }

  const value = assignedDriverId || '';

  return (
    <Select
      value={value || undefined}
      onValueChange={(driverId) => assignMutation.mutate(driverId)}
      disabled={!canAssign || assignMutation.isPending}
    >
      <SelectTrigger className="w-[160px] h-8 text-xs" aria-label="Assigner un livreur">
        <SelectValue placeholder={canAssign ? 'Choisir livreur' : 'Assigné'} />
      </SelectTrigger>
      <SelectContent>
        {activeDrivers.map((d) => (
          <SelectItem key={d._id} value={d._id}>
            {driverLabel(d)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
