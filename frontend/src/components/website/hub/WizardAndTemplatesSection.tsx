import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, ArrowRight } from 'lucide-react';

const WizardAndTemplatesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleStartWizard = () => {
    navigate('/website');
  };

  return (
    <div className="space-y-6">
      {/* Section principale - Assistant IA uniquement */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-2">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-purple-600" />
            Créez Votre Site Web en 30 Secondes
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Utilisez notre assistant IA pour générer un site professionnel automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="bg-white dark:bg-gray-900 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">🧙 Assistant IA</CardTitle>
              <CardDescription className="text-base">
                Répondez à quelques questions et l'IA créera votre site complet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-base">Génération automatique du contenu</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-base">Design professionnel adapté</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-base">SEO optimisé</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-base">Prêt en 30 secondes</span>
                </li>
              </ul>
              <Button 
                onClick={handleStartWizard}
                className="w-full"
                size="lg"
              >
                Démarrer l'Assistant IA
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default WizardAndTemplatesSection;
