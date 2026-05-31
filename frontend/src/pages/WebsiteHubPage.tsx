import React from 'react';
import { useTranslation } from 'react-i18next';
import SimpleBoutiquePanel from '@/components/website/SimpleBoutiquePanel';

const WebsiteHubPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('website.hub.title')}</h1>
        <p className="text-muted-foreground">{t('website.hub.subtitle')}</p>
      </div>
      <SimpleBoutiquePanel />
    </div>
  );
};

export default WebsiteHubPage;
