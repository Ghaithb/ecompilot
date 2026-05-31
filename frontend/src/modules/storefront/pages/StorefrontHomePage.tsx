import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { fetchStore } from '../api/storefrontApi';
import { useStorefront } from '../context/StorefrontContext';
import type { StoreProduct } from '../types';
import { buildStorefrontProps, resolveTemplateId } from '@/templates/storefront/utils';
import { getTemplateById } from '@/templates/storefront/templateRegistry';

/** Dynamic storefront home — renders template from store.templateId */
export function StorefrontHomePage() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  const { setStore, recentlyViewedIds } = useStorefront();

  const { data, isLoading, error } = useQuery({
    queryKey: ['storefront', slug],
    queryFn: () => fetchStore(slug),
    enabled: Boolean(slug),
  });

  useEffect(() => {
    if (data) setStore(data);
  }, [data, setStore]);

  const recentlyViewed = useMemo(() => {
    if (!data?.intelligence) return [];
    const all = [
      ...data.intelligence.trending,
      ...data.intelligence.bestSellers,
      ...data.intelligence.topRecovered,
    ];
    const map = new Map(all.map((p) => [p.id, p]));
    return recentlyViewedIds.map((id) => map.get(id)).filter(Boolean) as StoreProduct[];
  }, [data, recentlyViewedIds]);

  const template = useMemo(
    () => (data ? getTemplateById(resolveTemplateId(data)) : null),
    [data],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data || !template) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">{t('storefront.unavailableTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-2">{t('storefront.unavailableDesc')}</p>
        </div>
      </div>
    );
  }

  const props = buildStorefrontProps(slug, data, recentlyViewed);
  props.onScrollToProducts = () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const TemplateComponent = template.component;
  return <TemplateComponent {...props} />;
}
