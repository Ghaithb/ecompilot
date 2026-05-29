import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ChevronRight, X, RotateCcw } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const OnboardingChecklist: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, progress, completeTask, skipOnboarding, resetOnboarding, isOnboardingActive } = useOnboarding();

  if (!isOnboardingActive) return null;

  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
      >
        <Card className="shadow-2xl border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  🚀 Bienvenue sur EcomPilot
                  {progress === 100 && (
                    <span className="text-sm font-normal text-green-600">✨ Terminé !</span>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {completedTasks} / {tasks.length} tâches complétées
                </CardDescription>
              </div>
              <div className="flex gap-1">
                {progress === 100 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetOnboarding}
                    className="h-6 w-6"
                    title="Recommencer"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipOnboarding}
                  className="h-6 w-6"
                  title="Masquer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
          </CardHeader>

          <CardContent className="space-y-2">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={cn(
                    'group flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                    task.completed
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                      : 'bg-card hover:bg-accent border-border hover:border-primary/50'
                  )}
                  onClick={() => {
                    if (task.route) navigate(task.route);
                  }}
                >
                  <div className="mt-0.5">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={cn(
                          'font-medium text-sm',
                          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        )}
                      >
                        {task.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                  </div>

                  {!task.completed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (task.route) navigate(task.route);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}

            {progress === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white text-center"
              >
                <p className="font-semibold">🎉 Félicitations !</p>
                <p className="text-sm mt-1 opacity-90">
                  Vous avez terminé la configuration initiale
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={skipOnboarding}
                >
                  Fermer
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
