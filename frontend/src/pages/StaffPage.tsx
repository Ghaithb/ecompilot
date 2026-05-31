import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, Clock, Receipt, Plus, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiClient } from '@/lib/api-client';

interface Staff {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'admin' | 'manager' | 'employee' | 'freelancer';
    status: 'active' | 'inactive' | 'on_leave';
    position?: string;
    department?: string;
    avatarUrl?: string;
}

interface Expense {
    _id: string;
    staffId: { firstName: string; lastName: string };
    category: string;
    description: string;
    amount: number;
    date: string;
    status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
    receiptUrl?: string;
}

const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    manager: 'Manager',
    employee: 'Employé',
    freelancer: 'Freelance',
};

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
};

const expenseStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    reimbursed: 'bg-blue-100 text-blue-800',
};

const StaffPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('staff');
    const [expenseStatusFilter, setExpenseStatusFilter] = useState<string>('all');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: staff = [], isLoading: staffLoading } = useQuery<Staff[]>({
        queryKey: ['staff'],
        queryFn: async () => {
            const response = await apiClient.get('/staff');
            return response.data;
        },
    });

    const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
        queryKey: ['expenses'],
        queryFn: async () => {
            const response = await apiClient.get('/staff/expenses');
            return response.data;
        },
    });

    const { data: staffStats } = useQuery({
        queryKey: ['staff-stats'],
        queryFn: async () => {
            const response = await apiClient.get('/staff/stats');
            return response.data;
        },
    });

    const approveExpense = useMutation({
        mutationFn: async (expenseId: string) => {
            return apiClient.post(`/staff/expenses/${expenseId}/review`, {
                status: 'approved',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast({ title: 'Note de frais approuvée' });
        },
    });

    const rejectExpense = useMutation({
        mutationFn: async (expenseId: string) => {
            return apiClient.post(`/staff/expenses/${expenseId}/review`, {
                status: 'rejected',
                rejectionReason: 'Non conforme',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast({ title: 'Note de frais refusée' });
        },
    });

    const filteredExpenses = useMemo(() => {
        if (expenseStatusFilter === 'all') return expenses;
        return expenses.filter((e) => e.status === expenseStatusFilter);
    }, [expenses, expenseStatusFilter]);

    const pendingExpensesTotal = expenses
        .filter((e) => e.status === 'pending')
        .reduce((sum, e) => sum + e.amount, 0);

    const isLoading = staffLoading || expensesLoading;

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
                    <h1 className="text-3xl font-bold">Équipe & RH</h1>
                    <p className="text-muted-foreground">Gérez votre équipe et les notes de frais</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un collaborateur
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{staffStats?.total || staff.length}</div>
                        <div className="text-sm text-muted-foreground">Collaborateurs</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{staffStats?.active || 0}</div>
                        <div className="text-sm text-muted-foreground">Actifs</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">{staffStats?.onLeave || 0}</div>
                        <div className="text-sm text-muted-foreground">En congé</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-orange-600">
                            {formatTND(pendingExpensesTotal)}
                        </div>
                        <div className="text-sm text-muted-foreground">Notes en attente</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="staff">
                        <Users className="w-4 h-4 mr-2" />
                        Équipe ({staff.length})
                    </TabsTrigger>
                    <TabsTrigger value="expenses">
                        <Receipt className="w-4 h-4 mr-2" />
                        Notes de frais ({expenses.filter((e) => e.status === 'pending').length} en attente)
                    </TabsTrigger>
                    <TabsTrigger value="timesheets">
                        <Clock className="w-4 h-4 mr-2" />
                        Feuilles de temps
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="staff">
                    <Card>
                        <CardHeader>
                            <CardTitle>Collaborateurs</CardTitle>
                            <CardDescription>Gérez les membres de votre équipe</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {staff.length === 0 ? (
                                <EmptyState
                                    icon={Users}
                                    title="Aucun collaborateur"
                                    description="Ajoutez votre premier collaborateur pour commencer."
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {staff.map((member) => (
                                        <Card key={member._id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage src={member.avatarUrl} />
                                                        <AvatarFallback>
                                                            {member.firstName[0]}
                                                            {member.lastName[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">
                                                            {member.firstName} {member.lastName}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">{member.position || roleLabels[member.role]}</p>
                                                    </div>
                                                    <Badge className={statusColors[member.status]}>
                                                        {member.status === 'active' && 'Actif'}
                                                        {member.status === 'inactive' && 'Inactif'}
                                                        {member.status === 'on_leave' && 'En congé'}
                                                    </Badge>
                                                </div>
                                                <div className="mt-4 text-sm text-muted-foreground">
                                                    <div>{member.email}</div>
                                                    {member.phone && <div>{member.phone}</div>}
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

                <TabsContent value="expenses">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes de frais</CardTitle>
                            <CardDescription>Validez les dépenses de votre équipe</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-6">
                                <Select value={expenseStatusFilter} onValueChange={setExpenseStatusFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrer par statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="approved">Approuvé</SelectItem>
                                        <SelectItem value="rejected">Refusé</SelectItem>
                                        <SelectItem value="reimbursed">Remboursé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {filteredExpenses.length === 0 ? (
                                <EmptyState
                                    icon={Receipt}
                                    title="Aucune note de frais"
                                    description="Les notes de frais soumises par votre équipe apparaîtront ici."
                                />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Collaborateur</TableHead>
                                            <TableHead>Catégorie</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredExpenses.map((expense) => (
                                            <TableRow key={expense._id}>
                                                <TableCell>
                                                    {expense.staffId.firstName} {expense.staffId.lastName}
                                                </TableCell>
                                                <TableCell>{expense.category}</TableCell>
                                                <TableCell>{expense.description}</TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat('fr-FR', {
                                                        style: 'currency',
                                                        currency: 'TND',
                                                    }).format(expense.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(expense.date).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={expenseStatusColors[expense.status]}>
                                                        {expense.status === 'pending' && 'En attente'}
                                                        {expense.status === 'approved' && 'Approuvé'}
                                                        {expense.status === 'rejected' && 'Refusé'}
                                                        {expense.status === 'reimbursed' && 'Remboursé'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {expense.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-green-600"
                                                                onClick={() => approveExpense.mutate(expense._id)}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600"
                                                                onClick={() => rejectExpense.mutate(expense._id)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timesheets">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feuilles de temps</CardTitle>
                            <CardDescription>Consultez les heures travaillées</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EmptyState
                                icon={Clock}
                                title="Fonctionnalité à venir"
                                description="Les feuilles de temps seront disponibles prochainement."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StaffPage;
