import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, MessageSquare, Package } from 'lucide-react';
import { toast } from 'sonner';
import { TUNISIA_GOVERNORATES, getDelegationsForGovernorate } from '@/lib/tunisia-locations';
import { isValidTunisianPhone, normalizeTunisianPhone, formatTunisianPhoneDisplay } from '@/lib/phone.util';
import { CheckoutTrustBadges } from '@/components/Checkout/CheckoutTrustBadges';
import { CheckoutUpsellRow } from '@/components/Checkout/CheckoutUpsellRow';
import {
  fetchCheckoutQuote,
  fetchCheckoutUpsells,
  fetchCheckoutTrust,
  startCheckoutSession,
  predictCheckoutAbandonment,
  trackCheckoutStep,
} from '@/lib/checkoutApi';
import { ProviderBadge } from '@/modules/delivery/components/ProviderBadge';
import type { DeliveryProviderId } from '@/modules/delivery/services/deliveryApi';

const PROVIDER_LABELS: Record<string, string> = {
  first_delivery: 'First Delivery',
  intigo: 'INTIGO',
  shipper: 'Shipper',
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, isEmpty, clearCart, addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [step, setStep] = useState<'checkout' | 'otp'>('checkout');
  const [loading, setLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [createdOrder, setCreatedOrder] = useState<{ _id: string } | null>(null);
  const [phoneError, setPhoneError] = useState('');

  const [form, setForm] = useState({
    fullName: localStorage.getItem('ec_checkout_name') || '',
    phone: localStorage.getItem('ec_checkout_phone') || '',
    email: localStorage.getItem('ec_checkout_email') || '',
    governorate: localStorage.getItem('ec_checkout_governorate') || '',
    delegation: localStorage.getItem('ec_checkout_delegation') || '',
    address: localStorage.getItem('ec_checkout_address') || '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  const delegations = getDelegationsForGovernorate(form.governorate);
  const canQuote = Boolean(form.governorate && form.address && isValidTunisianPhone(form.phone));

  const productIds = useMemo(
    () => cart?.items.map((i) => i.productId) || [],
    [cart?.items],
  );

  const { data: trust } = useQuery({
    queryKey: ['checkout-trust'],
    queryFn: fetchCheckoutTrust,
  });

  const { data: upsells = [] } = useQuery({
    queryKey: ['checkout-upsells', productIds.join(',')],
    queryFn: () => fetchCheckoutUpsells(productIds),
    enabled: productIds.length > 0,
  });

  const { data: quote, isFetching: quoting } = useQuery({
    queryKey: ['checkout-quote', form.governorate, form.delegation, form.address, cart?.totals.subtotal],
    queryFn: () =>
      fetchCheckoutQuote({
        address: {
          fullName: form.fullName || 'Client',
          phone: normalizeTunisianPhone(form.phone),
          email: form.email || undefined,
          address: form.address,
          governorate: form.governorate,
          delegation: form.delegation,
        },
      }),
    enabled: canQuote && !isEmpty,
  });

  const { data: abandonPrediction } = useQuery({
    queryKey: ['checkout-predict', form.phone, form.governorate, form.address],
    queryFn: () =>
      predictCheckoutAbandonment({
        address: canQuote
          ? {
              fullName: form.fullName || 'Client',
              phone: normalizeTunisianPhone(form.phone),
              email: form.email || undefined,
              address: form.address,
              governorate: form.governorate,
              delegation: form.delegation,
            }
          : undefined,
      }),
    enabled: canQuote && !isEmpty && step === 'checkout',
  });

  useEffect(() => {
    if (!isEmpty && step === 'checkout') {
      startCheckoutSession().catch(() => {});
    }
  }, [isEmpty, step]);

  useEffect(() => {
    if (!canQuote || isEmpty || step !== 'checkout') return;
    const stepNum = form.fullName && form.phone ? (form.governorate && form.address ? 3 : 2) : 1;
    trackCheckoutStep({
      step: stepNum,
      address: {
        fullName: form.fullName || 'Client',
        phone: normalizeTunisianPhone(form.phone),
        email: form.email || undefined,
        address: form.address,
        governorate: form.governorate,
        delegation: form.delegation,
      },
    }).catch(() => {});
  }, [form.fullName, form.phone, form.governorate, form.address, canQuote, isEmpty, step]);

  useEffect(() => {
    if (!abandonPrediction?.showExitWarning) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = abandonPrediction.message;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [abandonPrediction]);

  const persistForm = () => {
    localStorage.setItem('ec_checkout_name', form.fullName);
    localStorage.setItem('ec_checkout_phone', form.phone);
    localStorage.setItem('ec_checkout_email', form.email);
    localStorage.setItem('ec_checkout_governorate', form.governorate);
    localStorage.setItem('ec_checkout_delegation', form.delegation);
    localStorage.setItem('ec_checkout_address', form.address);
  };

  if (isEmpty && step !== 'otp') {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Panier vide</h2>
            <Button onClick={() => navigate('/products')}>Voir les produits</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 5) formatted = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    else if (digits.length >= 2) formatted = `${digits.slice(0, 2)} ${digits.slice(2)}`;
    setForm({ ...form, phone: formatted });
    setPhoneError(digits.length === 8 && /^[2-9]/.test(digits) ? '' : 'Numéro tunisien invalide');
  };

  const displayTotals = quote?.totals || cart?.totals;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTunisianPhone(form.phone)) {
      setPhoneError('Numéro tunisien invalide');
      return;
    }

    setLoading(true);
    persistForm();

    try {
      const token = localStorage.getItem('auth_token');
      const nameParts = form.fullName.trim().split(/\s+/);
      const phone = normalizeTunisianPhone(form.phone);

      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shippingAddress: {
            firstName: nameParts[0] || 'Client',
            lastName: nameParts.slice(1).join(' ') || '',
            phone,
            address: form.address,
            city: [form.delegation, form.governorate].filter(Boolean).join(', '),
            governorate: form.governorate,
            delegation: form.delegation,
            country: 'TN',
          },
          billingAddress: {
            firstName: nameParts[0] || 'Client',
            lastName: nameParts.slice(1).join(' ') || '',
            phone,
            address: form.address,
            city: [form.delegation, form.governorate].filter(Boolean).join(', '),
            country: 'TN',
          },
          customerEmail: form.email || `${phone.replace('+', '')}@guest.ecompilot.local`,
          lineItems: cart?.items.map((item) => ({
            productId: item.productId,
            variantId: 'default',
            title: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.subtotal,
          })),
          subtotal: displayTotals?.subtotal,
          total: displayTotals?.total,
          shippingCost: displayTotals?.shipping,
          currency: 'TND',
          paymentMethod: 'cod',
          status: 'pending',
          shippingProvider: quote?.best?.provider,
          metadata: {
            estimatedDeliveryAt: quote?.estimatedDeliveryAt,
          },
        }),
      });

      if (!orderResponse.ok) {
        const err = await orderResponse.json();
        throw new Error(err.message || 'Erreur commande');
      }

      const orderData = await orderResponse.json();
      setCreatedOrder(orderData);
      setStep('otp');
      toast.success('Code SMS envoyé');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!createdOrder) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/orders/${createdOrder._id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: otpValue }),
      });
      if (!response.ok) throw new Error('Code incorrect');
      toast.success('Commande confirmée !');
      await clearCart();
      navigate('/orders');
    } catch {
      toast.error('Code invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Checkout express</h1>
        <p className="text-sm text-muted-foreground">Sans compte · Paiement à la livraison · Une seule page</p>
      </div>

      {step === 'checkout' ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vos informations</CardTitle>
              </CardHeader>
              <CardContent>
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Nom complet *</Label>
                    <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1 h-11" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Téléphone *</Label>
                      <Input required inputMode="tel" value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="22 123 456" className="mt-1 h-11" />
                      {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                    </div>
                    <div>
                      <Label>Email (optionnel)</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 h-11" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Gouvernorat *</Label>
                      <select required value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value, delegation: '' })} className="mt-1 w-full h-11 px-3 border rounded-md bg-white">
                        <option value="">Choisir</option>
                        {TUNISIA_GOVERNORATES.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Délégation</Label>
                      <select value={form.delegation} onChange={(e) => setForm({ ...form, delegation: e.target.value })} className="mt-1 w-full h-11 px-3 border rounded-md bg-white">
                        <option value="">Choisir</option>
                        {delegations.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Adresse *</Label>
                    <Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 h-11" />
                  </div>
                </form>
              </CardContent>
            </Card>

            <CheckoutTrustBadges badges={trust?.badges} />

            {(trust?.codTrust || abandonPrediction?.codTrust) && (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="pt-4 text-sm">
                  <p className="font-semibold text-green-900">
                    {(trust?.codTrust || abandonPrediction?.codTrust)?.headline}
                  </p>
                  <ul className="mt-2 space-y-1 text-green-800 list-disc list-inside">
                    {((trust?.codTrust || abandonPrediction?.codTrust)?.bullets || []).map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {upsells.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <CheckoutUpsellRow
                    products={upsells}
                    onAdd={(id) => addToCart(id, 1)}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cart?.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}

                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{formatPrice(displayTotals?.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      Livraison
                      {(quote?.optimization?.frictionTooltips || abandonPrediction?.frictionTooltips?.length) && (
                        <span
                          title={
                            quote?.optimization?.frictionTooltips ||
                            abandonPrediction?.frictionTooltips?.[0]?.message
                          }
                          className="cursor-help text-muted-foreground"
                        >
                          ⓘ
                        </span>
                      )}
                    </span>
                    <span>
                      {quoting ? '…' : formatPrice(displayTotals?.shipping ?? 7)}
                    </span>
                  </div>
                  {quote?.optimization?.deliverySensitivityWarning && (
                    <p className="text-xs text-amber-700">{quote.optimization.deliverySensitivityWarning}</p>
                  )}
                  {(displayTotals?.discount || 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span>-{formatPrice(displayTotals?.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t">
                    <span>Total COD</span>
                    <span className="text-primary">{formatPrice(displayTotals?.total || 0)}</span>
                  </div>
                </div>

                {quote?.best && (
                  <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-2">
                    <p className="font-medium">Meilleur transporteur</p>
                    <ProviderBadge provider={quote.best.provider as DeliveryProviderId} />
                    <p className="text-muted-foreground">
                      {PROVIDER_LABELS[quote.best.provider] || quote.best.provider} ·{' '}
                      {quote.best.estimatedDays} j · {formatPrice(quote.best.rate)}
                    </p>
                    {(quote.optimization?.limitedTimeDeliveryGuarantee ||
                      abandonPrediction?.showDeliveryGuarantee) && (
                      <p className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-blue-800 font-medium">
                        Garantie livraison 24-72h
                      </p>
                    )}
                    {quote.deliveryConfidence != null && (
                      <p>Confiance livraison : {quote.deliveryConfidence}%</p>
                    )}
                    {quote.estimatedDeliveryAt && (
                      <p>Livraison estimée : {new Date(quote.estimatedDeliveryAt).toLocaleDateString('fr-TN')}</p>
                    )}
                  </div>
                )}

                {abandonPrediction?.showExitWarning && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    {abandonPrediction.message}
                  </div>
                )}

                <Button type="submit" form="checkout-form" className="w-full h-12 text-base" disabled={loading || quoting}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirmer ma commande COD'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center space-y-4 pt-8">
            <MessageSquare className="w-12 h-12 text-primary mx-auto" />
            <p className="text-sm text-gray-600">Code envoyé au {formatTunisianPhoneDisplay(form.phone)}</p>
            <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
              <InputOTPGroup>
                <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={handleOtpVerify} className="w-full h-12" disabled={otpValue.length !== 6 || loading}>
              Valider ma commande
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
