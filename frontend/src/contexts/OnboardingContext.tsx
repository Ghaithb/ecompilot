import React, { createContext, useContext, useState, useEffect } from 'react';

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route?: string;
  action?: () => void;
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentStep: number;
  totalSteps: number;
  tasks: OnboardingTask[];
  progress: number;
  startOnboarding: () => void;
  skipOnboarding: () => void;
  completeTask: (taskId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'ecompilot_onboarding';

const initialTasks: OnboardingTask[] = [
  {
    id: 'create-product',
    title: 'Créer votre premier produit',
    description: 'Ajoutez un produit à votre catalogue avec photos et prix',
    completed: false,
    route: '/products',
  },
  {
    id: 'setup-payment',
    title: 'Configurer les paiements',
    description: 'Connectez Stripe pour accepter les paiements',
    completed: false,
    route: '/settings',
  },
  {
    id: 'add-inventory',
    title: 'Gérer votre inventaire',
    description: 'Définissez les quantités en stock pour vos produits',
    completed: false,
    route: '/products',
  },
  {
    id: 'customize-website',
    title: 'Personnaliser votre site',
    description: 'Utilisez le générateur IA pour créer votre vitrine',
    completed: false,
    route: '/website',
  },
  {
    id: 'test-order',
    title: 'Tester une commande',
    description: 'Simulez une commande pour vérifier le processus',
    completed: false,
    route: '/orders',
  },
];

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tasks, setTasks] = useState<OnboardingTask[]>(initialTasks);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTasks(data.tasks || initialTasks);
        setIsOnboardingActive(data.isActive || false);
        setCurrentStep(data.currentStep || 0);
      } catch (e) {
        console.error('Error loading onboarding data:', e);
      }
    } else {
      // First time user - show onboarding
      setIsOnboardingActive(true);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tasks,
        isActive: isOnboardingActive,
        currentStep,
      })
    );
  }, [tasks, isOnboardingActive, currentStep]);

  const progress = Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
  const totalSteps = tasks.length;

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStep(0);
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
  };

  const completeTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: true } : task))
    );
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsOnboardingActive(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const resetOnboarding = () => {
    setTasks(initialTasks);
    setCurrentStep(0);
    setIsOnboardingActive(true);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingActive,
        currentStep,
        totalSteps,
        tasks,
        progress,
        startOnboarding,
        skipOnboarding,
        completeTask,
        nextStep,
        prevStep,
        goToStep,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
