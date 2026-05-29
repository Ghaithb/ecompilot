import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, FileText, Receipt, Plus, ArrowRight, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { apiClient } from '@/lib/api-client';

interface Quote {
    _id: string;
    quoteNumber: string;
    client: { name: string; email?: string };
    total: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
    issueDate: string;
    validUntil: string;
}

interface Invoice {
    _id: string;
    invoiceNumber: string;
    client: { name: string; email?: string };
    total: number;
    amountPaid: number;
    amountDue: number;
    status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
    issueDate: string;
    dueDate: string;
}

const quoteStatusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    converted: 'bg-purple-100 text-purple-800',
};

const invoiceStatusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    partially_paid: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

const QuotesInvoicesPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('quotes');
    const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all');
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: quotes = [], isLoading: quotesLoading } = useQuery<Quote[]>({
        queryKey: ['quotes'],
        queryFn: async () => {
            const response = await apiClient.get('/sales/quotes');
            return response.data;
        },
    });

    const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
        queryKey: ['invoices'],
        queryFn: async () => {
            const response = await apiClient.get('/sales/invoices');
            return response.data;
        },
    });

    const convertToInvoice = useMutation({
        mutationFn: async (quoteId: string) => {
            return apiClient.post(`/sales/quotes/${quoteId}/convert`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes', 'invoices'] });
            toast({ title: 'Devis converti en facture' });
        },
    });

    const sendQuote = useMutation({
        mutationFn: async (quoteId: string) => {
            return apiClient.post(`/sales/quotes/${quoteId}/send`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            toast({ title: 'Devis envoyé' });
        },
    });

    const sendInvoice = useMutation({
        mutationFn: async (invoiceId: string) => {
            return apiClient.post(`/sales/invoices/${invoiceId}/send`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast({ title: 'Facture envoyée' });
        },
    });

    const filteredQuotes = useMemo(() => {
        if (quoteStatusFilter === 'all') return quotes;
        return quotes.filter((q) => q.status === quoteStatusFilter);
    }, [quotes, quoteStatusFilter]);

    const filteredInvoices = useMemo(() => {
        if (invoiceStatusFilter === 'all') return invoices;
        return invoices.filter((i) => i.status === invoiceStatusFilter);
    }, [invoices, invoiceStatusFilter]);

    const isLoading = quotesLoading || invoicesLoading;

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
                    <h1 className="text-3xl font-bold">Devis & Factures</h1>
                    <p className="text-muted-foreground">Gérez vos documents commerciaux</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouveau Devis
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle Facture
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="quotes">
                        <FileText className="w-4 h-4 mr-2" />
                        Devis ({quotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="invoices">
                        <Receipt className="w-4 h-4 mr-2" />
                        Factures ({invoices.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="quotes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Devis</CardTitle>
                            <CardDescription>Gérez vos propositions commerciales</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-6">
                                <Select value={quoteStatusFilter} onValueChange={setQuoteStatusFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrer par statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="draft">Brouillon</SelectItem>
                                        <SelectItem value="sent">Envoyé</SelectItem>
                                        <SelectItem value="accepted">Accepté</SelectItem>
                                        <SelectItem value="rejected">Refusé</SelectItem>
                                        <SelectItem value="converted">Converti</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {filteredQuotes.length === 0 ? (
                                <EmptyState
                                    icon={FileText}
                                    title="Aucun devis"
                                    description="Créez votre premier devis pour proposer vos services."
                                />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Numéro</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Date d'émission</TableHead>
                                            <TableHead>Valide jusqu'au</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredQuotes.map((quote) => (
                                            <TableRow key={quote._id}>
                                                <TableCell className="font-mono">{quote.quoteNumber}</TableCell>
                                                <TableCell>{quote.client.name}</TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat('fr-FR', {
                                                        style: 'currency',
                                                        currency: 'EUR',
                                                    }).format(quote.total)}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(quote.issueDate).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={quoteStatusColors[quote.status]}>
                                                        {quote.status === 'draft' && 'Brouillon'}
                                                        {quote.status === 'sent' && 'Envoyé'}
                                                        {quote.status === 'accepted' && 'Accepté'}
                                                        {quote.status === 'rejected' && 'Refusé'}
                                                        {quote.status === 'converted' && 'Converti'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm">
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                        {quote.status === 'draft' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => sendQuote.mutate(quote._id)}
                                                            >
                                                                Envoyer
                                                            </Button>
                                                        )}
                                                        {quote.status === 'accepted' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => convertToInvoice.mutate(quote._id)}
                                                            >
                                                                <ArrowRight className="w-4 h-4 mr-1" />
                                                                Facturer
                                                            </Button>
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

                <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Factures</CardTitle>
                            <CardDescription>Gérez vos factures et paiements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-6">
                                <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrer par statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="draft">Brouillon</SelectItem>
                                        <SelectItem value="sent">Envoyée</SelectItem>
                                        <SelectItem value="paid">Payée</SelectItem>
                                        <SelectItem value="partially_paid">Partiellement payée</SelectItem>
                                        <SelectItem value="overdue">En retard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {filteredInvoices.length === 0 ? (
                                <EmptyState
                                    icon={Receipt}
                                    title="Aucune facture"
                                    description="Créez votre première facture ou convertissez un devis accepté."
                                />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Numéro</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Payé</TableHead>
                                            <TableHead>Reste dû</TableHead>
                                            <TableHead>Échéance</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvoices.map((invoice) => (
                                            <TableRow key={invoice._id}>
                                                <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                                                <TableCell>{invoice.client.name}</TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat('fr-FR', {
                                                        style: 'currency',
                                                        currency: 'EUR',
                                                    }).format(invoice.total)}
                                                </TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat('fr-FR', {
                                                        style: 'currency',
                                                        currency: 'EUR',
                                                    }).format(invoice.amountPaid)}
                                                </TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat('fr-FR', {
                                                        style: 'currency',
                                                        currency: 'EUR',
                                                    }).format(invoice.amountDue)}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={invoiceStatusColors[invoice.status]}>
                                                        {invoice.status === 'draft' && 'Brouillon'}
                                                        {invoice.status === 'sent' && 'Envoyée'}
                                                        {invoice.status === 'paid' && 'Payée'}
                                                        {invoice.status === 'partially_paid' && 'Partiel'}
                                                        {invoice.status === 'overdue' && 'En retard'}
                                                        {invoice.status === 'cancelled' && 'Annulée'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm">
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                        {invoice.status === 'draft' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => sendInvoice.mutate(invoice._id)}
                                                            >
                                                                Envoyer
                                                            </Button>
                                                        )}
                                                        {invoice.status === 'sent' && (
                                                            <Button size="sm">
                                                                Encaisser
                                                            </Button>
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
            </Tabs>
        </div>
    );
};

export default QuotesInvoicesPage;
