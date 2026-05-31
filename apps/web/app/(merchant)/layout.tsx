import { MerchantNav } from '@/components/MerchantNav';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MerchantNav />
      <div className="merchant-main">{children}</div>
    </>
  );
}
