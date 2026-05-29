import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  illustration,
}) => {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        {illustration || (
          <div className="mb-4 p-6 bg-muted rounded-full">
            <Icon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        
        {action && (
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Illustrations SVG sympas
export const EmptyBoxIllustration = () => (
  <svg
    className="w-32 h-32 mb-4"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="40" y="60" width="120" height="100" rx="8" fill="currentColor" className="text-muted opacity-20" />
    <rect x="50" y="50" width="100" height="80" rx="6" fill="currentColor" className="text-primary opacity-30" />
    <path d="M100 50 L60 70 L60 130 L100 150 L140 130 L140 70 Z" fill="currentColor" className="text-primary opacity-50" />
    <circle cx="100" cy="40" r="8" fill="currentColor" className="text-primary" />
  </svg>
);

export const EmptyCartIllustration = () => (
  <svg
    className="w-32 h-32 mb-4"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="70" cy="170" r="10" fill="currentColor" className="text-muted-foreground opacity-40" />
    <circle cx="130" cy="170" r="10" fill="currentColor" className="text-muted-foreground opacity-40" />
    <path
      d="M30 30 L50 30 L70 130 L150 130 L170 60 L60 60"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary opacity-50"
      fill="none"
    />
  </svg>
);

export const EmptyUsersIllustration = () => (
  <svg
    className="w-32 h-32 mb-4"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="100" cy="70" r="30" fill="currentColor" className="text-primary opacity-30" />
    <ellipse cx="100" cy="150" rx="50" ry="30" fill="currentColor" className="text-primary opacity-50" />
    <circle cx="60" cy="80" r="20" fill="currentColor" className="text-muted opacity-40" />
    <circle cx="140" cy="80" r="20" fill="currentColor" className="text-muted opacity-40" />
  </svg>
);

export const EmptyDocumentIllustration = () => (
  <svg
    className="w-32 h-32 mb-4"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="50" y="30" width="100" height="140" rx="8" fill="currentColor" className="text-muted opacity-20" />
    <rect x="60" y="40" width="80" height="120" rx="4" fill="currentColor" className="text-primary opacity-30" />
    <line x1="70" y1="60" x2="130" y2="60" stroke="currentColor" strokeWidth="4" className="text-primary" />
    <line x1="70" y1="80" x2="130" y2="80" stroke="currentColor" strokeWidth="4" className="text-primary opacity-70" />
    <line x1="70" y1="100" x2="110" y2="100" stroke="currentColor" strokeWidth="4" className="text-primary opacity-50" />
  </svg>
);
