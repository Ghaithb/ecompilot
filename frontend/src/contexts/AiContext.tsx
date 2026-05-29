import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AiContextType {
  // Chat Copilot
  chatWithCopilot: (message: string, context?: any) => Promise<any>;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  
  // Insights IA
  dashboardInsights: any;
  recommendations: any;
  
  // Fonctions IA
  generateProductContent: (productData: any) => Promise<any>;
  optimizePricing: (productId: string) => Promise<any>;
  analyzeInventory: () => Promise<any>;
  generateMarketingStrategy: (campaign: any) => Promise<any>;
  
  // État
  refreshInsights: () => void;
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  type: 'user' | 'ai';
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export const useAi = () => {
  const context = useContext(AiContext);
  if (!context) {
    throw new Error('useAi must be used within an AiProvider');
  }
  return context;
};

export const AiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!localStorage.getItem('auth_token');

  // Récupération des insights IA du dashboard (seulement si authentifié)
  const { data: dashboardInsights, refetch: refetchInsights } = useQuery({
    queryKey: ['ai', 'dashboard-insights'],
    queryFn: aiApi.getDashboardInsights,
    enabled: isAuthenticated, // Désactive la query si pas authentifié
    refetchInterval: isAuthenticated ? 5 * 60 * 1000 : false, // Refresh seulement si authentifié
    retry: false, // Pas de retry automatique
  });

  // Récupération des recommandations (seulement si authentifié)
  const { data: recommendations } = useQuery({
    queryKey: ['ai', 'recommendations'],
    queryFn: aiApi.getRecommendations,
    enabled: isAuthenticated, // Désactive la query si pas authentifié
    refetchInterval: isAuthenticated ? 10 * 60 * 1000 : false, // Refresh seulement si authentifié
    retry: false, // Pas de retry automatique
  });

  // Mutation pour le chat copilot
  const chatMutation = useMutation({
    mutationFn: ({ message, context }: { message: string; context?: any }) =>
      aiApi.chatWithCopilot(message, context),
    onSuccess: (data, variables) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: variables.message,
        response: data.response,
        timestamp: new Date(),
        type: 'ai',
      };
      setChatHistory(prev => [...prev, newMessage]);
    },
    onError: () => {
      toast({
        title: 'Erreur IA',
        description: 'Impossible de communiquer avec l\'assistant IA',
        variant: 'destructive',
      });
    },
  });

  // Mutation pour la génération de contenu
  const contentMutation = useMutation({
    mutationFn: aiApi.generateProductContent,
    onSuccess: () => {
      toast({
        title: 'Contenu généré',
        description: 'Le contenu du produit a été généré avec succès',
      });
    },
  });

  // Mutation pour l'optimisation des prix
  const pricingMutation = useMutation({
    mutationFn: ({ productId, pricingData }: { productId: string, pricingData: any }) => 
      aiApi.optimizePricing(productId, pricingData),
    onSuccess: () => {
      toast({
        title: 'Prix optimisé',
        description: 'Les recommandations de prix ont été générées',
      });
    },
  });

  // Mutation pour l'analyse des stocks
  const inventoryMutation = useMutation({
    mutationFn: aiApi.getInventoryAnalysis,
    onSuccess: () => {
      toast({
        title: 'Analyse terminée',
        description: 'L\'analyse des stocks a été effectuée',
      });
    },
  });

  // Mutation pour la stratégie marketing
  const marketingMutation = useMutation({
    mutationFn: aiApi.generateMarketingStrategy,
    onSuccess: () => {
      toast({
        title: 'Stratégie générée',
        description: 'La stratégie marketing a été créée',
      });
    },
  });

  // Fonctions du contexte
  const chatWithCopilot = useCallback(async (message: string, context?: any) => {
    setIsLoading(true);
    try {
      // Ajouter le message utilisateur à l'historique
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        message,
        response: '',
        timestamp: new Date(),
        type: 'user',
      };
      setChatHistory(prev => [...prev, userMessage]);

      const result = await chatMutation.mutateAsync({ message, context });
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [chatMutation]);

  const generateProductContent = useCallback(async (productData: any) => {
    return contentMutation.mutateAsync(productData);
  }, [contentMutation]);

  const optimizePricing = useCallback(async (productId: string, pricingData: any = {}) => {
    return pricingMutation.mutateAsync({ productId, pricingData });
  }, [pricingMutation]);

  const analyzeInventory = useCallback(async () => {
    return inventoryMutation.mutateAsync();
  }, [inventoryMutation]);

  const generateMarketingStrategy = useCallback(async (campaign: any) => {
    return marketingMutation.mutateAsync(campaign);
  }, [marketingMutation]);

  const refreshInsights = useCallback(() => {
    refetchInsights();
    queryClient.invalidateQueries({ queryKey: ['ai'] });
  }, [refetchInsights, queryClient]);

  const value: AiContextType = {
    chatWithCopilot,
    chatHistory,
    isLoading: isLoading || chatMutation.isPending,
    dashboardInsights,
    recommendations,
    generateProductContent,
    optimizePricing,
    analyzeInventory,
    generateMarketingStrategy,
    refreshInsights,
  };

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
};

