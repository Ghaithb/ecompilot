import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CASE_STUDIES } from '@/content/saas-launch';

const CaseStudiesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b bg-white px-6 py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('caseStudies.backHome')}
          </Link>
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">{t('caseStudies.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('caseStudies.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {CASE_STUDIES.map((study) => (
            <Card key={study.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg">{study.merchant}</CardTitle>
                  {study.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      <BadgeCheck className="w-3 h-3" />
                      {t('caseStudies.verified')}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-2xl font-bold text-primary">{study.metric}</p>
                <p>{study.detail}</p>
                <p className="text-muted-foreground">
                  <span className="font-medium">{t('caseStudies.period')}:</span> {study.period}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">{t('caseStudies.methodology')}:</span> {study.methodology}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button asChild>
          <Link to="/login?signup=1&pilot=1">{t('pilots.enrollCta')}</Link>
        </Button>
      </main>
    </div>
  );
};

export default CaseStudiesPage;
