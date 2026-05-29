import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { paymentGatewaysApi } from '@/lib/paymentGatewaysApi';

export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const status = params.get('status');
  const orderId = params.get('orderId');
  const [verifying, setVerifying] = useState(!!orderId);
  const [paid, setPaid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const verify = async () => {
      try {
        const result = await paymentGatewaysApi.verifyPayment(orderId);
        setPaid(result.paid);
      } catch {
        setPaid(status === 'success');
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [orderId, status]);

  const success = paid === true || (paid === null && status === 'success' && !verifying);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {verifying ? (
            <>
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary mb-4" />
              <CardTitle>Vérification du paiement...</CardTitle>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <CardTitle>Paiement confirmé</CardTitle>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <CardTitle>Paiement non confirmé</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {!verifying && (
            <p className="text-gray-600">
              {success
                ? 'Merci ! Votre commande a été payée avec succès.'
                : 'Le paiement a échoué ou est en attente. Réessayez ou contactez le vendeur.'}
            </p>
          )}
          {orderId && <p className="text-xs text-gray-400">Commande: {orderId}</p>}
          <Button asChild className="w-full">
            <Link to="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
