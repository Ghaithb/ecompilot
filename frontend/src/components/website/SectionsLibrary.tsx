import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  category: 'hero' | 'features' | 'cta' | 'testimonials' | 'pricing' | 'gallery' | 'products';
  thumbnail: string;
  html: string;
  css: string;
}

const sections: Section[] = [
  {
    id: 'hero-gradient',
    name: 'Hero Gradient',
    category: 'hero',
    thumbnail: '🌈',
    html: `
      <section class="hero-gradient-section">
        <div class="container">
          <h1 class="hero-title">Transformez Votre Business</h1>
          <p class="hero-subtitle">La solution complète pour votre croissance en ligne</p>
          <div class="hero-buttons">
            <button class="btn-hero-primary">Commencer Maintenant</button>
            <button class="btn-hero-secondary">En Savoir Plus</button>
          </div>
        </div>
      </section>
    `,
    css: `
      .hero-gradient-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 120px 20px;
        text-align: center;
      }
      .hero-title {
        font-size: 3.5rem;
        font-weight: 800;
        margin-bottom: 1rem;
        line-height: 1.2;
      }
      .hero-subtitle {
        font-size: 1.5rem;
        opacity: 0.95;
        max-width: 600px;
        margin: 0 auto 2rem;
      }
      .hero-buttons {
        display: flex;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .btn-hero-primary, .btn-hero-secondary {
        padding: 16px 40px;
        border-radius: 50px;
        border: none;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .btn-hero-primary {
        background: white;
        color: #667eea;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      .btn-hero-primary:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
      }
      .btn-hero-secondary {
        background: transparent;
        color: white;
        border: 2px solid white;
      }
      .btn-hero-secondary:hover {
        background: rgba(255,255,255,0.1);
      }
    `,
  },
  {
    id: 'features-grid',
    name: 'Grille de Fonctionnalités',
    category: 'features',
    thumbnail: '⚡',
    html: `
      <section class="features-section">
        <h2 class="section-title">Fonctionnalités Puissantes</h2>
        <div class="features-grid">
          <div class="feature-box">
            <div class="feature-icon">🚀</div>
            <h3>Performance Optimale</h3>
            <p>Chargement ultra-rapide pour une expérience utilisateur exceptionnelle</p>
          </div>
          <div class="feature-box">
            <div class="feature-icon">🔒</div>
            <h3>Sécurité Renforcée</h3>
            <p>Protection de vos données avec les dernières technologies</p>
          </div>
          <div class="feature-box">
            <div class="feature-icon">📊</div>
            <h3>Analytics Avancées</h3>
            <p>Suivez vos performances en temps réel</p>
          </div>
          <div class="feature-box">
            <div class="feature-icon">🎨</div>
            <h3>Design Personnalisable</h3>
            <p>Adaptez chaque élément à votre image de marque</p>
          </div>
          <div class="feature-box">
            <div class="feature-icon">📱</div>
            <h3>100% Responsive</h3>
            <p>Parfait sur mobile, tablette et desktop</p>
          </div>
          <div class="feature-box">
            <div class="feature-icon">⚙️</div>
            <h3>Intégrations</h3>
            <p>Connectez tous vos outils préférés</p>
          </div>
        </div>
      </section>
    `,
    css: `
      .features-section {
        padding: 80px 20px;
        background: #f9fafb;
      }
      .section-title {
        text-align: center;
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 60px;
      }
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .feature-box {
        background: white;
        padding: 40px 30px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        text-align: center;
        transition: all 0.3s ease;
      }
      .feature-box:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.15);
      }
      .feature-icon {
        font-size: 3rem;
        margin-bottom: 20px;
      }
      .feature-box h3 {
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 15px;
      }
      .feature-box p {
        color: #6b7280;
        line-height: 1.6;
      }
    `,
  },
  {
    id: 'cta-centered',
    name: 'CTA Centré',
    category: 'cta',
    thumbnail: '🎯',
    html: `
      <section class="cta-section">
        <div class="cta-content">
          <h2>Prêt à Commencer ?</h2>
          <p>Rejoignez des milliers d'entreprises qui nous font confiance</p>
          <button class="cta-button">Démarrer Gratuitement</button>
          <p class="cta-note">Sans engagement • Annulation à tout moment</p>
        </div>
      </section>
    `,
    css: `
      .cta-section {
        background: linear-gradient(to right, #1e3a8a, #3b82f6);
        color: white;
        padding: 100px 20px;
      }
      .cta-content {
        max-width: 800px;
        margin: 0 auto;
        text-align: center;
      }
      .cta-content h2 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 20px;
      }
      .cta-content > p {
        font-size: 1.3rem;
        opacity: 0.9;
        margin-bottom: 40px;
      }
      .cta-button {
        background: white;
        color: #1e3a8a;
        padding: 18px 60px;
        border: none;
        border-radius: 50px;
        font-size: 1.2rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      .cta-button:hover {
        transform: scale(1.05);
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
      }
      .cta-note {
        margin-top: 20px;
        font-size: 0.9rem;
        opacity: 0.8;
      }
    `,
  },
  {
    id: 'testimonials-cards',
    name: 'Témoignages',
    category: 'testimonials',
    thumbnail: '💬',
    html: `
      <section class="testimonials-section">
        <h2 class="section-title">Ce Que Disent Nos Clients</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <p class="testimonial-text">"Une solution exceptionnelle qui a transformé notre business. Recommandé à 100% !"</p>
            <div class="testimonial-author">
              <div class="author-avatar">JD</div>
              <div>
                <div class="author-name">Jean Dupont</div>
                <div class="author-role">CEO, TechCorp</div>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <p class="testimonial-text">"Interface intuitive et support client réactif. Exactement ce que nous cherchions."</p>
            <div class="testimonial-author">
              <div class="author-avatar">SM</div>
              <div>
                <div class="author-name">Sophie Martin</div>
                <div class="author-role">Directrice Marketing</div>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <p class="testimonial-text">"ROI impressionnant dès le premier mois. Meilleur investissement de l'année !"</p>
            <div class="testimonial-author">
              <div class="author-avatar">PL</div>
              <div>
                <div class="author-name">Pierre Leblanc</div>
                <div class="author-role">Fondateur, StartupXYZ</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    css: `
      .testimonials-section {
        padding: 80px 20px;
        background: white;
      }
      .testimonials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 30px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .testimonial-card {
        background: #f9fafb;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }
      .stars {
        font-size: 1.2rem;
        margin-bottom: 20px;
      }
      .testimonial-text {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 25px;
        color: #374151;
      }
      .testimonial-author {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      .author-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
      .author-name {
        font-weight: 600;
        color: #1f2937;
      }
      .author-role {
        font-size: 0.9rem;
        color: #6b7280;
      }
    `,
  },
  {
    id: 'pricing-table',
    name: 'Grille de Prix',
    category: 'pricing',
    thumbnail: '💰',
    html: `
      <section class="pricing-section">
        <h2 class="section-title">Choisissez Votre Plan</h2>
        <div class="pricing-grid">
          <div class="pricing-card">
            <h3>Starter</h3>
            <div class="price">
              <span class="amount">19€</span>
              <span class="period">/mois</span>
            </div>
            <ul class="features-list">
              <li>✓ 10 produits</li>
              <li>✓ Analytics basiques</li>
              <li>✓ Support email</li>
              <li>✓ 1 utilisateur</li>
            </ul>
            <button class="pricing-btn">Commencer</button>
          </div>
          <div class="pricing-card featured">
            <div class="badge">Populaire</div>
            <h3>Pro</h3>
            <div class="price">
              <span class="amount">49€</span>
              <span class="period">/mois</span>
            </div>
            <ul class="features-list">
              <li>✓ Produits illimités</li>
              <li>✓ Analytics avancées</li>
              <li>✓ Support prioritaire</li>
              <li>✓ 5 utilisateurs</li>
              <li>✓ Domaine personnalisé</li>
            </ul>
            <button class="pricing-btn primary">Commencer</button>
          </div>
          <div class="pricing-card">
            <h3>Enterprise</h3>
            <div class="price">
              <span class="amount">99€</span>
              <span class="period">/mois</span>
            </div>
            <ul class="features-list">
              <li>✓ Tout de Pro</li>
              <li>✓ Utilisateurs illimités</li>
              <li>✓ Support dédié</li>
              <li>✓ API personnalisée</li>
              <li>✓ SLA garanti</li>
            </ul>
            <button class="pricing-btn">Nous Contacter</button>
          </div>
        </div>
      </section>
    `,
    css: `
      .pricing-section {
        padding: 80px 20px;
        background: #f9fafb;
      }
      .pricing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .pricing-card {
        background: white;
        padding: 40px 30px;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        text-align: center;
        position: relative;
        transition: transform 0.3s;
      }
      .pricing-card:hover {
        transform: translateY(-10px);
      }
      .pricing-card.featured {
        border: 3px solid #667eea;
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.25);
      }
      .badge {
        position: absolute;
        top: -15px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 5px 20px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
      }
      .pricing-card h3 {
        font-size: 1.8rem;
        margin-bottom: 20px;
      }
      .price {
        margin-bottom: 30px;
      }
      .amount {
        font-size: 3rem;
        font-weight: 700;
        color: #1f2937;
      }
      .period {
        color: #6b7280;
        font-size: 1rem;
      }
      .features-list {
        list-style: none;
        padding: 0;
        margin: 0 0 30px;
        text-align: left;
      }
      .features-list li {
        padding: 12px 0;
        border-bottom: 1px solid #f3f4f6;
        color: #374151;
      }
      .pricing-btn {
        width: 100%;
        padding: 15px;
        border-radius: 8px;
        border: 2px solid #667eea;
        background: white;
        color: #667eea;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }
      .pricing-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
      }
      .pricing-btn:hover {
        transform: scale(1.05);
      }
    `,
  },
];

interface SectionsLibraryProps {
  onSelectSection: (section: Section) => void;
}

const SectionsLibrary: React.FC<SectionsLibraryProps> = ({ onSelectSection }) => {
  const categories = [
    { id: 'hero', name: 'Hero', icon: '🎨' },
    { id: 'features', name: 'Fonctionnalités', icon: '⚡' },
    { id: 'cta', name: 'Call-to-Action', icon: '🎯' },
    { id: 'testimonials', name: 'Témoignages', icon: '💬' },
    { id: 'pricing', name: 'Tarifs', icon: '💰' },
  ];

  return (
    <div className="sections-library p-4 bg-card border-r">
      <h3 className="font-semibold mb-4">Sections Pré-Conçues</h3>
      
      {categories.map((category) => {
        const categorySections = sections.filter(s => s.category === category.id);
        if (categorySections.length === 0) return null;

        return (
          <div key={category.id} className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.name}
            </h4>
            <div className="space-y-2">
              {categorySections.map((section) => (
                <Card key={section.id} className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{section.thumbnail}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{section.name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectSection(section)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SectionsLibrary;
export type { Section };
