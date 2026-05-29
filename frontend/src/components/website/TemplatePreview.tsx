import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface TemplatePreviewProps {
  businessType: string;
  companyName: string;
  companySlogan?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  businessType,
  companyName,
  companySlogan,
  primaryColor,
  secondaryColor,
  logoUrl,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  // Dimensions par device
  const deviceSizes = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '600px', margin: '0 auto' },
    mobile: { width: '375px', height: '600px', margin: '0 auto' },
  };

  const currentSize = deviceSizes[deviceMode];

  // Générer un mini HTML de preview selon le type de business
  const generatePreviewHTML = () => {
    const baseStyles = `
      body { 
        margin: 0; 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        overflow-x: hidden;
      }
      * { box-sizing: border-box; }
      .hero {
        background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
        color: white;
        padding: 60px 20px;
        text-align: center;
      }
      .hero h1 { 
        font-size: clamp(1.5rem, 4vw, 3rem); 
        margin: 0 0 10px 0; 
        font-weight: 700;
      }
      .hero p { 
        font-size: clamp(0.9rem, 2vw, 1.2rem); 
        margin: 0; 
        opacity: 0.95;
      }
      .logo {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: ${primaryColor};
        font-weight: bold;
      }
      .content {
        padding: 40px 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 30px;
      }
      .feature-card {
        background: #f8f9fa;
        padding: 30px 20px;
        border-radius: 12px;
        text-align: center;
        border: 2px solid transparent;
        transition: all 0.3s;
      }
      .feature-card:hover {
        border-color: ${primaryColor};
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      }
      .feature-icon {
        font-size: 3rem;
        margin-bottom: 15px;
      }
      .feature-card h3 {
        color: ${primaryColor};
        margin: 0 0 10px 0;
        font-size: 1.2rem;
      }
      .feature-card p {
        color: #666;
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.6;
      }
      .btn {
        display: inline-block;
        padding: 12px 30px;
        background: white;
        color: ${primaryColor};
        text-decoration: none;
        border-radius: 25px;
        font-weight: 600;
        margin-top: 20px;
        border: 2px solid white;
        transition: all 0.3s;
      }
      .btn:hover {
        background: transparent;
        color: white;
      }
    `;

    const templates = {
      parfum: {
        features: [
          { icon: '🌸', title: 'Collections Exclusives', desc: 'Découvrez nos fragrances uniques' },
          { icon: '✨', title: 'Qualité Premium', desc: 'Ingrédients nobles et raffinés' },
          { icon: '🎁', title: 'Coffrets Cadeaux', desc: 'Idées cadeaux personnalisées' },
        ],
      },
      cafe: {
        features: [
          { icon: '☕', title: 'Café Artisanal', desc: 'Grains fraîchement torréfiés' },
          { icon: '🥐', title: 'Viennoiseries', desc: 'Pâtisseries faites maison' },
          { icon: '🍰', title: 'Desserts', desc: 'Gâteaux et douceurs' },
        ],
      },
      sandwich: {
        features: [
          { icon: '🥖', title: 'Pain Frais', desc: 'Cuit chaque matin' },
          { icon: '🚚', title: 'Livraison', desc: 'Rapide et efficace' },
          { icon: '🥗', title: 'Produits Frais', desc: 'Ingrédients de qualité' },
        ],
      },
      immobilier: {
        features: [
          { icon: '🏠', title: 'Vente', desc: 'Biens résidentiels et commerciaux' },
          { icon: '🔑', title: 'Location', desc: 'Gestion locative complète' },
          { icon: '📊', title: 'Estimation', desc: 'Évaluation gratuite' },
        ],
      },
      restaurant: {
        features: [
          { icon: '🍽️', title: 'Cuisine Raffinée', desc: 'Chef étoilé' },
          { icon: '🍷', title: 'Cave à Vins', desc: 'Sélection premium' },
          { icon: '📅', title: 'Réservation', desc: 'En ligne 24/7' },
        ],
      },
      medecin: {
        features: [
          { icon: '👨‍⚕️', title: 'Consultation', desc: 'Médecine générale' },
          { icon: '📅', title: 'RDV en Ligne', desc: 'Prise de rendez-vous facile' },
          { icon: '🏥', title: 'Équipement Moderne', desc: 'Diagnostic de pointe' },
        ],
      },
      avocat: {
        features: [
          { icon: '⚖️', title: 'Droit Civil', desc: 'Expertise complète' },
          { icon: '💼', title: 'Droit des Affaires', desc: 'Conseil entreprise' },
          { icon: '📞', title: 'Consultation', desc: 'Premier RDV gratuit' },
        ],
      },
      ecommerce: {
        features: [
          { icon: '🛒', title: 'Catalogue', desc: 'Large sélection de produits' },
          { icon: '🚀', title: 'Livraison', desc: 'Rapide et sécurisée' },
          { icon: '💳', title: 'Paiement', desc: 'Sécurisé et simple' },
        ],
      },
    };

    const template = templates[businessType as keyof typeof templates] || templates.ecommerce;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="hero">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" style="border-radius: 50%; object-fit: cover;">` : `<div class="logo">${companyName.charAt(0)}</div>`}
            <h1>${companyName}</h1>
            ${companySlogan ? `<p>${companySlogan}</p>` : ''}
            <a href="#" class="btn">Découvrir</a>
          </div>
          <div class="content">
            <div class="features">
              ${template.features.map(f => `
                <div class="feature-card">
                  <div class="feature-icon">${f.icon}</div>
                  <h3>${f.title}</h3>
                  <p>${f.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Device Selector */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Aperçu en direct</h3>
          <div className="flex gap-2">
            <Button
              variant={deviceMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceMode('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceMode === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceMode('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceMode('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="bg-gray-100 p-4 rounded-lg overflow-hidden">
          <div
            style={{
              width: currentSize.width,
              height: currentSize.height,
              margin: currentSize.margin,
              transition: 'all 0.3s ease',
            }}
            className="bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <iframe
              srcDoc={generatePreviewHTML()}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Website Preview"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          ✨ Aperçu mis à jour en temps réel selon vos choix
        </p>
      </CardContent>
    </Card>
  );
};
