import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatTND } from '@/lib/currency';
import { 
  ShoppingCart, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface Order {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  subject: string;
  status: 'unread' | 'read' | 'replied';
  source: string;
  createdAt: string;
}

interface OrderDetails {
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
}

export default function WebsiteOrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Récupérer les commandes (depuis ContactMessage avec source = 'website-order')
  const { data: orders, isLoading } = useQuery({
    queryKey: ['website-orders', statusFilter],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/website/messages?source=website-order&${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!response.ok) throw new Error('Erreur chargement commandes');
      return response.json();
    }
  });

  // Marquer comme lu
  const markAsReadMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/website/messages/${orderId}/read`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!response.ok) throw new Error('Erreur mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-orders'] });
      toast({
        title: 'Succès',
        description: 'Commande marquée comme lue',
      });
    }
  });

  const parseOrderDetails = (message: string): OrderDetails | null => {
    try {
      const lines = message.split('\n');
      const itemsMatch = message.match(/- (.+?) x(\d+) = ([\d,]+) TND/g);
      
      if (!itemsMatch) return null;
      
      const items = itemsMatch.map(item => {
        const match = item.match(/- (.+?) x(\d+) = ([\d,]+) TND/);
        if (!match) return null;
        return {
          title: match[1],
          quantity: parseInt(match[2]),
          price: parseFloat(match[3].replace(',', '.'))
        };
      }).filter(Boolean) as OrderDetails['items'];
      
      const totalMatch = message.match(/Total: ([\d,]+) TND/);
      const total = totalMatch ? parseFloat(totalMatch[1].replace(',', '.')) : 0;
      
      return {
        items,
        total,
        customer: {
          name: '',
          email: '',
          phone: ''
        }
      };
    } catch {
      return null;
    }
  };

  const filteredOrders = orders?.filter((order: Order) => 
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: orders?.length || 0,
    unread: orders?.filter((o: Order) => o.status === 'unread').length || 0,
    completed: orders?.filter((o: Order) => o.status === 'replied').length || 0,
    revenue: orders?.reduce((sum: number, order: Order) => {
      const details = parseOrderDetails(order.message);
      return sum + (details?.total || 0);
    }, 0) || 0
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Commandes Site Web</h1>
        <p className="text-muted-foreground">Gérez les commandes reçues depuis votre site web</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Traitées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTND(stats.revenue, 2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="unread">En attente</SelectItem>
                <SelectItem value="read">En cours</SelectItem>
                <SelectItem value="replied">Traitées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredOrders?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune commande trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order: Order) => {
                  const details = parseOrderDetails(order.message);
                  
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {order.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {details?.items.length || 0} produit(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">
                          {formatTND(details?.total, 2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'unread' ? 'destructive' :
                          order.status === 'read' ? 'default' : 'secondary'
                        }>
                          {order.status === 'unread' ? 'En attente' :
                           order.status === 'read' ? 'En cours' : 'Traitée'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === 'unread' && (
                            <Button
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(order._id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la Commande</DialogTitle>
            <DialogDescription>
              Commande du {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {/* Infos Client */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <strong>Nom:</strong> {selectedOrder.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <strong>Email:</strong> {selectedOrder.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <strong>Téléphone:</strong> {selectedOrder.phone}
                  </div>
                </CardContent>
              </Card>

              {/* Détails Commande */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détails de la Commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                    {selectedOrder.message}
                  </pre>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    markAsReadMutation.mutate(selectedOrder._id);
                    setShowDetails(false);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marquer comme traitée
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${selectedOrder.email}`)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
