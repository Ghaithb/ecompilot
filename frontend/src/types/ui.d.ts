// Type declarations for UI components
declare module '@/components/ui/*' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
  export const Button: React.ComponentType<any>;
  export const Card: React.ComponentType<any>;
  export const CardHeader: React.ComponentType<any>;
  export const CardTitle: React.ComponentType<any>;
  export const CardContent: React.ComponentType<any>;
  export const CardDescription: React.ComponentType<any>;
  export const Badge: React.ComponentType<any>;
  export const Tabs: React.ComponentType<any>;
  export const TabsContent: React.ComponentType<any>;
  export const TabsList: React.ComponentType<any>;
  export const TabsTrigger: React.ComponentType<any>;
  export const Avatar: React.ComponentType<any>;
  export const AvatarFallback: React.ComponentType<any>;
}