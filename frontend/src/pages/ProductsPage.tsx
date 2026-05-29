import React, { useState, useMemo, useRef, type ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, Plus, MoreVertical, Pencil, Trash2, UploadCloud, Package, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmptyState, EmptyBoxIllustration } from '@/components/ui/empty-state';
import { Checkbox } from '@/components/ui/checkbox';
import { productsApi, aiApi } from '@/lib/api';
import { api } from '@/lib/api';

type ProductStatus = 'active' | 'draft' | 'archived';

interface ProductVariant {
  sku: string;
  name: string;
  price: number;
  inventory?: number;
  attributes?: Record<string, string>;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  category?: string;
  status: ProductStatus;
  images: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

interface MlRecommendation {
  productId: string;
  title?: string;
  category?: string;
  price?: number;
}

interface FiltersState {
  search: string;
  category: string;
  status: 'all' | ProductStatus;
}

interface FormState {
  title: string;
  description: string;
  category: string;
  status: ProductStatus;
  sku: string;
  variantName: string;
  price: number;
  inventory: number;
  images: string[];
}

interface ImportResult {
  created: number;
  errors: Array<{ line: number; error: string }>;
}

const ProductImageUpload: React.FC<{ onUpload: (url: string) => void }> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data: { success: boolean; url?: string; message?: string } = res.data;
      if (data.success && data.url) {
        setUploadedUrl(data.url);
        onUpload(data.url);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4 flex items-center gap-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="image-upload"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-label="Upload product image"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
          </>
        ) : (
          'Upload Image'
        )}
      </Button>
      {uploadedUrl && (
        <img src={uploadedUrl} alt="Preview" className="w-10 h-10 object-cover rounded" />
      )}
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

const ProductsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    category: 'all',
    status: 'all',
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<FormState | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  
  // Bulk edit states
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'price' | 'status' | 'category' | null>(null);
  const [bulkEditValue, setBulkEditValue] = useState<string>('');

  const [newProduct, setNewProduct] = useState<FormState>({
    title: '',
    description: '',
    category: '',
    status: 'draft',
    sku: '',
    variantName: '',
    price: 0,
    inventory: 0,
    images: [],
  });

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => await productsApi.getAll(),
  });

  const { data: mlRecs } = useQuery<{ items: MlRecommendation[] }>({
    queryKey: ['ml', 'recommendations'],
    queryFn: () => aiApi.getMlRecommendations(),
  });

  const updateProductMutation = useMutation({
    mutationFn: async () => {
      if (!editProduct || !editForm) return;
      if (!editForm.title || !editForm.sku || isNaN(editForm.price) || isNaN(editForm.inventory)) {
        throw new Error('All required fields must be filled correctly');
      }
      const payload = {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category || undefined,
        status: editForm.status,
        variants: [
          {
            sku: editForm.sku,
            name: editForm.variantName || editForm.title,
            price: editForm.price,
            inventory: editForm.inventory,
          },
        ],
        images: editForm.images || [],
        tags: [],
      };
      return await productsApi.update(editProduct._id, payload);
    },
    onSuccess: () => {
      setEditDialogOpen(false);
      setEditProduct(null);
      setEditForm(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Produit modifié', description: 'Le produit a été mis à jour.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await productsApi.delete(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Produit supprimé', description: 'Le produit a été supprimé avec succès.' });
      setDeleteDialogOpen(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: `Une erreur est survenue: ${error.message}`, variant: 'destructive' });
    },
  });

  const createProduct = useMutation({
    mutationFn: async () => {
      if (!newProduct.title || !newProduct.sku || isNaN(newProduct.price) || isNaN(newProduct.inventory)) {
        throw new Error('All required fields must be filled correctly');
      }
      const payload = {
        title: newProduct.title,
        description: newProduct.description,
        category: newProduct.category || undefined,
        status: newProduct.status,
        variants: [
          {
            sku: newProduct.sku,
            name: newProduct.variantName || newProduct.title,
            price: newProduct.price,
            inventory: newProduct.inventory,
          },
        ],
        images: newProduct.images || [],
        tags: [],
      };
      return await productsApi.create(payload);
    },
    onSuccess: () => {
      setNewProduct({
        title: '',
        description: '',
        category: '',
        status: 'draft',
        sku: '',
        variantName: '',
        price: 0,
        inventory: 0,
        images: [],
      });
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Produit créé', description: 'Le produit a été ajouté avec succès.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  // Bulk edit mutation
  const bulkEditMutation = useMutation({
    mutationFn: async ({ action, value }: { action: 'price' | 'status' | 'category'; value: string }) => {
      const selectedProductIds = Array.from(selectedProducts);
      const updates = selectedProductIds.map(async (productId) => {
        const product = products.find(p => p._id === productId);
        if (!product) return;

        let payload: any = {
          title: product.title,
          description: product.description,
          category: product.category,
          status: product.status,
          variants: product.variants,
          images: product.images,
        };

        if (action === 'price') {
          payload.variants = product.variants.map(v => ({ ...v, price: parseFloat(value) }));
        } else if (action === 'status') {
          payload.status = value as ProductStatus;
        } else if (action === 'category') {
          payload.category = value;
        }

        return await productsApi.update(productId, payload);
      });

      return await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ 
        title: 'Modification en masse réussie', 
        description: `${selectedProducts.size} produit(s) modifié(s) avec succès.` 
      });
      setSelectedProducts(new Set());
      setBulkEditDialogOpen(false);
      setBulkAction(null);
      setBulkEditValue('');
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map(p => p._id)));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkEdit = (action: 'price' | 'status' | 'category') => {
    setBulkAction(action);
    setBulkEditValue('');
    setBulkEditDialogOpen(true);
  };

  const confirmBulkEdit = () => {
    if (!bulkAction || !bulkEditValue) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une action et une valeur', variant: 'destructive' });
      return;
    }
    bulkEditMutation.mutate({ action: bulkAction, value: bulkEditValue });
  };

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const importMutation = useMutation({
    mutationFn: async () => {
      if (!importFile) throw new Error('No file selected');
      return await productsApi.importFile(importFile);
    },
    onSuccess: (res: ImportResult) => {
      setImportResult(res);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Import terminé',
        description: `${res.created} produits créés${res.errors?.length ? `, ${res.errors.length} erreurs` : ''}`,
      });
    },
    onError: (err: any) => {
      toast({ title: 'Erreur import', description: err?.message || 'Échec import', variant: 'destructive' });
    },
  });

  const firstVariant = (product: Product): ProductVariant | undefined => product.variants?.[0];
  const totalInventory = (product: Product): number =>
    product.variants?.reduce((sum, v) => sum + (v.inventory ?? 0), 0) ?? 0;

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product: Product) => {
      const searchMatch = filters.search
        ? product.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          (firstVariant(product)?.sku?.toLowerCase().includes(filters.search.toLowerCase()) ?? false)
        : true;
      const categoryMatch = filters.category === 'all' ? true : product.category === filters.category;
      const statusMatch = filters.status === 'all' ? true : product.status === filters.status;
      return searchMatch && categoryMatch && statusMatch;
    });
  }, [products, filters]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(products)) {
      for (const p of products) {
        if (p.category && p.category.trim()) set.add(p.category.trim());
      }
    }
    const list = Array.from(set.values()).sort((a, b) => a.localeCompare(b));
    if (filters.category !== 'all' && filters.category && !list.includes(filters.category)) {
      list.unshift(filters.category);
    }
    return ['all', ...list];
  }, [products, filters.category]);

  const totalPages = Math.ceil((filteredProducts.length || 0) / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" aria-label="Chargement des produits" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-destructive">Une erreur est survenue lors du chargement des produits.</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
          variant="outline"
          aria-label="Réessayer de charger les produits"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Produits</CardTitle>
              <CardDescription>Gérez votre catalogue de produits</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button aria-label="Ajouter un nouveau produit">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau produit
                  </Button>
                </DialogTrigger>
                <DialogContent aria-labelledby="create-product-title" aria-describedby="create-product-description">
                  <DialogHeader>
                    <DialogTitle id="create-product-title">Ajouter un produit</DialogTitle>
                    <DialogDescription id="create-product-description">
                      Créez un nouveau produit dans votre catalogue.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Titre"
                        value={newProduct.title}
                        onChange={(e) => setNewProduct((p) => ({ ...p, title: e.target.value }))}
                        aria-label="Titre du produit"
                      />
                      <Input
                        placeholder="Catégorie (optionnel)"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                        aria-label="Catégorie du produit"
                      />
                    </div>
                    <Input
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                      aria-label="Description du produit"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        value={newProduct.status}
                        onValueChange={(value: ProductStatus) =>
                          setNewProduct((p) => ({ ...p, status: value }))
                        }
                      >
                        <SelectTrigger className="w-full" aria-label="Statut du produit">
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="archived">Archivé</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="SKU"
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct((p) => ({ ...p, sku: e.target.value }))}
                        aria-label="SKU de la variante"
                      />
                      <Input
                        placeholder="Nom de la variante"
                        value={newProduct.variantName}
                        onChange={(e) => setNewProduct((p) => ({ ...p, variantName: e.target.value }))}
                        aria-label="Nom de la variante"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Prix (€)"
                        type="number"
                        value={newProduct.price || ''}
                        onChange={(e) =>
                          setNewProduct((p) => ({ ...p, price: Number(e.target.value) || 0 }))
                        }
                        aria-label="Prix de la variante"
                      />
                      <Input
                        placeholder="Stock"
                        type="number"
                        value={newProduct.inventory || ''}
                        onChange={(e) =>
                          setNewProduct((p) => ({ ...p, inventory: Number(e.target.value) || 0 }))
                        }
                        aria-label="Stock de la variante"
                      />
                    </div>
                    <ProductImageUpload
                      onUpload={(url) => setNewProduct((p) => ({ ...p, images: [...p.images, url] }))}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      aria-label="Annuler la création"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={() => createProduct.mutate()}
                      disabled={
                        !newProduct.title ||
                        !newProduct.sku ||
                        isNaN(newProduct.price) ||
                        isNaN(newProduct.inventory) ||
                        createProduct.isPending
                      }
                      aria-label="Créer le produit"
                    >
                      {createProduct.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Créer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" aria-label="Importer des produits">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Importer
                  </Button>
                </DialogTrigger>
                <DialogContent aria-labelledby="import-products-title" aria-describedby="import-products-description">
                  <DialogHeader>
                    <DialogTitle id="import-products-title">Importer des produits</DialogTitle>
                    <DialogDescription id="import-products-description">
                      Formats acceptés: CSV, XLSX, PDF, Image (photo de tableau). Utilisez les en-têtes: title,
                      description, category, status, sku, variantName, price, inventory, imageUrl, tags.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <input
                      type="file"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf, image/*"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      aria-label="Sélectionner un fichier à importer"
                    />
                    {importFile && (
                      <div className="text-sm text-muted-foreground">Fichier sélectionné: {importFile.name}</div>
                    )}
                    {importResult && (
                      <div className="text-sm">
                        <div className="font-medium">Résultat:</div>
                        <div>{importResult.created} produits créés</div>
                        {importResult.errors?.length ? (
                          <div className="mt-2 max-h-40 overflow-auto border p-2 rounded">
                            {importResult.errors.slice(0, 50).map((e, idx) => (
                              <div key={idx} className="text-red-600 text-xs">
                                Ligne {e.line}: {e.error}
                              </div>
                            ))}
                            {importResult.errors.length > 50 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {importResult.errors.length - 50} erreurs supplémentaires...
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImportFile(null);
                        setImportResult(null);
                      }}
                      aria-label="Réinitialiser l'importation"
                    >
                      Réinitialiser
                    </Button>
                    <Button
                      onClick={() => importMutation.mutate()}
                      disabled={!importFile || importMutation.isPending}
                      aria-label="Lancer l'importation"
                    >
                      {importMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Lancer l'import
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions Bar */}
          {selectedProducts.size > 0 && (
            <Card className="mb-4 border-primary/20 bg-primary/5">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-primary" />
                    <span className="font-medium">
                      {selectedProducts.size} produit(s) sélectionné(s)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => handleBulkEdit(value as 'price' | 'status' | 'category')}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Actions groupées" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Modifier le prix</SelectItem>
                        <SelectItem value="status">Modifier le statut</SelectItem>
                        <SelectItem value="category">Modifier la catégorie</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProducts(new Set())}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un produit..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="flex-1"
                aria-label="Rechercher un produit par titre ou SKU"
              />
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger className="w-[220px]" aria-label="Filtrer par catégorie">
                <span className="truncate">
                  {filters.category === 'all' || !filters.category ? 'Toutes les catégories' : filters.category}
                </span>
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'Toutes les catégories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value: 'all' | ProductStatus) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[220px]" aria-label="Filtrer par statut">
                <span className="truncate">
                  {filters.status === 'all'
                    ? 'Tous les statuts'
                    : filters.status === 'active'
                    ? 'Actif'
                    : filters.status === 'draft'
                    ? 'Brouillon'
                    : 'Archivé'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recommandations ML</CardTitle>
              <CardDescription>Suggestions basées sur les interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {mlRecs?.items?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mlRecs.items.slice(0, 6).map((it, idx) => (
                    <div key={idx} className="border rounded p-3">
                      <div className="font-medium">{it.title || it.productId}</div>
                      <div className="text-sm text-muted-foreground">{it.category || 'Sans catégorie'}</div>
                      {it.price != null && (
                        <div className="text-sm mt-1">{formatPrice(it.price)}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Aucune recommandation disponible</div>
              )}
            </CardContent>
          </Card>

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Aucun produit"
              description="Commencez par créer votre premier produit pour votre boutique en ligne"
              illustration={<EmptyBoxIllustration />}
              action={{
                label: "Créer un produit",
                onClick: () => setCreateDialogOpen(true)
              }}
            />
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Sélectionner tous les produits"
                  />
                </TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.has(product._id)}
                      onCheckedChange={() => toggleSelectProduct(product._id)}
                      aria-label={`Sélectionner ${product.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{firstVariant(product)?.sku || '-'}</TableCell>
                  <TableCell>{formatPrice(firstVariant(product)?.price ?? 0)}</TableCell>
                  <TableCell>{totalInventory(product)}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {product.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          aria-label={`Actions pour ${product.title}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditProduct(product);
                            setEditForm({
                              title: product.title,
                              description: product.description,
                              category: product.category || '',
                              status: product.status,
                              sku: firstVariant(product)?.sku || '',
                              variantName: firstVariant(product)?.name || '',
                              price: firstVariant(product)?.price ?? 0,
                              inventory: firstVariant(product)?.inventory ?? 0,
                              images: product.images || [],
                            });
                            setEditDialogOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteDialogOpen(product._id)}
                          className="cursor-pointer text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deleteProductMutation.isPending && deleteDialogOpen === product._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Supprimer'
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}

          {filteredProducts.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div>
              Affichage de {Math.min((page - 1) * itemsPerPage + 1, filteredProducts.length)} à{' '}
              {Math.min(page * itemsPerPage, filteredProducts.length)} sur {filteredProducts.length}{' '}
              produits
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Page précédente"
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Page suivante"
              >
                Suivant
              </Button>
            </div>
          </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent aria-labelledby="edit-product-title" aria-describedby="edit-product-description">
          <DialogHeader>
            <DialogTitle id="edit-product-title">Modifier le produit</DialogTitle>
            <DialogDescription id="edit-product-description">
              Éditez les informations du produit.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Titre"
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p!, title: e.target.value }))}
                  aria-label="Titre du produit"
                />
                <Input
                  placeholder="Catégorie (optionnel)"
                  value={editForm.category}
                  onChange={(e) => setEditForm((p) => ({ ...p!, category: e.target.value }))}
                  aria-label="Catégorie du produit"
                />
              </div>
              <Input
                placeholder="Description"
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p!, description: e.target.value }))}
                aria-label="Description du produit"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  value={editForm.status}
                  onValueChange={(value: ProductStatus) => setEditForm((p) => ({ ...p!, status: value }))}
                >
                  <SelectTrigger className="w-full" aria-label="Statut du produit">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="SKU"
                  value={editForm.sku}
                  onChange={(e) => setEditForm((p) => ({ ...p!, sku: e.target.value }))}
                  aria-label="SKU de la variante"
                />
                <Input
                  placeholder="Nom de la variante"
                  value={editForm.variantName}
                  onChange={(e) => setEditForm((p) => ({ ...p!, variantName: e.target.value }))}
                  aria-label="Nom de la variante"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Prix (€)"
                  type="number"
                  value={editForm.price || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p!, price: Number(e.target.value) || 0 }))}
                  aria-label="Prix de la variante"
                />
                <Input
                  placeholder="Stock"
                  type="number"
                  value={editForm.inventory || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p!, inventory: Number(e.target.value) || 0 }))}
                  aria-label="Stock de la variante"
                />
              </div>
              <ProductImageUpload
                onUpload={(url) => setEditForm((p) => p ? ({ ...p, images: [...p.images, url] }) : null)}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              aria-label="Annuler la modification"
            >
              Annuler
            </Button>
            <Button
              onClick={() => updateProductMutation.mutate()}
              disabled={
                !editForm?.title ||
                !editForm?.sku ||
                isNaN(editForm?.price) ||
                isNaN(editForm?.inventory) ||
                updateProductMutation.isPending
              }
              aria-label="Enregistrer les modifications"
            >
              {updateProductMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(null)}>
        <DialogContent aria-labelledby="delete-product-title" aria-describedby="delete-product-description">
          <DialogHeader>
            <DialogTitle id="delete-product-title">Confirmer la suppression</DialogTitle>
            <DialogDescription id="delete-product-description">
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(null)}
              aria-label="Annuler la suppression"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialogOpen && deleteProductMutation.mutate(deleteDialogOpen)}
              disabled={deleteProductMutation.isPending}
              aria-label="Confirmer la suppression"
            >
              {deleteProductMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditDialogOpen} onOpenChange={setBulkEditDialogOpen}>
        <DialogContent aria-labelledby="bulk-edit-title" aria-describedby="bulk-edit-description">
          <DialogHeader>
            <DialogTitle id="bulk-edit-title">Modification en masse</DialogTitle>
            <DialogDescription id="bulk-edit-description">
              Modifier {selectedProducts.size} produit(s) sélectionné(s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {bulkAction === 'price' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Nouveau prix</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 29.99"
                  value={bulkEditValue}
                  onChange={(e) => setBulkEditValue(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Le prix sera appliqué à tous les produits sélectionnés
                </p>
              </div>
            )}

            {bulkAction === 'status' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Nouveau statut</label>
                <Select value={bulkEditValue} onValueChange={setBulkEditValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkAction === 'category' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Nouvelle catégorie</label>
                <Input
                  placeholder="Ex: Électronique"
                  value={bulkEditValue}
                  onChange={(e) => setBulkEditValue(e.target.value)}
                />
              </div>
            )}

            {/* Preview */}
            {bulkEditValue && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm">Aperçu des modifications</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="mb-2 font-medium">
                    {selectedProducts.size} produit(s) seront modifiés :
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {Array.from(selectedProducts).slice(0, 3).map(id => {
                      const product = products.find((p): p is Product => !!p && p._id === id);
                      return product ? (
                        <li key={id}>{product.title}</li>
                      ) : null;
                    })}
                    {selectedProducts.size > 3 && (
                      <li className="italic">... et {selectedProducts.size - 3} autre(s)</li>
                    )}
                  </ul>
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium">
                      {bulkAction === 'price' && `Nouveau prix: ${bulkEditValue} €`}
                      {bulkAction === 'status' && `Nouveau statut: ${bulkEditValue}`}
                      {bulkAction === 'category' && `Nouvelle catégorie: ${bulkEditValue}`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkEditDialogOpen(false)}
              aria-label="Annuler les modifications"
            >
              Annuler
            </Button>
            <Button
              onClick={confirmBulkEdit}
              disabled={!bulkEditValue || bulkEditMutation.isPending}
              aria-label="Confirmer les modifications"
            >
              {bulkEditMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Appliquer ({selectedProducts.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;