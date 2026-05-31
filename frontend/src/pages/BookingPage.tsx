import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Calendar, Clock, User, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { apiClient } from '@/lib/api-client';

interface Service {
    _id: string;
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
    isActive: boolean;
}

interface Booking {
    _id: string;
    serviceId: Service | string;
    customerId?: { name: string; email: string };
    customerName?: string;
    customerEmail?: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    price: number;
    paymentStatus: 'pending' | 'deposit_paid' | 'fully_paid';
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
};

const BookingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('bookings');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
        queryKey: ['bookings'],
        queryFn: async () => {
            const response = await apiClient.get('/booking');
            return response.data;
        },
    });

    const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await apiClient.get('/booking/services');
            return response.data;
        },
    });

    const confirmBooking = useMutation({
        mutationFn: async (bookingId: string) => {
            return apiClient.post(`/booking/${bookingId}/confirm`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast({ title: 'Réservation confirmée' });
        },
    });

    const cancelBooking = useMutation({
        mutationFn: async (bookingId: string) => {
            return apiClient.post(`/booking/${bookingId}/cancel`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast({ title: 'Réservation annulée' });
        },
    });

    const filteredBookings = useMemo(() => {
        if (statusFilter === 'all') return bookings;
        return bookings.filter((b) => b.status === statusFilter);
    }, [bookings, statusFilter]);

    const isLoading = bookingsLoading || servicesLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Réservations & Services</h1>
                    <p className="text-muted-foreground">Gérez vos rendez-vous et services</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Service
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="bookings">
                        <Calendar className="w-4 h-4 mr-2" />
                        Réservations ({bookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="services">
                        <Clock className="w-4 h-4 mr-2" />
                        Services ({services.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="bookings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Réservations</CardTitle>
                            <CardDescription>Gérez les rendez-vous de vos clients</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-6">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrer par statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="confirmed">Confirmé</SelectItem>
                                        <SelectItem value="completed">Terminé</SelectItem>
                                        <SelectItem value="cancelled">Annulé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {filteredBookings.length === 0 ? (
                                <EmptyState
                                    icon={Calendar}
                                    title="Aucune réservation"
                                    description="Vous n'avez pas encore de réservation. Partagez votre page de services !"
                                />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Date & Heure</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBookings.map((booking) => (
                                            <TableRow key={booking._id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {booking.customerName || (booking.customerId as any)?.name || 'Client'}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {booking.customerEmail || (booking.customerId as any)?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {typeof booking.serviceId === 'object' ? booking.serviceId.name : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(booking.startTime).toLocaleDateString('fr-FR', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat('fr-FR', {
                                                        style: 'currency',
                                                        currency: 'TND',
                                                    }).format(booking.price)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[booking.status]}>
                                                        {booking.status === 'pending' && 'En attente'}
                                                        {booking.status === 'confirmed' && 'Confirmé'}
                                                        {booking.status === 'completed' && 'Terminé'}
                                                        {booking.status === 'cancelled' && 'Annulé'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {booking.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => confirmBooking.mutate(booking._id)}
                                                                    disabled={confirmBooking.isPending}
                                                                >
                                                                    Confirmer
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => cancelBooking.mutate(booking._id)}
                                                                    disabled={cancelBooking.isPending}
                                                                >
                                                                    Annuler
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services">
                    <Card>
                        <CardHeader>
                            <CardTitle>Services</CardTitle>
                            <CardDescription>Gérez les services que vous proposez</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {services.length === 0 ? (
                                <EmptyState
                                    icon={Clock}
                                    title="Aucun service"
                                    description="Créez votre premier service pour commencer à recevoir des réservations."
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {services.map((service) => (
                                        <Card key={service._id}>
                                            <CardContent className="pt-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{service.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{service.description}</p>
                                                    </div>
                                                    <Badge variant={service.isActive ? 'default' : 'secondary'}>
                                                        {service.isActive ? 'Actif' : 'Inactif'}
                                                    </Badge>
                                                </div>
                                                <div className="mt-4 flex justify-between items-center">
                                                    <div className="text-2xl font-bold">
                                                        {new Intl.NumberFormat('fr-FR', {
                                                            style: 'currency',
                                                            currency: 'TND',
                                                        }).format(service.price)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {service.durationMinutes} min
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex gap-2">
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        Modifier
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BookingPage;
