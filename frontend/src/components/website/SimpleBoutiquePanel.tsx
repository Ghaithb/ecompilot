import React, { useEffect, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { useAuth } from '@/contexts/AuthContext';

import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { Checkbox } from '@/components/ui/checkbox';

import {

  Copy,

  ExternalLink,

  Loader2,

  Package,

  Sparkles,

  Store,

  MessageCircle,

  CheckCircle2,

  ChevronRight,

  ChevronLeft,

} from 'lucide-react';

import TemplatePicker from '@/components/website/TemplatePicker';

import { StoreBrandingPanel } from '@/components/website/StoreBrandingPanel';

import {

  fetchMyWebsite,

  generateQuickBoutique,

  refreshStoreHtml,

  type ShopNiche,

  type WebsiteSummary,

} from '@/services/websiteService';

import { fetchWebsiteConfig } from '@/services/websiteSettingsApi';

import { isValidInternationalPhone } from '@/lib/phone.util';



const NICHES: { id: ShopNiche; labelKey: string }[] = [

  { id: 'general', labelKey: 'nicheGeneral' },

  { id: 'mode', labelKey: 'nicheMode' },

  { id: 'tech', labelKey: 'nicheTech' },

  { id: 'maison', labelKey: 'nicheMaison' },

  { id: 'beaute', labelKey: 'nicheBeaute' },

];



const STEPS = ['identity', 'style', 'launch'] as const;



const SimpleBoutiquePanel: React.FC = () => {

  const { t } = useTranslation();

  const { user } = useAuth();

  const { toast } = useToast();

  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [website, setWebsite] = useState<WebsiteSummary | null>(null);

  const [step, setStep] = useState(0);

  const [shopName, setShopName] = useState('');

  const [slogan, setSlogan] = useState('');

  const [niche, setNiche] = useState<ShopNiche>('general');

  const [phone, setPhone] = useState('');

  const [seedProducts, setSeedProducts] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState('cod-classic');

  const [lastStarterCount, setLastStarterCount] = useState(0);



  const autoSlogan = useMemo(() => {

    const name = shopName.trim();

    return name ? t('website.hub.autoSloganPreview', { name }) : '';

  }, [shopName, t]);



  useEffect(() => {

    setShopName(user?.companyName || user?.tenant?.name || '');

    fetchMyWebsite()

      .then(async (site) => {

        setWebsite(site);

        if (site?.slug) {

          try {

            const config = await fetchWebsiteConfig();

            if (config.storeTemplate) setSelectedTemplate(config.storeTemplate);

            else if (site.storeTemplate) setSelectedTemplate(site.storeTemplate);

          } catch {

            if (site.storeTemplate) setSelectedTemplate(site.storeTemplate);

          }

        }

      })

      .catch(() => setWebsite(null))

      .finally(() => setLoading(false));

  }, [user]);



  const copyStoreLink = async (slug: string) => {

    const url = `${window.location.origin}/store/${slug}`;

    try {

      await navigator.clipboard.writeText(url);

      toast({ title: t('website.hub.linkCopied'), description: url });

    } catch {

      toast({ title: t('website.hub.publicLink'), description: url });

    }

  };



  const handleCreate = async () => {

    const name = shopName.trim();

    if (name.length < 2) {

      toast({

        title: t('website.hub.nameRequired'),

        description: t('website.hub.nameRequiredDesc'),

        variant: 'destructive',

      });

      setStep(0);

      return;

    }

    if (phone.trim() && !isValidInternationalPhone(phone, 'TN')) {

      toast({

        title: t('website.hub.invalidPhone'),

        description: t('website.hub.invalidPhoneDesc'),

        variant: 'destructive',

      });

      return;

    }

    if (!user?.email) {

      toast({

        title: t('website.hub.invalidSession'),

        description: t('website.hub.invalidSessionDesc'),

        variant: 'destructive',

      });

      return;

    }



    setGenerating(true);

    try {

      const result = await generateQuickBoutique({

        shopName: name,

        email: user.email,

        phone: phone.trim() || undefined,

        city: 'Tunis',

        niche,

        slogan: slogan.trim() || undefined,

        seedStarterProducts: seedProducts,

        storeTemplate: selectedTemplate,

      });

      const created: WebsiteSummary = {

        _id: result._id || result.websiteId || '',

        slug: result.slug || '',

        name: result.name || name,

        published: true,

        storeTemplate: selectedTemplate,

      };

      setWebsite(created);

      setLastStarterCount(result.starterProducts ?? 0);

      const updated = (result as { updated?: boolean }).updated;

      toast({

        title: updated ? t('website.hub.shopUpdated') : t('website.hub.shopCreated'),

        description:

          result.starterProducts && result.starterProducts > 0

            ? t('website.hub.shopCreatedWithProducts', { count: result.starterProducts })

            : updated

              ? t('website.hub.shopUpdatedDesc')

              : t('website.hub.shopCreatedDesc'),

      });

    } catch (err: unknown) {

      const message =

        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||

        t('website.hub.createError');

      toast({ title: t('common.error'), description: message, variant: 'destructive' });

    } finally {

      setGenerating(false);

    }

  };



  const handleRefresh = async () => {

    setRefreshing(true);

    try {

      await refreshStoreHtml(phone.trim() || undefined);

      toast({ title: t('website.hub.syncDone'), description: t('website.hub.syncDoneDesc') });

    } catch (err: unknown) {

      const message =

        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||

        t('website.hub.syncError');

      toast({ title: t('common.error'), description: message, variant: 'destructive' });

    } finally {

      setRefreshing(false);

    }

  };



  const canNextStep0 = shopName.trim().length >= 2;



  if (loading) {

    return (

      <div className="flex justify-center py-16">

        <Loader2 className="w-8 h-8 animate-spin text-primary" />

      </div>

    );

  }



  if (website?.slug) {

    const storeUrl = `/store/${website.slug}`;

    return (

      <div className="space-y-6 max-w-2xl mx-auto">

        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">

          <CardHeader>

            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">

              <CheckCircle2 className="w-6 h-6" />

              {t('website.hub.onlineTitle')}

            </CardTitle>

            <CardDescription>{t('website.hub.onlineDesc')}</CardDescription>

          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex flex-wrap items-center gap-2">

              <code className="bg-muted px-2 py-1 rounded text-sm">{storeUrl}</code>

              <Button type="button" variant="outline" size="sm" onClick={() => copyStoreLink(website.slug)}>

                <Copy className="w-4 h-4 mr-1" />

                {t('website.hub.copyLink')}

              </Button>

            </div>

            {lastStarterCount > 0 && (

              <p className="text-sm text-green-800 dark:text-green-200">

                {t('website.hub.starterProductsAdded', { count: lastStarterCount })}

              </p>

            )}

            <p className="text-xs text-muted-foreground">{t('website.hub.oneStoreNote')}</p>

            <div className="flex flex-wrap gap-3">

              <Button asChild>

                <a href={storeUrl} target="_blank" rel="noopener noreferrer">

                  <ExternalLink className="w-4 h-4 mr-2" />

                  {t('website.hub.viewStore')}

                </a>

              </Button>

              <Button variant="outline" asChild>

                <Link to="/products">

                  <Package className="w-4 h-4 mr-2" />

                  {t('website.hub.manageProducts')}

                </Link>

              </Button>

              <Button variant="secondary" onClick={handleRefresh} disabled={refreshing}>

                {refreshing ? (

                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />

                ) : (

                  <Sparkles className="w-4 h-4 mr-2" />

                )}

                {t('website.hub.refreshPage')}

              </Button>

            </div>

          </CardContent>

        </Card>



        <TemplatePicker

          compact

          storeSlug={website.slug}

          applyOnClick

          currentTemplate={selectedTemplate}

          onApplied={(id) => id && setSelectedTemplate(id)}

        />



        <StoreBrandingPanel websiteId={website._id} storeName={website.name} />



        <Card>

          <CardHeader>

            <CardTitle className="text-lg">{t('website.hub.designTitle')}</CardTitle>

            <CardDescription>{t('website.hub.designDesc')}</CardDescription>

          </CardHeader>

          <CardContent>

            <Button variant="ghost" size="sm" asChild>

              <Link to="/website/settings">{t('website.hub.advancedSettings')}</Link>

            </Button>

          </CardContent>

        </Card>

      </div>

    );

  }



  return (

    <div className="max-w-2xl mx-auto space-y-6">

      <div className="flex items-center justify-center gap-2 text-sm">

        {STEPS.map((s, i) => (

          <React.Fragment key={s}>

            <span

              className={`rounded-full px-3 py-1 font-medium ${

                i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'

              }`}

            >

              {i + 1}. {t(`website.hub.step${s.charAt(0).toUpperCase()}${s.slice(1)}`)}

            </span>

            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}

          </React.Fragment>

        ))}

      </div>



      <Card className="border-2 border-primary/20">

        <CardHeader className="text-center pb-2">

          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">

            <Store className="w-8 h-8 text-primary" />

          </div>

          <CardTitle className="text-2xl">{t('website.hub.createTitle')}</CardTitle>

          <CardDescription className="text-base">{t('website.hub.createDesc')}</CardDescription>

        </CardHeader>

        <CardContent className="space-y-5">

          {step === 0 && (

            <>

              <div className="space-y-2">

                <Label htmlFor="shopName">{t('website.hub.shopNameLabel')}</Label>

                <Input

                  id="shopName"

                  placeholder={t('website.hub.shopNamePlaceholder')}

                  value={shopName}

                  onChange={(e) => setShopName(e.target.value)}

                />

              </div>

              <div className="space-y-2">

                <Label>{t('website.hub.nicheLabel')}</Label>

                <div className="flex flex-wrap gap-2">

                  {NICHES.map((n) => (

                    <button

                      key={n.id}

                      type="button"

                      onClick={() => setNiche(n.id)}

                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${

                        niche === n.id ? 'border-primary bg-primary/10 text-primary font-medium' : 'hover:bg-muted'

                      }`}

                    >

                      {t(`website.hub.${n.labelKey}`)}

                    </button>

                  ))}

                </div>

                <p className="text-xs text-muted-foreground">{t('website.hub.nicheHint')}</p>

              </div>

              <div className="space-y-2">

                <Label htmlFor="slogan">{t('website.hub.sloganOptional')}</Label>

                <Input

                  id="slogan"

                  placeholder={autoSlogan || t('website.hub.sloganPlaceholder')}

                  value={slogan}

                  onChange={(e) => setSlogan(e.target.value)}

                />

              </div>

            </>

          )}



          {step === 1 && (

            <TemplatePicker

              compact

              applyOnClick={false}

              currentTemplate={selectedTemplate}

              onSelect={(id) => setSelectedTemplate(id)}

            />

          )}



          {step === 2 && (

            <>

              <div className="space-y-2">

                <Label htmlFor="phone" className="flex items-center gap-2">

                  <MessageCircle className="w-4 h-4" />

                  {t('website.hub.whatsappOptional')}

                </Label>

                <Input

                  id="phone"

                  placeholder="+216 22 123 456"

                  value={phone}

                  onChange={(e) => setPhone(e.target.value)}

                />

                <p className="text-xs text-muted-foreground">{t('website.hub.whatsappHint')}</p>

              </div>



              <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/30">

                <Checkbox checked={seedProducts} onCheckedChange={(v) => setSeedProducts(Boolean(v))} />

                <span>

                  <span className="block text-sm font-medium">{t('website.hub.seedProductsLabel')}</span>

                  <span className="block text-xs text-muted-foreground mt-1">{t('website.hub.seedProductsHint')}</span>

                </span>

              </label>



              <ul className="text-sm text-muted-foreground space-y-1 border rounded-lg p-4 bg-muted/30">

                <li>• {t('website.hub.feature1')}</li>

                <li>• {t('website.hub.feature2')}</li>

                <li>• {t('website.hub.summaryTemplate', { template: selectedTemplate })}</li>

                <li>• {t('website.hub.summaryNiche', { niche: t(`website.hub.${NICHES.find((n) => n.id === niche)?.labelKey}`) })}</li>

              </ul>

            </>

          )}



          <div className="flex gap-3 pt-2">

            {step > 0 && (

              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>

                <ChevronLeft className="w-4 h-4 mr-1" />

                {t('website.hub.back')}

              </Button>

            )}

            {step < STEPS.length - 1 ? (

              <Button

                type="button"

                className="flex-1"

                disabled={step === 0 && !canNextStep0}

                onClick={() => setStep((s) => s + 1)}

              >

                {t('website.hub.continue')}

                <ChevronRight className="w-4 h-4 ml-1" />

              </Button>

            ) : (

              <Button type="button" className="flex-1" size="lg" onClick={handleCreate} disabled={generating}>

                {generating ? (

                  <>

                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />

                    {t('website.hub.creating')}

                  </>

                ) : (

                  <>

                    <Sparkles className="w-5 h-5 mr-2" />

                    {t('website.hub.createNow')}

                  </>

                )}

              </Button>

            )}

          </div>



          <p className="text-center text-xs text-muted-foreground">

            {t('website.hub.accountEmail', { email: user?.email })}

          </p>

        </CardContent>

      </Card>

    </div>

  );

};



export default SimpleBoutiquePanel;


