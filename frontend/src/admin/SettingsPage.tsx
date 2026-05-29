import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const SettingsPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Plans, rôles et permissions (à implémenter)</p>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
