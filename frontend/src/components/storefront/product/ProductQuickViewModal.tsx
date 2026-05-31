import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, X } from 'lucide-react';
import type { StoreProduct } from '@/templates/storefront/types';
import { useStorefront } from '@/modules/storefront/context/StorefrontContext';
import { CTAButton, StorePrice } from '../design-system/commerce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ProductQuickViewModal({
  product,
  slug,
  open,
  onOpenChange,
}: {
  product: StoreProduct | null;
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addItem } = useStorefront();
  const { t } = useTranslation();

  if (!product) return null;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.title,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="store-quickview max-w-md gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          aria-label={t('storefront.close')}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="aspect-square bg-muted">
          {product.image ? (
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/40" aria-hidden />
            </div>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div>
            <h2 className="text-lg font-semibold leading-snug">{product.title}</h2>
            {product.description && (
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{product.description}</p>
            )}
          </div>

          <StorePrice amount={product.price} size="lg" suffix="DT" />

          <div className="flex flex-col gap-2">
            <CTAButton href={`/store/${slug}/checkout`} className="w-full">
              {t('storefront.sections.orderCodBtn')}
            </CTAButton>
            <button
              type="button"
              onClick={handleAdd}
              className="w-full rounded-full border py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              {t('storefront.sections.addToCart')}
            </button>
            <Link
              to={`/store/${slug}/product/${product.id}`}
              className="text-center text-sm font-medium text-[var(--store-primary)] hover:underline"
              onClick={() => onOpenChange(false)}
            >
              {t('storefront.sections.viewFullPage')}
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
