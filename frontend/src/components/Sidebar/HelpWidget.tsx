import { HelpCircle, Book, MessageCircle, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function HelpWidget() {
  const helpLinks = [
    {
      icon: Book,
      label: 'Documentation',
      url: '/docs',
    },
    {
      icon: Video,
      label: 'Tutoriels',
      url: '/tutorials',
    },
    {
      icon: MessageCircle,
      label: 'Support',
      url: '/support',
    },
  ];

  return (
    <div className="px-3 py-4 space-y-3 border-t border-gray-200">
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Besoin d'aide ?
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              Consultez nos ressources ou contactez le support
            </p>
            
            <div className="space-y-1.5">
              {helpLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <button
                    key={index}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-white rounded-md transition-colors"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
