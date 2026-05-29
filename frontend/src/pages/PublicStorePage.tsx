import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const PublicStorePage: React.FC = () => {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug?: string }>();
  const [page, setPage] = useState<any>(null);
  const [website, setWebsite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage();
  }, [slug, pageSlug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const storeEndpoint = pageSlug ? `/store/${slug}/${pageSlug}` : `/store/${slug}`;
      try {
        const { data } = await api.get(storeEndpoint);
        setPage(data.page);
        setWebsite(data.website);
        return;
      } catch {
        const publicEndpoint = pageSlug
          ? `/public/website/${slug}/${pageSlug}`
          : `/public/website/${slug}`;
        const { data } = await api.get(publicEndpoint);
        setPage(data.page);
        setWebsite(data.website);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Boutique introuvable',
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Le site web que vous recherchez n'existe pas ou n'est pas publié.
          </p>
        </div>
      </div>
    );
  }

  if (!page || !website) {
    return null;
  }

  // Le HTML généré est COMPLET (inclut <html>, <head>, <style>, <body>)
  // On l'affiche dans un iframe pour isoler le CSS et JS
  return (
    <iframe
      srcDoc={page.html || '<h1>Contenu non disponible</h1>'}
      className="w-full h-screen border-0"
      style={{ 
        display: 'block',
        width: '100vw',
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      title={page.seo?.title || page.name || website.name}
    />
  );
};

export default PublicStorePage;
