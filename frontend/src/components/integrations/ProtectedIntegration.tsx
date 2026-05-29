import React from 'react';
import { AlertCircle, Link2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface IntegrationRequiredProps {
  integrationName: string;
  description: string;
  setupUrl?: string;
  icon?: React.ReactNode;
}

export const IntegrationRequired: React.FC<IntegrationRequiredProps> = ({
  integrationName,
  description,
  setupUrl = '/integrations',
  icon,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            {icon || <Link2 size={48} className="text-gray-400" />}
          </div>
          <h2 className="text-2xl font-bold mb-2">Intégration requise</h2>
          <p className="text-gray-600 mb-6">
            Pour accéder à cette fonctionnalité, vous devez d'abord connecter {integrationName}.
          </p>
          {description && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">{description}</p>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Retour
            </Button>
            <Button onClick={() => navigate(setupUrl)}>
              <Link2 size={18} className="mr-2" />
              Configurer l'intégration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProtectedIntegrationProps {
  children: React.ReactNode;
  isConnected: boolean;
  integrationName: string;
  description: string;
  setupUrl?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const ProtectedIntegration: React.FC<ProtectedIntegrationProps> = ({
  children,
  isConnected,
  integrationName,
  description,
  setupUrl,
  icon,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <IntegrationRequired
        integrationName={integrationName}
        description={description}
        setupUrl={setupUrl}
        icon={icon}
      />
    );
  }

  return <>{children}</>;
};
