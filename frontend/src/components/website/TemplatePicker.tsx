import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, ExternalLink, LayoutTemplate, Loader2 } from 'lucide-react';
import { STORE_TEMPLATES, type StoreTemplateId } from '@/constants/store-templates';
import { applyStoreTemplate } from '@/services/websiteSettingsApi';

type TemplatePickerProps = {
  currentTemplate?: string;
  storeSlug?: string;
  /** true = PATCH /website/template sur la boutique existante (défaut si storeSlug) */
  applyOnClick?: boolean;
  onApplied?: (templateId?: string) => void;
  /** Sélection locale avant création de la boutique */
  onSelect?: (templateId: StoreTemplateId) => void;
  compact?: boolean;
};

const TemplatePicker: React.FC<TemplatePickerProps> = ({
  currentTemplate = 'cod-classic',
  storeSlug,
  applyOnClick,
  onApplied,
  onSelect,
  compact = false,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selected, setSelected] = useState(currentTemplate);
  const [applying, setApplying] = useState<string | null>(null);
  const shouldApply = applyOnClick ?? Boolean(storeSlug);

  useEffect(() => {
    setSelected(currentTemplate);
  }, [currentTemplate]);

  const handleClick = async (id: StoreTemplateId) => {
    if (!shouldApply) {
      setSelected(id);
      onSelect?.(id);
      return;
    }

    if (id === selected) return;

    setApplying(id);
    try {
      await applyStoreTemplate(id);
      setSelected(id);
      toast({
        title: t('website.templates.applied'),
        description: t('website.templates.appliedDesc'),
      });
      onApplied?.(id);
    } catch {
      toast({ title: t('common.error'), description: t('website.templates.applyError'), variant: 'destructive' });
    } finally {
      setApplying(null);
    }
  };

  return (
    <Card className={compact ? 'border-dashed' : undefined}>
      {!compact && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            {t('website.templates.title')}
          </CardTitle>
          <CardDescription>
            {shouldApply ? t('website.templates.applyHint') : t('website.templates.selectHint')}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={compact ? 'pt-4' : undefined}>
        {compact && (
          <p className="text-sm text-muted-foreground mb-3">
            {shouldApply ? t('website.templates.compactApply') : t('website.templates.compactSelect')}
          </p>
        )}
        <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {STORE_TEMPLATES.map((tpl) => {
            const active = selected === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleClick(tpl.id)}
                disabled={Boolean(applying)}
                className={`relative rounded-xl border p-4 text-left transition-all hover:border-primary/50 ${
                  active ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
              >
                <div
                  className="h-10 rounded-lg mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${tpl.theme.primaryColor}, ${tpl.theme.secondaryColor})`,
                  }}
                />
                <p className="font-medium text-sm">{tpl.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{tpl.description}</p>
                {tpl.recommendedFor ? (
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {t('website.templates.recommendedFor')}{' '}
                    <span className="text-foreground/80">{tpl.recommendedFor}</span>
                  </p>
                ) : null}
                {tpl.tagline ? (
                  <p className="text-[10px] text-primary/80 mt-1">{tpl.tagline}</p>
                ) : null}
                {active && (
                  <span className="absolute top-2 right-2 text-primary">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                {applying === tpl.id && (
                  <Loader2 className="absolute bottom-3 right-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
        {shouldApply && storeSlug && (
          <Button className="mt-4" variant="outline" asChild>
            <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('website.templates.livePreview')}
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplatePicker;
