import { Plus, Upload, FileText, Tag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Plus,
      label: 'Nouveau Produit',
      onClick: () => navigate('/products/new'),
      variant: 'default' as const,
    },
    {
      icon: FileText,
      label: 'Nouvelle Commande',
      onClick: () => navigate('/orders/new'),
      variant: 'outline' as const,
    },
    {
      icon: Tag,
      label: 'Code Promo',
      onClick: () => navigate('/promotions/new'),
      variant: 'outline' as const,
    },
    {
      icon: Upload,
      label: 'Importer CSV',
      onClick: () => navigate('/import'),
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="px-3 py-4 space-y-3 border-t border-gray-200">
      <h3 className="text-xs font-semibold text-gray-500 uppercase px-2">
        Actions Rapides
      </h3>
      
      <div className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant}
              size="sm"
              className="w-full justify-start"
              onClick={action.onClick}
            >
              <Icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
