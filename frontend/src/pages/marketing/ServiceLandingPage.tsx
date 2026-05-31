import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SERVICE_PAGES } from '@/content/saas-launch';

const ServiceLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const page = SERVICE_PAGES.find((p) => p.slug === slug);
  const isAr = i18n.language?.startsWith('ar');

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('servicePages.notFound')}</p>
      </div>
    );
  }

  const title = isAr ? page.titleAr : page.title;
  const description = isAr ? page.descriptionAr : page.description;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b bg-white px-6 py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('servicePages.backHome')}
          </Link>
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        </div>

        <ul className="space-y-3">
          {page.bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              {b}
            </li>
          ))}
        </ul>

        <Button size="lg" asChild>
          <Link to="/login?signup=1">{t('servicePages.cta')}</Link>
        </Button>
      </main>
    </div>
  );
};

export default ServiceLandingPage;
