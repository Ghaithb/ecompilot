import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingBag, Search, Filter } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  category?: string;
}

interface ProductsIntegrationProps {
  onInsertProducts: (config: ProductDisplayConfig) => void;
}

interface ProductDisplayConfig {
  products: Product[];
  layout: 'grid' | 'list' | 'carousel';
  columns: number;
  showPrice: boolean;
  showAddToCart: boolean;
  showStock: boolean;
  filter?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

const ProductsIntegration: React.FC<ProductsIntegrationProps> = ({ onInsertProducts }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list' | 'carousel'>('grid');
  const [columns, setColumns] = useState(3);
  const [showPrice, setShowPrice] = useState(true);
  const [showAddToCart, setShowAddToCart] = useState(true);
  const [showStock, setShowStock] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/v1/products', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAll = () => {
    setSelectedProducts(new Set(filteredProducts.map(p => p._id)));
  };

  const deselectAll = () => {
    setSelectedProducts(new Set());
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInsert = () => {
    const selectedProductsList = products.filter(p => selectedProducts.has(p._id));
    
    const config: ProductDisplayConfig = {
      products: selectedProductsList,
      layout,
      columns,
      showPrice,
      showAddToCart,
      showStock,
    };

    onInsertProducts(config);
  };

  const generateProductHTML = (config: ProductDisplayConfig): string => {
    const { products, layout, columns, showPrice, showAddToCart, showStock } = config;
    
    let html = `<section class="products-section-${layout}">`;
    html += `<div class="products-container">`;
    
    if (layout === 'grid') {
      html += `<div class="products-grid columns-${columns}">`;
    } else if (layout === 'carousel') {
      html += `<div class="products-carousel">`;
    } else {
      html += `<div class="products-list">`;
    }

    products.forEach(product => {
      html += `
        <div class="product-card" data-product-id="${product._id}">
          <div class="product-image">
            ${product.image 
              ? `<img src="${product.image}" alt="${product.name}" />` 
              : `<div class="placeholder-image">📦</div>`
            }
          </div>
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description || ''}</p>
            ${showPrice ? `<div class="product-price">${product.price}€</div>` : ''}
            ${showStock ? `<div class="product-stock">${product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}</div>` : ''}
            ${showAddToCart && product.stock > 0 ? `<button class="add-to-cart-btn" data-product-id="${product._id}">Ajouter au Panier</button>` : ''}
          </div>
        </div>
      `;
    });

    html += `</div></div></section>`;
    return html;
  };

  const generateProductCSS = (config: ProductDisplayConfig): string => {
    const { layout, columns } = config;
    
    return `
      .products-section-${layout} {
        padding: 60px 20px;
      }
      .products-container {
        max-width: 1200px;
        margin: 0 auto;
      }
      .products-grid {
        display: grid;
        gap: 30px;
      }
      .products-grid.columns-2 {
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      }
      .products-grid.columns-3 {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
      .products-grid.columns-4 {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
      .products-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .products-carousel {
        display: flex;
        overflow-x: auto;
        gap: 20px;
        scroll-snap-type: x mandatory;
        padding-bottom: 20px;
      }
      .products-carousel .product-card {
        min-width: 300px;
        scroll-snap-align: start;
      }
      .product-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
      }
      .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      }
      .product-image {
        height: 250px;
        overflow: hidden;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .placeholder-image {
        font-size: 4rem;
      }
      .product-info {
        padding: 20px;
      }
      .product-name {
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 10px;
        color: #1f2937;
      }
      .product-description {
        color: #6b7280;
        margin-bottom: 15px;
        line-height: 1.5;
      }
      .product-price {
        font-size: 1.5rem;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 10px;
      }
      .product-stock {
        font-size: 0.9rem;
        color: #10b981;
        margin-bottom: 15px;
      }
      .add-to-cart-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .add-to-cart-btn:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }
      .products-list .product-card {
        display: flex;
        flex-direction: row;
      }
      .products-list .product-image {
        width: 250px;
        height: 200px;
        flex-shrink: 0;
      }
      .products-list .product-info {
        flex: 1;
      }
    `;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Intégration Catalogue Produits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration d'affichage */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Disposition</Label>
              <Select value={layout} onValueChange={(v: any) => setLayout(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grille</SelectItem>
                  <SelectItem value="list">Liste</SelectItem>
                  <SelectItem value="carousel">Carrousel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {layout === 'grid' && (
              <div>
                <Label>Colonnes</Label>
                <Select value={columns.toString()} onValueChange={(v) => setColumns(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 colonnes</SelectItem>
                    <SelectItem value="3">3 colonnes</SelectItem>
                    <SelectItem value="4">4 colonnes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Afficher le prix</Label>
              <Switch checked={showPrice} onCheckedChange={setShowPrice} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Bouton "Ajouter au panier"</Label>
              <Switch checked={showAddToCart} onCheckedChange={setShowAddToCart} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Afficher le stock</Label>
              <Switch checked={showStock} onCheckedChange={setShowStock} />
            </div>
          </div>
        </div>

        {/* Recherche et sélection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              Tous
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Aucun
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedProducts.size} produit(s) sélectionné(s)
          </div>
        </div>

        {/* Liste des produits */}
        <div className="border rounded-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Chargement des produits...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Aucun produit trouvé
            </div>
          ) : (
            <div className="divide-y">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                    selectedProducts.has(product._id) ? 'bg-accent' : ''
                  }`}
                  onClick={() => toggleProduct(product._id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product._id)}
                      onChange={() => toggleProduct(product._id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{product.price}€</span>
                        <span>•</span>
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                    {product.stock === 0 && (
                      <Badge variant="destructive">Rupture</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton d'insertion */}
        <Button
          onClick={handleInsert}
          disabled={selectedProducts.size === 0}
          className="w-full"
        >
          Insérer {selectedProducts.size} Produit(s)
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductsIntegration;
export type { ProductDisplayConfig, Product };
