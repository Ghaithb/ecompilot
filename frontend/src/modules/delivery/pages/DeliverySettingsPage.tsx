import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const DeliverySettingsPage: React.FC = () => (
  <div className="p-6 max-w-2xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold">Paramètres livraison</h1>
    <Card>
      <CardHeader>
        <CardTitle>Clés API transporteurs</CardTitle>
        <CardDescription>
          Configurez via <code className="text-xs">.env</code> ou POST{' '}
          <code className="text-xs">/delivery/settings/credentials</code> (token chiffré).
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-2 text-muted-foreground">
        <p>FIRST_DELIVERY_API_KEY — First Delivery v2</p>
        <p>INTIGO_API_URL + INTIGO_API_KEY — INTIGO partenaire</p>
        <p>SHIPPER_API_KEY — Shipper.network</p>
        <p>ARAMEX_* — Aramex TN</p>
        <p>DELIVERY_ENCRYPTION_KEY — chiffrement credentials tenant</p>
      </CardContent>
    </Card>
  </div>
);

export default DeliverySettingsPage;
