import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUser } from '@/lib/adminApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Checkbox from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogContent = DialogPrimitive.Content;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} />
);
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);

const UsersPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<keyof AdminUser | 'lastLoginAt' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, limit, search],
    queryFn: () => adminApi.listUsers({ page, limit, search }),
    staleTime: 60_000,
  });

  const users = useMemo(() => {
    const list = (data?.data ?? []).slice();
    list.sort((a: any, b: any) => {
      const va = (a as any)[sortBy] ?? '';
      const vb = (b as any)[sortBy] ?? '';
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [data, sortBy, sortDir]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roles: 'user' as 'user' | 'admin',
    status: 'active' as 'active' | 'invited' | 'disabled',
  });

  const createUser = useMutation({
    mutationFn: async () => {
      const payload = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        roles: [form.roles],
        status: form.status,
      } as any;
      const res = await adminApi.createUser(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Utilisateur créé' });
      setForm({ email: '', firstName: '', lastName: '', roles: 'user', status: 'active' });
    },
    onError: (e: any) => toast({ title: 'Erreur création', description: e?.message, variant: 'destructive' }),
  });

  const updateUser = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const payload = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        roles: [form.roles],
        status: form.status,
      } as any;
      const res = await adminApi.updateUser(editing._id, payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Utilisateur mis à jour' });
      setEditing(null);
    },
    onError: (e: any) => toast({ title: 'Erreur mise à jour', description: e?.message, variant: 'destructive' }),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Utilisateur supprimé' });
    },
    onError: (e: any) => toast({ title: 'Erreur suppression', description: e?.message, variant: 'destructive' }),
  });

  const bulkUpdate = useMutation({
    mutationFn: async (payload: Partial<AdminUser>) => {
      const ids = Object.keys(selected).filter(id => selected[id]);
      for (const id of ids) {
        await adminApi.updateUser(id, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Mise à jour groupée réalisée' });
      setSelected({});
    },
    onError: (e: any) => toast({ title: 'Erreur action groupée', description: e?.message, variant: 'destructive' }),
  });

  const bulkDelete = useMutation({
    mutationFn: async () => {
      const ids = Object.keys(selected).filter(id => selected[id]);
      for (const id of ids) {
        await adminApi.deleteUser(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Suppression groupée réalisée' });
      setSelected({});
    },
    onError: (e: any) => toast({ title: 'Erreur suppression groupée', description: e?.message, variant: 'destructive' }),
  });

  const canSubmit = useMemo(() => form.email && form.firstName && form.lastName, [form]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un utilisateur</DialogTitle>
              <DialogDescription>Invitez un utilisateur et assignez un rôle</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
              <Select value={form.roles} onValueChange={(v: any) => setForm(p => ({ ...p, roles: v }))}>
                <SelectTrigger><SelectValue placeholder="Rôle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Prénom" value={form.firstName} onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))} />
              <Input placeholder="Nom" value={form.lastName} onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))} />
              <Select value={form.status} onValueChange={(v: any) => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="invited">Invité</SelectItem>
                  <SelectItem value="disabled">Désactivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline">Annuler</Button>
              <Button onClick={() => createUser.mutate()} disabled={!canSubmit}>
                {createUser.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Rechercher (nom, email)"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-[260px]"
              />
              <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Par page" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Select value={`${sortBy}:${sortDir}`} onValueChange={(v) => { const [k, d] = v.split(':') as any; setSortBy(k); setSortDir(d); }}>
                <SelectTrigger className="w-[240px]"><SelectValue placeholder="Trier par" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Création (récent → ancien)</SelectItem>
                  <SelectItem value="createdAt:asc">Création (ancien → récent)</SelectItem>
                  <SelectItem value="lastLoginAt:desc">Dernière connexion (récent)</SelectItem>
                  <SelectItem value="lastLoginAt:asc">Dernière connexion (ancien)</SelectItem>
                  <SelectItem value="email:asc">Email (A→Z)</SelectItem>
                  <SelectItem value="email:desc">Email (Z→A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {Object.values(selected).some(Boolean) && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => bulkUpdate.mutate({ status: 'active' } as any)}>
                  Activer sélection
                </Button>
                <Button variant="outline" onClick={() => bulkUpdate.mutate({ status: 'disabled' } as any)}>
                  Désactiver sélection
                </Button>
                <Button variant="outline" onClick={() => bulkUpdate.mutate({ roles: ['user'] } as any)}>
                  Mettre rôle: user
                </Button>
                <Button variant="outline" onClick={() => bulkUpdate.mutate({ roles: ['admin'] } as any)}>
                  Mettre rôle: admin
                </Button>
                <Button variant="destructive" onClick={() => bulkDelete.mutate()}>
                  Supprimer sélection
                </Button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={users.length > 0 && users.every(u => selected[u._id])}
                      onCheckedChange={(val: any) => {
                        const next: Record<string, boolean> = {};
                        if (val) users.forEach(u => next[u._id] = true);
                        setSelected(val ? next : {});
                      }}
                      aria-label="Sélectionner tout"
                    />
                  </TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôles</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="w-8">
                      <Checkbox
                        checked={!!selected[u._id]}
                        onCheckedChange={(val: any) => setSelected(prev => ({ ...prev, [u._id]: !!val }))}
                        aria-label={`Sélectionner ${u.email}`}
                      />
                    </TableCell>
                    <TableCell>{u.firstName} {u.lastName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {u.roles.map((r) => (
                            <Badge key={r} variant={r === 'admin' ? 'default' : 'secondary'}>{r}</Badge>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => adminApi.updateUser(u._id, { roles: u.roles.includes('admin') ? ['user'] : ['admin'] }).then(() => queryClient.invalidateQueries({ queryKey: ['admin-users'] }))}>
                          Basculer rôle
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{u.status}</span>
                        <Button variant="outline" size="sm" onClick={() => adminApi.updateUser(u._id, { status: u.status === 'active' ? 'disabled' : 'active' } as any).then(() => queryClient.invalidateQueries({ queryKey: ['admin-users'] }))}>
                          Basculer statut
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(u); setForm({ email: u.email, firstName: u.firstName, lastName: u.lastName, roles: (u.roles.includes('admin') ? 'admin' : 'user'), status: u.status }); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteUser.mutate(u._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              <div className="flex justify-between items-center mt-4">
                <div>
                  Affichage de {(total === 0) ? 0 : (page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Précédent</Button>
                  <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog édition */}
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier utilisateur</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
            <Select value={form.roles} onValueChange={(v: any) => setForm(p => ({ ...p, roles: v }))}>
              <SelectTrigger><SelectValue placeholder="Rôle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Prénom" value={form.firstName} onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))} />
            <Input placeholder="Nom" value={form.lastName} onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))} />
            <Select value={form.status} onValueChange={(v: any) => setForm(p => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="invited">Invité</SelectItem>
                <SelectItem value="disabled">Désactivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={() => updateUser.mutate()}>
              {updateUser.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
