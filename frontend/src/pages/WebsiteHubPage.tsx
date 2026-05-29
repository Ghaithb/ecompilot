import React from 'react';
import SimpleBoutiquePanel from '@/components/website/SimpleBoutiquePanel';

/**
 * Hub boutique simplifié — un seul écran pour créer / ouvrir la boutique COD.
 * Les anciens onglets (wizard, pages, builder) sont retirés du parcours principal.
 */
const WebsiteHubPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-foreground mb-2">Ma boutique</h1>
        <p className="text-muted-foreground">
          Page de vente COD & WhatsApp — simple, prête à partager en quelques secondes
        </p>
      </div>
      <SimpleBoutiquePanel />
    </div>
  );
};

export default WebsiteHubPage;
