import { useQuery } from '@tanstack/react-query';
import { ordersApiModule } from '../api/orders.api';

export function useOrdersQuery() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: ordersApiModule.list,
  });
}
