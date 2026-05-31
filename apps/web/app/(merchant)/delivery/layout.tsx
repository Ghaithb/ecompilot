import { DeliverySubNav } from '@/components/DeliverySubNav';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DeliverySubNav />
      {children}
    </div>
  );
}
