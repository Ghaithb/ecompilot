import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

/**
 * API SERVICE - WEBSITE BUILDER
 * 
 * Tous les endpoints pour:
 * - Génération de sites modernes
 * - Builder visuel
 * - Optimisations
 * - Composants
 */

export const websiteBuilderApi = {
  
  // ==================== COMPOSANTS ====================
  
  /**
   * Récupérer la liste des composants disponibles
   */
  getComponents: async () => {
    const response = await axios.get(`${API_URL}/website/builder/components`);
    return response.data;
  },

  /**
   * Créer un template de base
   */
  createBaseTemplate: async () => {
    const response = await axios.post(`${API_URL}/website/builder/create-base`);
    return response.data;
  },

  // ==================== BUILDER ====================
  
  /**
   * Générer HTML depuis le builder
   */
  generateFromBuilder: async (builder: any) => {
    const response = await axios.post(`${API_URL}/website/builder/generate`, builder);
    return response.data;
  },

  /**
   * Ajouter un composant au builder
   */
  addComponent: async (builder: any, componentType: string, position: number, content: any) => {
    const response = await axios.post(`${API_URL}/website/builder/add-component`, {
      builder,
      componentType,
      position,
      content
    });
    return response.data;
  },

  /**
   * Supprimer un composant
   */
  removeComponent: async (builder: any, componentId: string) => {
    const response = await axios.post(`${API_URL}/website/builder/remove-component`, {
      builder,
      componentId
    });
    return response.data;
  },

  /**
   * Déplacer un composant
   */
  moveComponent: async (builder: any, componentId: string, newPosition: number) => {
    const response = await axios.post(`${API_URL}/website/builder/move-component`, {
      builder,
      componentId,
      newPosition
    });
    return response.data;
  },

  /**
   * Mettre à jour un composant
   */
  updateComponent: async (builder: any, componentId: string, newContent: any) => {
    const response = await axios.post(`${API_URL}/website/builder/update-component`, {
      builder,
      componentId,
      newContent
    });
    return response.data;
  },

  /**
   * Mettre à jour la configuration globale
   */
  updateConfig: async (builder: any, config: any) => {
    const response = await axios.post(`${API_URL}/website/builder/update-config`, {
      builder,
      config
    });
    return response.data;
  },

  /**
   * Exporter le builder en JSON
   */
  exportBuilder: async (builder: any) => {
    const response = await axios.post(`${API_URL}/website/builder/export`, { builder });
    return response.data;
  },

  /**
   * Importer un builder depuis JSON
   */
  importBuilder: async (json: string) => {
    const response = await axios.post(`${API_URL}/website/builder/import`, { json });
    return response.data;
  },

  // ==================== GÉNÉRATION MODERNE ====================
  
  /**
   * Générer un site moderne avec IA
   */
  generateModernSite: async (data: {
    companyName: string;
    businessType: string;
    description?: string;
    slogan?: string;
    phone?: string;
    email: string;
    address?: string;
    city?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  }) => {
    const response = await axios.post(`${API_URL}/website/builder/generate-modern`, data);
    return response.data;
  },

  // ==================== OPTIMISATIONS ====================
  
  /**
   * Optimiser un site web complet
   */
  optimizeSite: async (html: string) => {
    const response = await axios.post(`${API_URL}/website/builder/optimize`, { html });
    return response.data;
  },

  /**
   * Analyser les performances
   */
  analyzePerformance: async (html: string) => {
    const response = await axios.post(`${API_URL}/website/builder/analyze-performance`, { html });
    return response.data;
  },

  /**
   * Vérifier le SEO
   */
  checkSEO: async (html: string) => {
    const response = await axios.post(`${API_URL}/website/builder/check-seo`, { html });
    return response.data;
  },

  /**
   * Générer un rapport d'optimisation complet
   */
  getOptimizationReport: async (html: string) => {
    const response = await axios.post(`${API_URL}/website/builder/optimization-report`, { html });
    return response.data;
  },
};

export default websiteBuilderApi;
