import { useTranslation } from 'react-i18next';
import { Truck, Shield, BadgeCheck, RotateCcw, MessageCircle } from 'lucide-react';
import type { StoreTrust } from '../types';

const ICONS: Record<string, React.ElementType> = {
  cod: Truck,
  secure: Shield,
  verified: BadgeCheck,
  returns: RotateCcw,
};

export function StoreTrustLayer({ trust, compact }: { trust?: StoreTrust; compact?: boolean }) {
  const { t } = useTranslation();
  if (compact) return null;
  if (!trust) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {trust.badges.map((b) => {
          const Icon = ICONS[b.id] || Shield;
          return (
            <div key={b.id} className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <span>{b.label}</span>
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5">
        <p className="font-semibold text-emerald-900">{trust.codTrust.headline}</p>
        <ul className="mt-2 space-y-1 text-sm text-emerald-800">
          {trust.codTrust.bullets.map((b) => (
            <li key={b}>· {b}</li>
          ))}
        </ul>
        {trust.whatsappSupport && (
          <a
            href={trust.whatsappSupport}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-emerald-700 hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            {t('storefront.trust.whatsappSupport')}
          </a>
        )}
      </div>
    </section>
  );
}

export function StoreTrustStrip({ trust }: { trust?: StoreTrust }) {
  if (!trust) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {trust.badges.slice(0, 3).map((b) => (
        <span key={b.id} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium">
          {b.label}
        </span>
      ))}
    </div>
  );
}
