import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  videoUrl?: string;
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="dashboard"]',
    title: '📊 Tableau de bord',
    description: 'Suivez vos ventes, commandes et statistiques en temps réel',
    placement: 'bottom',
  },
  {
    target: '[data-tour="products"]',
    title: '📦 Gestion des produits',
    description: 'Créez et gérez votre catalogue avec photos et descriptions',
    placement: 'bottom',
  },
  {
    target: '[data-tour="orders"]',
    title: '🛒 Commandes',
    description: 'Suivez et traitez les commandes de vos clients',
    placement: 'bottom',
  },
  {
    target: '[data-tour="website"]',
    title: '🎨 Générateur de site IA',
    description: 'Créez votre site e-commerce en quelques clics avec l\'IA',
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: '🌓 Mode sombre',
    description: 'Basculez entre mode clair et sombre selon vos préférences',
    placement: 'left',
  },
];

export const OnboardingTour: React.FC = () => {
  const { isOnboardingActive, currentStep, nextStep, prevStep, skipOnboarding } = useOnboarding();
  const [showTour, setShowTour] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const currentTourStep = tourSteps[Math.min(currentStep, tourSteps.length - 1)];

  useEffect(() => {
    if (!isOnboardingActive || currentStep >= tourSteps.length) {
      setShowTour(false);
      return;
    }

    // Wait a bit for DOM to render
    const timer = setTimeout(() => {
      const element = document.querySelector(currentTourStep.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        setShowTour(true);

        // Calculate position
        const rect = element.getBoundingClientRect();
        const placement = currentTourStep.placement || 'bottom';

        let top = 0;
        let left = 0;

        switch (placement) {
          case 'bottom':
            top = rect.bottom + window.scrollY + 10;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'top':
            top = rect.top + window.scrollY - 10;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.left + window.scrollX - 10;
            break;
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.right + window.scrollX + 10;
            break;
        }

        setPosition({ top, left });

        // Highlight element
        element.style.position = 'relative';
        element.style.zIndex = '100';
        element.classList.add('tour-highlight');
      } else {
        setShowTour(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (targetElement) {
        targetElement.style.zIndex = '';
        targetElement.classList.remove('tour-highlight');
      }
    };
  }, [isOnboardingActive, currentStep, currentTourStep]);

  if (!showTour || !currentTourStep || currentStep >= tourSteps.length) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      nextStep();
    } else {
      setShowTour(false);
      skipOnboarding();
    }
  };

  const handleSkip = () => {
    setShowTour(false);
    if (targetElement) {
      targetElement.style.zIndex = '';
      targetElement.classList.remove('tour-highlight');
    }
  };

  const placement = currentTourStep.placement || 'bottom';
  const isVertical = placement === 'top' || placement === 'bottom';

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleSkip}
      />

      {/* Tour Card */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-50"
          style={{
            top: position.top,
            left: position.left,
            transform: isVertical
              ? 'translateX(-50%)'
              : placement === 'left'
              ? 'translate(-100%, -50%)'
              : 'translateY(-50%)',
          }}
        >
          <Card className="w-80 shadow-2xl border-2 border-primary">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-base">{currentTourStep.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="h-6 w-6 -mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">{currentTourStep.description}</p>

              {currentTourStep.videoUrl && (
                <div className="mt-3 rounded-lg overflow-hidden bg-muted aspect-video">
                  <video
                    src={currentTourStep.videoUrl}
                    controls
                    className="w-full h-full"
                    poster="/video-placeholder.jpg"
                  >
                    Votre navigateur ne supporte pas la vidéo.
                  </video>
                </div>
              )}

              <div className="flex items-center justify-center gap-1 mt-4">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      index === currentStep
                        ? 'w-6 bg-primary'
                        : 'w-1.5 bg-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-4 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>

              <span className="text-xs text-muted-foreground">
                {currentStep + 1} / {tourSteps.length}
              </span>

              <Button size="sm" onClick={handleNext}>
                {currentStep < tourSteps.length - 1 ? (
                  <>
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  'Terminer'
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Arrow pointer */}
          <div
            className={cn(
              'absolute w-0 h-0 border-8',
              placement === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-transparent border-b-primary',
              placement === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-transparent border-t-primary',
              placement === 'left' && 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-transparent border-l-primary',
              placement === 'right' && 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-transparent border-r-primary'
            )}
          />
        </motion.div>
      </AnimatePresence>
    </>
  );
};
