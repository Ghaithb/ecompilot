import React, { createContext, useContext, useState, useEffect } from 'react';
import { ONBOARDING_TASKS } from '@/content/saas-launch';

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route?: string;
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  tasks: OnboardingTask[];
  progress: number;
  completeTask: (taskId: string) => void;
  skipOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'ecompilot_onboarding_tasks';

const initialTasks: OnboardingTask[] = ONBOARDING_TASKS.map((t) => ({
  ...t,
  completed: false,
}));

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboardingActive, setIsOnboardingActive] = useState(true);
  const [tasks, setTasks] = useState<OnboardingTask[]>(initialTasks);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    if (tasks.every((t) => t.completed)) {
      setIsOnboardingActive(false);
    }
  }, [tasks]);

  const progress = Math.round(
    (tasks.filter((t) => t.completed).length / tasks.length) * 100,
  );

  const completeTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: true } : task)),
    );
  };

  const skipOnboarding = () => setIsOnboardingActive(false);

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingActive,
        tasks,
        progress,
        completeTask,
        skipOnboarding,
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
