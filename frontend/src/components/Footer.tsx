import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface FooterProps {
  config?: {
    logo?: string;
    companyName: string;
    description?: string;
    columns: Array<{
      title: string;
      links: Array<{
        label: string;
        url: string;
      }>;
    }>;
    social?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
    };
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    newsletterEnabled?: boolean;
    copyrightText?: string;
  };
}

export function Footer({ config }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const defaultConfig = {
    companyName: 'EcomPilot',
    description: 'Créez votre site e-commerce en quelques clics',
    columns: [
      {
        title: 'Produits',
        links: [
          { label: 'Tous les produits', url: '/products' },
          { label: 'Nouveautés', url: '/products?filter=new' },
          { label: 'Promotions', url: '/products?filter=promo' },
        ],
      },
      {
        title: 'Entreprise',
        links: [
          { label: 'À propos', url: '/about' },
          { label: 'Contact', url: '/contact' },
          { label: 'Blog', url: '/blog' },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'FAQ', url: '/faq' },
          { label: 'Livraison', url: '/shipping' },
          { label: 'Retours', url: '/returns' },
        ],
      },
      {
        title: 'Légal',
        links: [
          { label: 'Mentions légales', url: '/legal' },
          { label: 'CGV', url: '/terms' },
          { label: 'Confidentialité', url: '/privacy' },
        ],
      },
    ],
    newsletterEnabled: true,
    copyrightText: `© ${new Date().getFullYear()} EcomPilot. Tous droits réservés.`,
  };

  const footerConfig = config || defaultConfig;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setSubscribing(true);

    try {
      // TODO: Appel API pour inscription newsletter
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('✅ Merci pour votre inscription !');
      setEmail('');
    } catch (error) {
      toast.error('❌ Erreur lors de l\'inscription');
    } finally {
      setSubscribing(false);
    }
  };

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Colonne logo et description */}
          <div className="lg:col-span-2">
            {footerConfig.logo ? (
              <img
                src={footerConfig.logo}
                alt={footerConfig.companyName}
                className="h-12 mb-4"
              />
            ) : (
              <h3 className="text-2xl font-bold text-white mb-4">
                {footerConfig.companyName}
              </h3>
            )}
            
            {footerConfig.description && (
              <p className="text-gray-400 mb-6">
                {footerConfig.description}
              </p>
            )}

            {/* Réseaux sociaux */}
            {footerConfig.social && Object.keys(footerConfig.social).length > 0 && (
              <div className="flex gap-3">
                {Object.entries(footerConfig.social).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = socialIcons[platform as keyof typeof socialIcons];
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}

            {/* Contact */}
            {footerConfig.contact && (
              <div className="mt-6 space-y-2">
                {footerConfig.contact.email && (
                  <a
                    href={`mailto:${footerConfig.contact.email}`}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{footerConfig.contact.email}</span>
                  </a>
                )}
                {footerConfig.contact.phone && (
                  <a
                    href={`tel:${footerConfig.contact.phone}`}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{footerConfig.contact.phone}</span>
                  </a>
                )}
                {footerConfig.contact.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span className="text-sm">{footerConfig.contact.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colonnes de liens */}
          {footerConfig.columns.map((column, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.url}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        {footerConfig.newsletterEnabled && (
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="max-w-md mx-auto text-center">
              <h4 className="text-white font-semibold mb-2">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">
                Inscrivez-vous pour recevoir nos offres exclusives
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                <Button type="submit" disabled={subscribing}>
                  {subscribing ? 'Envoi...' : 'S\'inscrire'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            {footerConfig.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
