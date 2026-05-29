import React, { useState } from 'react';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Camera } from 'lucide-react';

const REFUSAL_REASONS = [
  { id: 'change_of_mind', label: 'Changement d\'avis' },
  { id: 'product_different', label: 'Produit différent' },
  { id: 'defective', label: 'Produit défectueux' },
  { id: 'client_absent', label: 'Client absent' },
  { id: 'other', label: 'Autre' },
];

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderTotal: number;
  status: 'out_for_delivery' | 'delivered' | 'refused';
  onSuccess: () => void;
};

const DeliveryStatusDialog: React.FC<Props> = ({
  open,
  onClose,
  orderId,
  orderTotal,
  status,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [refusalReason, setRefusalReason] = useState('change_of_mind');
  const [amountCollected, setAmountCollected] = useState(String(orderTotal));

  const uploadPhoto = async (file: File) => {
    const fd = new FormData();
    fd.append('photo', file);
    const { data } = await api.post<{ url: string }>('/upload/delivery-proof', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setPhotoUrl(data.url);
  };

  const submit = async () => {
    if ((status === 'delivered' || status === 'refused') && !photoUrl) {
      alert('Photo obligatoire');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/driver/deliveries/${orderId}/status`, {
        status: status === 'delivered' ? 'delivered' : status,
        deliveryProofUrl: photoUrl,
        refusalReason: status === 'refused' ? refusalReason : undefined,
        amountCollected: status === 'delivered' ? parseFloat(amountCollected) : undefined,
      });
      onSuccess();
      onClose();
    } catch {
      alert('Erreur mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {status === 'delivered' && 'Confirmer livraison'}
            {status === 'refused' && 'Refus client'}
            {status === 'out_for_delivery' && 'En route'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {(status === 'delivered' || status === 'refused') && (
            <>
              <div>
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photo preuve *
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="mt-1"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadPhoto(f);
                  }}
                />
                {photoUrl && <p className="text-xs text-green-600 mt-1">Photo OK</p>}
              </div>
              {status === 'delivered' && (
                <div>
                  <Label>Montant collecté (COD)</Label>
                  <Input
                    type="number"
                    value={amountCollected}
                    onChange={(e) => setAmountCollected(e.target.value)}
                  />
                </div>
              )}
              {status === 'refused' && (
                <div>
                  <Label>Raison</Label>
                  <Select value={refusalReason} onValueChange={setRefusalReason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REFUSAL_REASONS.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Valider'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryStatusDialog;
