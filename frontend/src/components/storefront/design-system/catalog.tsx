import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import type { StoreProduct } from '@/templates/storefront/types';

export function useCatalogFilters(products: StoreProduct[]) {
  const { t } = useTranslation();
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || t('storefront.sections.generalCategory')));
    return ['all', ...set] as const;
  }, [products, t]);

  return { categories };
}

export function CatalogToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  categories,
  category,
  onCategoryChange,
  resultCount,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  sort: 'popular' | 'price-asc' | 'price-desc';
  onSortChange: (v: 'popular' | 'price-asc' | 'price-desc') => void;
  categories: readonly string[];
  category: string;
  onCategoryChange: (v: string) => void;
  resultCount: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="store-catalog-toolbar space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t('storefront.sections.searchPlaceholder')}
            aria-label={t('storefront.sections.searchAria')}
            className="store-input h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as typeof sort)}
          aria-label={t('storefront.sections.sortAria')}
          className="store-input h-11 rounded-xl border bg-background px-3 text-sm"
        >
          <option value="popular">{t('storefront.sections.sortPopular')}</option>
          <option value="price-asc">{t('storefront.sections.sortPriceAsc')}</option>
          <option value="price-desc">{t('storefront.sections.sortPriceDesc')}</option>
        </select>
      </div>

      <div className="store-category-pills flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t('storefront.sections.categoriesAria')}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={category === cat}
            onClick={() => onCategoryChange(cat)}
            className={`store-pill shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              category === cat ? 'store-pill--active' : 'bg-background hover:bg-muted'
            }`}
          >
            {cat === 'all' ? t('storefront.sections.allCategories') : cat}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {t(resultCount === 1 ? 'storefront.sections.results_one' : 'storefront.sections.results_other', { count: resultCount })}
      </p>
    </div>
  );
}

export function filterCatalogProducts(
  products: StoreProduct[],
  query: string,
  category: string,
  sort: 'popular' | 'price-asc' | 'price-desc',
): StoreProduct[] {
  let list = products.filter((p) => {
    const matchCat = category === 'all' || p.category === category;
    const q = query.trim().toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  return list;
}
