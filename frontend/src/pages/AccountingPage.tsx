import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { apiClient } from '@/lib/api-client';

interface Account {
    _id: string;
    name: string;
    type: 'bank' | 'cash' | 'credit_card' | 'paypal' | 'stripe';
    balance: number;
    currency: string;
}

interface Transaction {
    _id: string;
    accountId: { name: string };
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
}

interface FinancialSummary {
    summary: {
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
        profitMargin: number;
    };
    incomeByCategory: Record<string, number>;
    expensesByCategory: Record<string, number>;
}

const typeColors: Record<string, string> = {
    income: 'text-green-600',
    expense: 'text-red-600',
};

const AccountingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [period, setPeriod] = useState('month');

    // Calculate date range based on period
    const getDateRange = () => {
        const now = new Date();
        let startDate: Date;
        if (period === 'week') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === 'quarter') {
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
        } else {
            startDate = new Date(now.getFullYear(), 0, 1);
        }
        return {
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
        };
    };

    const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
        queryKey: ['accounts'],
        queryFn: async () => {
            const response = await apiClient.get('/accounting/accounts');
            return response.data;
        },
    });

    const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
        queryKey: ['transactions', period],
        queryFn: async () => {
            const { startDate, endDate } = getDateRange();
            const response = await apiClient.get(`/accounting/transactions?startDate=${startDate}&endDate=${endDate}`);
            return response.data;
        },
    });

    const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
        queryKey: ['financial-summary', period],
        queryFn: async () => {
            const { startDate, endDate } = getDateRange();
            const response = await apiClient.get(`/accounting/reports/summary?startDate=${startDate}&endDate=${endDate}`);
            return response.data;
        },
    });

    const { data: balances } = useQuery({
        queryKey: ['account-balances'],
        queryFn: async () => {
            const response = await apiClient.get('/accounting/accounts/balances');
            return response.data;
        },
    });

    const totalBalance = balances?.totalBalance || accounts.reduce((sum, a) => sum + a.balance, 0);

    const isLoading = accountsLoading || transactionsLoading || summaryLoading;

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
                    <h1 className="text-3xl font-bold">Comptabilité</h1>
                    <p className="text-muted-foreground">Vue d'ensemble de vos finances</p>
                </div>
                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Cette semaine</SelectItem>
                            <SelectItem value="month">Ce mois</SelectItem>
                            <SelectItem value="quarter">Ce trimestre</SelectItem>
                            <SelectItem value="year">Cette année</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle transaction
                    </Button>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <PiggyBank className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-muted-foreground">Solde total</span>
                        </div>
                        <div className="text-2xl font-bold mt-2">
                            {formatTND(totalBalance)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-muted-foreground">Revenus</span>
                        </div>
                        <div className="text-2xl font-bold mt-2 text-green-600">
                            {formatTND(summary?.summary.totalIncome || 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-muted-foreground">Dépenses</span>
                        </div>
                        <div className="text-2xl font-bold mt-2 text-red-600">
                            {formatTND(summary?.summary.totalExpenses || 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-purple-600" />
                            <span className="text-sm text-muted-foreground">Bénéfice net</span>
                        </div>
                        <div className={`text-2xl font-bold mt-2 ${(summary?.summary.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatTND(summary?.summary.netProfit || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Marge: {summary?.summary.profitMargin || 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
                    <TabsTrigger value="accounts">Comptes ({accounts.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenus par catégorie</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {summary?.incomeByCategory && Object.keys(summary.incomeByCategory).length > 0 ? (
                                    <div className="space-y-3">
                                        {Object.entries(summary.incomeByCategory).map(([category, amount]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className="text-sm">{category}</span>
                                                <span className="font-medium text-green-600">
                                                    {formatTND(amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">Aucun revenu sur cette période</p>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Dépenses par catégorie</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {summary?.expensesByCategory && Object.keys(summary.expensesByCategory).length > 0 ? (
                                    <div className="space-y-3">
                                        {Object.entries(summary.expensesByCategory).map(([category, amount]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className="text-sm">{category}</span>
                                                <span className="font-medium text-red-600">
                                                    {formatTND(amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">Aucune dépense sur cette période</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transactions récentes</CardTitle>
                            <CardDescription>Historique de vos mouvements financiers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transactions.length === 0 ? (
                                <EmptyState
                                    icon={Wallet}
                                    title="Aucune transaction"
                                    description="Enregistrez votre première transaction pour commencer le suivi."
                                />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Catégorie</TableHead>
                                            <TableHead>Compte</TableHead>
                                            <TableHead className="text-right">Montant</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((tx) => (
                                            <TableRow key={tx._id}>
                                                <TableCell>
                                                    {new Date(tx.date).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell>{tx.description}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{tx.category}</Badge>
                                                </TableCell>
                                                <TableCell>{tx.accountId?.name || '-'}</TableCell>
                                                <TableCell className={`text-right font-medium ${typeColors[tx.type]}`}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        {tx.type === 'income' ? (
                                                            <ArrowUpRight className="w-4 h-4" />
                                                        ) : (
                                                            <ArrowDownRight className="w-4 h-4" />
                                                        )}
                                                        {formatTND(tx.amount)}
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

                <TabsContent value="accounts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comptes</CardTitle>
                            <CardDescription>Gérez vos comptes bancaires et de paiement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {accounts.length === 0 ? (
                                <EmptyState
                                    icon={PiggyBank}
                                    title="Aucun compte"
                                    description="Ajoutez votre premier compte pour commencer."
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {accounts.map((account) => (
                                        <Card key={account._id}>
                                            <CardContent className="pt-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{account.name}</h3>
                                                        <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                                                    </div>
                                                </div>
                                                <div className={`text-2xl font-bold mt-4 ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: account.currency }).format(account.balance)}
                                                </div>
                                                <div className="mt-4">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        Voir les transactions
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

            {/* AI Features Coming Soon Banner */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-full shadow">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">🚀 Fonctionnalités IA - Prochainement</h3>
                            <p className="text-sm text-muted-foreground">
                                CFO Virtuel, Bilans prévisionnels et Optimisation fiscale intelligente en cours de développement.
                            </p>
                        </div>
                        <Badge className="ml-auto bg-purple-100 text-purple-800">Coming Soon</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountingPage;
