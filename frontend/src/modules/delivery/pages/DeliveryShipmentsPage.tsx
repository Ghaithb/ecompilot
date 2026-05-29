import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeliveryPageShell } from '../components/DeliveryPageShell';
import { CreateShipmentDialog } from '../components/CreateShipmentDialog';
import { ShipmentStatusBadge } from '../components/ShipmentStatusBadge';
import { fetchDeliveryShipments, PROVIDER_LABELS } from '../services/deliveryApi';
import type { DeliveryProviderId, Shipment } from '../types/delivery.types';

const DeliveryShipmentsPage: React.FC = () => {
  const [status, setStatus] = useState('all');
  const [provider, setProvider] = useState('all');
  const [search, setSearch] = useState('');

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['delivery-shipments', status, provider],
    queryFn: () =>
      fetchDeliveryShipments({
        ...(status !== 'all' ? { status } : {}),
        ...(provider !== 'all' ? { provider } : {}),
      }),
  });

  const filtered = shipments.filter((s: Shipment) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.trackingNumber?.toLowerCase().includes(q) ||
      s.orderNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <DeliveryPageShell
      title="Expéditions"
      description="Liste de tous les colis — cliquez pour le détail et le suivi."
      actions={<CreateShipmentDialog />}
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher suivi ou commande…"
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px] bg-card">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="created">Créé</SelectItem>
            <SelectItem value="in_transit">En transit</SelectItem>
            <SelectItem value="delivered">Livré</SelectItem>
            <SelectItem value="refused">Refusé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="w-[160px] bg-card">
            <SelectValue placeholder="Transporteur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="intigo">INTIGO</SelectItem>
            <SelectItem value="first_delivery">First Delivery</SelectItem>
            <SelectItem value="shipper">Shipper</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <p className="text-muted-foreground mb-4">Aucune expédition trouvée.</p>
            <CreateShipmentDialog />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Commande</TableHead>
                <TableHead>Transporteur</TableHead>
                <TableHead>N° suivi</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow
                  key={s._id}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="font-medium">
                    <Link to={`/delivery/shipments/${s._id}`} className="hover:underline">
                      {s.orderNumber || '—'}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {PROVIDER_LABELS[s.provider as DeliveryProviderId] ||
                      s.provider.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.trackingNumber}</TableCell>
                  <TableCell>
                    <ShipmentStatusBadge status={s.status} />
                    {s.mock && (
                      <span className="ml-2 text-[10px] uppercase text-amber-600">demo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/delivery/shipments/${s._id}`}
                      className="inline-flex text-muted-foreground hover:text-primary"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DeliveryPageShell>
  );
};

export default DeliveryShipmentsPage;
