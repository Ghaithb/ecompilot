import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, Zap, ShoppingBag, Briefcase, Coffee, Palette } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'ecommerce' | 'business' | 'blog' | 'portfolio' | 'restaurant';
  thumbnail: string;
  premium: boolean;
  features: string[];
  content: any;
}

const templates: Template[] = [
  {
    id: 'ecom-modern',
    name: 'Modern E-Commerce',
    description: 'Template e-commerce moderne avec intégration produits',
    category: 'ecommerce',
    thumbnail: '🛍️',
    premium: false,
    features: ['Catalogue Produits', 'Panier', 'Checkout', 'Responsive'],
    content: {
      html: `
        <section class="hero-section">
          <div class="container">
            <h1>Bienvenue dans notre boutique</h1>
            <p>Découvrez nos produits exceptionnels</p>
            <button class="cta-button">Découvrir</button>
          </div>
        </section>
        <section class="products-grid" id="products">
          <!-- Products will be injected here -->
        </section>
        <section class="features">
          <div class="feature-card">
            <h3>🚚 Livraison Rapide</h3>
            <p>Livraison en 24-48h</p>
          </div>
          <div class="feature-card">
            <h3>🔒 Paiement Sécurisé</h3>
            <p>Transactions 100% sécurisées</p>
          </div>
          <div class="feature-card">
            <h3>↩️ Retours Gratuits</h3>
            <p>30 jours pour changer d'avis</p>
          </div>
        </section>
      `,
      css: `
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 100px 20px;
          text-align: center;
        }
        .hero-section h1 {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .cta-button {
          background: white;
          color: #667eea;
          padding: 15px 40px;
          border-radius: 50px;
          border: none;
          font-weight: bold;
          cursor: pointer;
          margin-top: 20px;
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: scale(1.05);
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
          padding: 60px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .features {
          display: flex;
          justify-content: space-around;
          padding: 60px 20px;
          background: #f9fafb;
          flex-wrap: wrap;
          gap: 30px;
        }
        .feature-card {
          text-align: center;
          max-width: 300px;
        }
        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }
      `,
    },
  },
  {
    id: 'business-pro',
    name: 'Business Pro',
    description: 'Template professionnel pour entreprises',
    category: 'business',
    thumbnail: '💼',
    premium: true,
    features: ['Formulaire Contact', 'Témoignages', 'Services', 'FAQ'],
    content: {
      html: `
        <section class="hero-business">
          <div class="container">
            <h1>Votre Entreprise au Sommet</h1>
            <p class="subtitle">Des solutions innovantes pour votre croissance</p>
            <div class="cta-buttons">
              <button class="btn-primary">Nous Contacter</button>
              <button class="btn-secondary">En Savoir Plus</button>
            </div>
          </div>
        </section>
        <section class="services">
          <h2>Nos Services</h2>
          <div class="services-grid">
            <div class="service-card">
              <div class="icon">🎯</div>
              <h3>Stratégie</h3>
              <p>Développement de stratégies sur mesure</p>
            </div>
            <div class="service-card">
              <div class="icon">📊</div>
              <h3>Analytics</h3>
              <p>Analyse de données avancée</p>
            </div>
            <div class="service-card">
              <div class="icon">🚀</div>
              <h3>Croissance</h3>
              <p>Accélération de votre croissance</p>
            </div>
          </div>
        </section>
      `,
      css: `
        .hero-business {
          background: linear-gradient(to right, #1e3a8a, #3b82f6);
          color: white;
          padding: 120px 20px;
          text-align: center;
        }
        .hero-business h1 {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }
        .subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
        }
        .cta-buttons {
          margin-top: 30px;
          display: flex;
          gap: 20px;
          justify-content: center;
        }
        .btn-primary, .btn-secondary {
          padding: 15px 40px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-primary {
          background: white;
          color: #1e3a8a;
        }
        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }
        .services {
          padding: 80px 20px;
          text-align: center;
        }
        .services h2 {
          font-size: 2.5rem;
          margin-bottom: 50px;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .service-card {
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.3s;
        }
        .service-card:hover {
          transform: translateY(-10px);
        }
        .icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }
      `,
    },
  },
  {
    id: 'restaurant-deluxe',
    name: 'Restaurant Deluxe',
    description: 'Template élégant pour restaurants',
    category: 'restaurant',
    thumbnail: '🍽️',
    premium: true,
    features: ['Menu', 'Réservation', 'Galerie', 'Horaires'],
    content: {
      html: `
        <section class="restaurant-hero">
          <div class="overlay"></div>
          <div class="content">
            <h1>Bienvenue au Restaurant</h1>
            <p>Une expérience culinaire inoubliable</p>
            <button class="reserve-btn">Réserver une table</button>
          </div>
        </section>
        <section class="menu-section">
          <h2>Notre Menu</h2>
          <div class="menu-grid">
            <div class="menu-item">
              <h3>Entrées</h3>
              <div class="dish">
                <span class="dish-name">Salade César</span>
                <span class="price">12€</span>
              </div>
            </div>
            <div class="menu-item">
              <h3>Plats</h3>
              <div class="dish">
                <span class="dish-name">Filet Mignon</span>
                <span class="price">28€</span>
              </div>
            </div>
            <div class="menu-item">
              <h3>Desserts</h3>
              <div class="dish">
                <span class="dish-name">Tiramisu</span>
                <span class="price">8€</span>
              </div>
            </div>
          </div>
        </section>
      `,
      css: `
        .restaurant-hero {
          position: relative;
          height: 600px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/></svg>');
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
        }
        .content {
          position: relative;
          z-index: 1;
          color: white;
          text-align: center;
        }
        .content h1 {
          font-size: 4rem;
          font-family: Georgia, serif;
          margin-bottom: 1rem;
        }
        .reserve-btn {
          background: #d4af37;
          color: white;
          padding: 15px 50px;
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          margin-top: 30px;
          cursor: pointer;
        }
        .menu-section {
          padding: 80px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .menu-section h2 {
          text-align: center;
          font-size: 3rem;
          font-family: Georgia, serif;
          margin-bottom: 60px;
        }
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 50px;
        }
        .menu-item h3 {
          border-bottom: 2px solid #d4af37;
          padding-bottom: 10px;
          margin-bottom: 20px;
          font-size: 1.8rem;
        }
        .dish {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }
        .price {
          color: #d4af37;
          font-weight: bold;
        }
      `,
    },
  },
  {
    id: 'portfolio-creative',
    name: 'Portfolio Créatif',
    description: 'Portfolio moderne pour créatifs',
    category: 'portfolio',
    thumbnail: '🎨',
    premium: false,
    features: ['Galerie', 'About', 'Contact', 'Animations'],
    content: {
      html: `
        <section class="portfolio-hero">
          <h1 class="glitch" data-text="Créatif & Designer">Créatif & Designer</h1>
          <p>Donnez vie à vos idées</p>
        </section>
        <section class="works">
          <h2>Mes Réalisations</h2>
          <div class="gallery">
            <div class="work-item">
              <div class="work-image">🖼️</div>
              <h3>Projet 1</h3>
              <p>Design UI/UX</p>
            </div>
            <div class="work-item">
              <div class="work-image">🎭</div>
              <h3>Projet 2</h3>
              <p>Branding</p>
            </div>
            <div class="work-item">
              <div class="work-image">🎬</div>
              <h3>Projet 3</h3>
              <p>Motion Design</p>
            </div>
          </div>
        </section>
      `,
      css: `
        .portfolio-hero {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000;
          color: white;
        }
        .glitch {
          font-size: 4rem;
          font-weight: bold;
          text-transform: uppercase;
          position: relative;
          animation: glitch 1s linear infinite;
        }
        @keyframes glitch {
          2%, 64% {
            transform: translate(2px, 0) skew(0deg);
          }
          4%, 60% {
            transform: translate(-2px, 0) skew(0deg);
          }
          62% {
            transform: translate(0, 0) skew(5deg);
          }
        }
        .works {
          padding: 80px 20px;
          background: #f5f5f5;
        }
        .works h2 {
          text-align: center;
          font-size: 3rem;
          margin-bottom: 60px;
        }
        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .work-item {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: transform 0.3s;
          cursor: pointer;
        }
        .work-item:hover {
          transform: scale(1.05);
        }
        .work-image {
          height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .work-item h3 {
          padding: 20px;
          margin: 0;
        }
        .work-item p {
          padding: 0 20px 20px;
          color: #666;
        }
      `,
    },
  },
];

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ecommerce': return <ShoppingBag className="w-4 h-4" />;
      case 'business': return <Briefcase className="w-4 h-4" />;
      case 'restaurant': return <Coffee className="w-4 h-4" />;
      case 'portfolio': return <Palette className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">Bibliothèque de Templates</h1>
              <p className="text-muted-foreground mt-2">
                Choisissez un template professionnel pour démarrer rapidement
              </p>
            </div>
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="ecommerce">E-Commerce</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl">
                      {template.thumbnail}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      {template.premium && (
                        <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                          <Zap className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mb-4">
                      {template.description}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => onSelectTemplate(template)}
                        className="flex-1"
                      >
                        Utiliser ce Template
                      </Button>
                      <Button variant="outline" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun template trouvé</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TemplateLibrary;
