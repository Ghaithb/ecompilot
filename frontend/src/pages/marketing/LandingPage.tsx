import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Check,
  Package,
  Truck,
  Zap,
  MessageCircle,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  MVP_FEATURES,
  PRICING_PLANS,
  SAAS_TAGLINE,
  SAAS_TAGLINE_FR,
  SAAS_USE_CASE,
  LAUNCH_POSITIONING,
  PILOT_PROGRAM,
  CASE_STUDIES,
  MOAT_FEATURES,
  SERVICE_PAGES,
} from '@/content/saas-launch';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">EcomPilot</span>
          </div>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              {t('landing.navFeatures')}
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              {t('landing.navPricing')}
            </a>
            <a href="#how" className="hover:text-foreground transition-colors">
              {t('landing.navHow')}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">{t('landing.login')}</Link>
            </Button>
            <Button asChild>
              <Link to="/login?signup=1">{t('landing.trial')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/10" />
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 relative">
          <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">
            {SAAS_TAGLINE}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight max-w-3xl leading-[1.1]">
            {LAUNCH_POSITIONING.headline}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">{LAUNCH_POSITIONING.subheadline}</p>
          <p className="mt-3 text-sm text-muted-foreground">{SAAS_USE_CASE}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" className="h-12 px-8 shadow-lg shadow-primary/20" asChild>
              <Link to="/login?signup=1">
                {t('landing.startTrial')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12" asChild>
              <a href="#pricing">{t('landing.seePricing')}</a>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" /> {t('landing.carriersBadge')}
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" /> {t('landing.multiStore')}
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" /> {t('landing.fromPrice')}
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 border-b bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4">
            Un seul use case, trois étapes
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            De la commande reçue au colis chez le transporteur — automatisé.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Package,
                title: 'Commande entrante',
                text: 'COD, Shopify, ou saisie manuelle — statuts clairs.',
              },
              {
                step: '02',
                icon: Zap,
                title: 'Expédition 1 clic',
                text: 'Choix transporteur, étiquette, numéro de suivi.',
              },
              {
                step: '03',
                icon: Truck,
                title: 'Suivi & livraison',
                text: 'Webhooks, sync statut, WhatsApp client.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-xs font-mono text-muted-foreground">{item.step}</span>
                <item.icon className="h-8 w-8 text-primary mt-4 mb-4" />
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold mb-12">
            MVP — tout ce qu&apos;il faut pour vendre
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MVP_FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border p-6 bg-white">
                <h3 className="font-medium">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Pas d&apos;IA gadget</p>
                <p className="text-muted-foreground">Focus livraison & commandes, pas copilote marketing.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <BarChart3 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">KPIs simples</p>
                <p className="text-muted-foreground">À expédier, en transit, taux livré — c&apos;est tout.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilotes + preuve sociale — Phases 2–3 */}
      <section className="py-20 border-b bg-violet-50/40">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Phase 2 · Beachhead</p>
            <h2 className="text-2xl font-semibold">{PILOT_PROGRAM.title}</h2>
            <p className="mt-3 text-muted-foreground">{PILOT_PROGRAM.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('landing.pilotSlots', { slots: PILOT_PROGRAM.slots, days: LAUNCH_POSITIONING.trialDays })}
            </p>
            <Button className="mt-6" asChild>
              <Link to="/login?signup=1&pilot=1">{PILOT_PROGRAM.cta}</Link>
            </Button>
          </div>
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Phase 3 · ROI chiffré</p>
            <h2 className="text-2xl font-semibold mb-4">Études de cas pilotes</h2>
            <Button variant="link" className="px-0 mb-4" asChild>
              <Link to="/case-studies">{t('landing.caseStudiesLink')}</Link>
            </Button>
            <div className="space-y-4">
              {CASE_STUDIES.map((c) => (
                <div key={c.id} className="rounded-xl border bg-white p-4">
                  <p className="font-medium">{c.merchant}</p>
                  <p className="text-lg font-semibold text-primary mt-1">{c.metric}</p>
                  <p className="text-sm text-muted-foreground mt-1">{c.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Moat — Phase 4 */}
      <section className="py-16 border-b">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Phase 4 · Moat</p>
          <h2 className="text-2xl font-semibold mb-6">{t('landing.moatTitle')}</h2>
          <ul className="grid sm:grid-cols-2 gap-3 mb-6">
            {SERVICE_PAGES.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <Link to={`/service/${p.slug}`} className="text-sm text-primary hover:underline">
                  {p.title} →
                </Link>
              </li>
            ))}
          </ul>
          <ul className="grid sm:grid-cols-2 gap-3">
            {MOAT_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-t bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4">Tarifs simples</h2>
          <p className="text-center text-muted-foreground mb-12">
            Paiement virement ou cash — activation en moins de 15 minutes.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-8 relative ${
                  plan.highlighted
                    ? 'border-primary shadow-xl shadow-primary/10 ring-1 ring-primary'
                    : 'bg-card'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-6 text-xs font-medium bg-primary text-primary-foreground px-3 py-1 rounded-full">
                    Recommandé
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground">
                    {plan.currency}
                    {plan.period}
                  </span>
                </p>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-8"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  asChild
                >
                  <Link to={`/login?signup=1&plan=${plan.id}`}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">Prêt à expédier en 7 jours ?</h2>
          <p className="mt-4 opacity-90 max-w-lg mx-auto">
            Rejoignez les boutiques tunisiennes qui centralisent commandes et livraison sur EcomPilot.
          </p>
          <Button size="lg" variant="secondary" className="mt-8 h-12" asChild>
            <Link to="/login?signup=1">
              Créer mon compte gratuit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EcomPilot — {SAAS_TAGLINE}
      </footer>
    </div>
  );
};

export default LandingPage;
