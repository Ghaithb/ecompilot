import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Package, MessageSquare, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { TUNISIA_GOVERNORATES, getDelegationsForGovernorate } from '@/lib/tunisia-locations';
import { isValidTunisianPhone, normalizeTunisianPhone, formatTunisianPhoneDisplay } from '@/lib/phone.util';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, isEmpty, clearCart } = useCart();
  const { formatPrice, selectedCurrency } = useCurrency();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [phoneError, setPhoneError] = useState('');

  const [form, setForm] = useState({
    fullName: localStorage.getItem('ec_checkout_name') || '',
    phone: localStorage.getItem('ec_checkout_phone') || '',
    governorate: '',
    delegation: '',
    address: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  const delegations = getDelegationsForGovernorate(form.governorate);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTunisianPhone(form.phone)) {
      setPhoneError('Numéro tunisien invalide');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const nameParts = form.fullName.trim().split(/\s+/);
      const phone = normalizeTunisianPhone(form.phone);
      localStorage.setItem('ec_checkout_name', form.fullName);
      localStorage.setItem('ec_checkout_phone', form.phone);

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
          customerEmail: `${phone.replace('+', '')}@guest.ecompilot.local`,
          lineItems: cart?.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || 'default',
            title: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.subtotal,
          })),
          subtotal: cart?.totals.subtotal,
          total: cart?.totals.total,
          currency: selectedCurrency === 'TND' ? 'TND' : selectedCurrency,
          paymentMethod: 'cod',
          status: 'pending',
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
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
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
      clearCart();
      navigate('/orders');
    } catch {
      toast.error('Code invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Commander en 30 sec</CardTitle>
          <p className="text-sm text-gray-500">Sans compte · Paiement à la livraison</p>
        </CardHeader>
        <CardContent>
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                Total: <strong className="text-primary">{formatPrice(cart?.totals.total || 0)}</strong>
              </div>
              <div><Label>Nom complet *</Label><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1 h-12 text-base" /></div>
              <div>
                <Label>Téléphone *</Label>
                <Input required inputMode="tel" value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="22 123 456" className="mt-1 h-12 text-base" />
                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Gouvernorat *</Label>
                  <select required value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value, delegation: '' })} className="mt-1 w-full h-12 px-3 border rounded-md bg-white">
                    <option value="">Choisir</option>
                    {TUNISIA_GOVERNORATES.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Délégation</Label>
                  <select value={form.delegation} onChange={(e) => setForm({ ...form, delegation: e.target.value })} className="mt-1 w-full h-12 px-3 border rounded-md bg-white">
                    <option value="">Choisir</option>
                    {delegations.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>Adresse *</Label><Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 h-12 text-base" /></div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-800"><Truck className="w-4 h-4" />Paiement à la livraison + vérification SMS</div>
              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Confirmer ma commande'}</Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <MessageSquare className="w-12 h-12 text-primary mx-auto" />
              <p className="text-sm text-gray-600">Code envoyé au {formatTunisianPhoneDisplay(form.phone)}</p>
              <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} /></InputOTPGroup>
              </InputOTP>
              <Button onClick={handleOtpVerify} className="w-full h-12" disabled={otpValue.length !== 6 || loading}>Valider</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
