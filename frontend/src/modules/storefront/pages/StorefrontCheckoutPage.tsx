import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { TUNISIA_GOVERNORATES, getDelegationsForGovernorate } from '@/lib/tunisia-locations';
import { COUNTRIES } from '@/lib/countries';
import { normalizeInternationalPhone } from '@/lib/phone.util';
import { getCheckoutFormErrors, isCheckoutFormValid } from '@/lib/checkout-validation';
import { submitStoreCheckout, verifyStoreOtp, trackStoreEvent } from '../api/storefrontApi';
import { useStorefront } from '../context/StorefrontContext';
import { trackStoreCommerceEvent } from '../lib/storeTracking';
import { StorefrontLayout } from '../components/StorefrontHeader';
import { StoreTrustLayer } from '../components/StoreTrustLayer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SELECT_CLASS =
  'mt-1 w-full h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground';

const SORTED_COUNTRIES = [
  ...COUNTRIES.filter((c) => c.code === 'TN'),
  ...COUNTRIES.filter((c) => c.code !== 'TN').sort((a, b) => a.name.localeCompare(b.name, 'fr')),
];

function fieldErrorMessage(
  t: (key: string) => string,
  error?: 'required' | 'invalid',
  field?: 'email' | 'phone' | 'address',
): string | undefined {
  if (!error) return undefined;
  if (error === 'required') return t('checkout.fieldRequired');
  if (field === 'email') return t('checkout.invalidEmail');
  if (field === 'phone') return t('checkout.invalidPhoneIntl');
  if (field === 'address') return t('checkout.invalidAddress');
  return t('checkout.fieldRequired');
}

export function StorefrontCheckoutPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { sessionId, items, preview, slug: ctxSlug, store } = useStorefront();
  const storeSlug = slug || ctxSlug;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [orderId, setOrderId] = useState('');
  const [otp, setOtp] = useState('');
  const [touched, setTouched] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    phoneCountry: 'TN',
    address: '',
    governorate: '',
    delegation: '',
  });

  const delegations = getDelegationsForGovernorate(form.governorate);
  const total = preview?.totals?.total ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
  const errors = useMemo(() => getCheckoutFormErrors(form, delegations), [form, delegations]);
  const isValid = useMemo(() => isCheckoutFormValid(form, delegations), [form, delegations]);

  const selectedCountry = SORTED_COUNTRIES.find((c) => c.code === form.phoneCountry);
  const phonePlaceholder =
    form.phoneCountry === 'TN'
      ? t('checkout.phonePlaceholderTn')
      : selectedCountry
        ? `${selectedCountry.dialCode} …`
        : '+216 …';

  const fireCheckoutStarted = () => {
    const payload = { value: total, currency: store?.store.currency || 'TND', items: items.length };
    trackStoreEvent(storeSlug, { event: 'checkout_started', deviceType: 'mobile', sessionId }).catch(() => {});
    trackStoreCommerceEvent('checkout_started', store?.analytics, payload);
  };

  const firePurchase = (orderValue: number) => {
    const payload = { value: orderValue, currency: store?.store.currency || 'TND' };
    trackStoreEvent(storeSlug, { event: 'purchase', deviceType: 'mobile', sessionId }).catch(() => {});
    trackStoreCommerceEvent('purchase', store?.analytics, payload);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) {
      toast.error(t('checkout.formIncomplete'));
      return;
    }
    if (!items.length) {
      toast.error(t('checkout.emptyCart'));
      return;
    }

    setLoading(true);
    fireCheckoutStarted();
    try {
      const result = await submitStoreCheckout(storeSlug, {
        sessionId,
        address: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: normalizeInternationalPhone(form.phone, form.phoneCountry),
          address: form.address.trim(),
          governorate: form.governorate,
          delegation: form.delegation,
          country: form.phoneCountry,
        },
      });
      setOrderId(result.order?._id || result.order?.id);
      setStep('otp');
      toast.success(t('checkout.smsSent'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('checkout.orderError'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyStoreOtp(storeSlug, orderId, otp);
      firePurchase(total);
      toast.success(t('checkout.orderConfirmed'));
      localStorage.removeItem(`ec_cart_${storeSlug}`);
      navigate(`/track?order=${orderId}`);
    } catch {
      toast.error(t('checkout.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  if (!items.length && step === 'form') {
    return (
      <StorefrontLayout>
        <div className="max-w-md mx-auto p-8 text-center space-y-4">
          <p className="text-muted-foreground">{t('checkout.emptyCart')}</p>
          <Link to={`/store/${storeSlug}`} className="text-primary font-medium">{t('checkout.continueShopping')}</Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-lg px-4 py-6 pb-24">
        <Link to={`/store/${storeSlug}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          {t('checkout.backToStore')}
        </Link>

        <h1 className="text-xl font-semibold mb-1">{t('checkout.title')}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t('checkout.subtitle')}</p>

        {step === 'form' ? (
          <>
            <div className="rounded-2xl border p-4 mb-6 space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="tabular-nums">{(item.price * item.quantity).toFixed(0)} TND</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>{t('checkout.totalCod')}</span>
                <span className="tabular-nums">{total.toFixed(0)} TND</span>
              </div>
            </div>

            {preview?.freeShipping && !preview.freeShipping.unlocked && (
              <p className="text-xs text-muted-foreground mb-4">
                {t('store.freeShippingRemaining', { amount: `${preview.freeShipping.remaining.toFixed(0)} TND` })}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="checkout-fullName">{t('checkout.fullName')}</Label>
                <Input
                  id="checkout-fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  onBlur={() => setTouched(true)}
                  className={`mt-1 h-11 ${touched && errors.fullName ? 'border-destructive' : ''}`}
                  autoComplete="name"
                />
                {touched && errors.fullName && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrorMessage(t, errors.fullName)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="checkout-email">{t('checkout.email')}</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onBlur={() => setTouched(true)}
                  placeholder="client@exemple.com"
                  className={`mt-1 h-11 ${touched && errors.email ? 'border-destructive' : ''}`}
                />
                {touched && errors.email && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrorMessage(t, errors.email, 'email')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="checkout-phone">{t('checkout.phone')}</Label>
                <div className="mt-1 flex gap-2">
                  <select
                    id="checkout-phone-country"
                    value={form.phoneCountry}
                    onChange={(e) => setForm({ ...form, phoneCountry: e.target.value })}
                    className={`${SELECT_CLASS} w-[7.5rem] shrink-0`}
                    aria-label={t('checkout.phoneCountry')}
                  >
                    {SORTED_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.dialCode}
                      </option>
                    ))}
                  </select>
                  <Input
                    id="checkout-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    onBlur={() => setTouched(true)}
                    placeholder={phonePlaceholder}
                    className={`h-11 flex-1 ${touched && errors.phone ? 'border-destructive' : ''}`}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t('checkout.phoneHint')}</p>
                {touched && errors.phone && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrorMessage(t, errors.phone, 'phone')}</p>
                )}
              </div>

              <div>
                <Label htmlFor="checkout-governorate">{t('checkout.governorate')}</Label>
                <select
                  id="checkout-governorate"
                  value={form.governorate}
                  onChange={(e) => setForm({ ...form, governorate: e.target.value, delegation: '' })}
                  onBlur={() => setTouched(true)}
                  className={`${SELECT_CLASS} ${touched && errors.governorate ? 'border-destructive' : ''}`}
                >
                  <option value="">{t('checkout.choose')}</option>
                  {TUNISIA_GOVERNORATES.map((g) => (
                    <option key={g.name} value={g.name}>{g.name}</option>
                  ))}
                </select>
                {touched && errors.governorate && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrorMessage(t, errors.governorate)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="checkout-delegation">{t('checkout.delegation')}</Label>
                <select
                  id="checkout-delegation"
                  value={form.delegation}
                  onChange={(e) => setForm({ ...form, delegation: e.target.value })}
                  onBlur={() => setTouched(true)}
                  disabled={!form.governorate}
                  className={`${SELECT_CLASS} disabled:opacity-50 ${touched && errors.delegation ? 'border-destructive' : ''}`}
                >
                  <option value="">{t('checkout.choose')}</option>
                  {delegations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {touched && errors.delegation && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrorMessage(t, errors.delegation)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="checkout-address">{t('checkout.address')}</Label>
                <Input
                  id="checkout-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  onBlur={() => setTouched(true)}
                  autoComplete="street-address"
                  placeholder={t('checkout.addressPlaceholder')}
                  className={`mt-1 h-11 ${touched && errors.address ? 'border-destructive' : ''}`}
                />
                {touched && errors.address && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrorMessage(t, errors.address, 'address')}</p>
                )}
              </div>

              {preview?.trust && <StoreTrustLayer trust={preview.trust} />}

              <button
                type="submit"
                disabled={loading || !isValid}
                className="w-full h-12 rounded-full bg-primary text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t('store.confirmOrderCod', { amount: `${total.toFixed(0)} TND` })}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center py-8">
            <p className="text-sm text-muted-foreground">{t('checkout.enterSmsCode')}</p>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="text-center text-lg tracking-widest h-12" />
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || otp.length < 4}
              className="w-full h-12 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {t('checkout.validateOrder')}
            </button>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
