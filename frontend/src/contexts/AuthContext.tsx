import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: string[];
    };
  };
  message: string;
}

interface ApiResponse {
  access_token: string;
  user: User;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  companyName?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  avatar?: string;
  roles: string[];
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    language: string;
  };
  tenant: {
    id: string;
    name: string;
    plan: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDev: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const DEV_USER: User = {
  id: 'dev-user',
  email: 'dev@example.com',
  firstName: 'Dev',
  lastName: 'User',
  roles: ['admin'],
  tenant: {
    id: 'dev-tenant',
    name: 'Dev Tenant',
    plan: 'pro'
  }
};

// Constants pour la gestion des tokens
const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const TOKEN_DURATION = 24 * 60 * 60 * 1000; // 24 heures

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    const expiry = Date.now() + TOKEN_DURATION;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  };

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  };

  const loginAsDev = async () => {
    if (process.env.NODE_ENV === 'development') {
      setUser(DEV_USER);
      setToken('dev-token');
      toast({
        title: 'Mode développement',
        description: 'Connecté en tant que développeur',
      });
    }
  };

  const isTokenExpired = () => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && !isTokenExpired()) {
        try {
          const userData = await authApi.profile();
          setUser(userData);
        } catch (error) {
          clearToken();
        }
      } else if (token) {
        // Token expiré
        clearToken();
        toast({
          title: 'Session expirée',
          description: 'Veuillez vous reconnecter',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    };

    checkAuth();

    // Vérification périodique de l'expiration du token
    const interval = setInterval(() => {
      if (isTokenExpired() && user) {
        clearToken();
        setUser(null);
        toast({
          title: 'Session expirée',
          description: 'Veuillez vous reconnecter',
          variant: 'destructive',
        });
      }
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, [user, toast]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password) as ApiResponse;
      
      setToken(response.access_token);
      setUser(response.user);
      
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${response.user.firstName} !`,
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Erreur de connexion',
        description: apiError.response?.data?.message || apiError.message || 'Identifiants invalides',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData) as ApiResponse;
      
      setToken(response.access_token);
      setUser(response.user);
      
      toast({
        title: 'Inscription réussie',
        description: `Bienvenue ${response.user.firstName} ! Redirection vers le questionnaire...`,
      });

      // Redirection automatique vers le questionnaire après inscription
      setTimeout(() => {
        window.location.href = '/onboarding/survey';
      }, 1500);
    } catch (error) {
      const apiError = error as ApiError;
      // Log full response for debugging
      // eslint-disable-next-line no-console
      console.error('Register error response:', apiError.response?.data || apiError);

      // If backend returns validation errors (errors array), join them
      const validationMessages = apiError.response?.data?.errors;
      const message = validationMessages && Array.isArray(validationMessages)
        ? validationMessages.join('; ')
        : apiError.response?.data?.message || apiError.message || 'Erreur lors de la création du compte';

      toast({
        title: 'Erreur d\'inscription',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté avec succès',
    });
  };

  const refreshToken = async (): Promise<void> => {
    try {
      if (!isTokenExpired()) {
        const response = await authApi.refreshToken() as ApiResponse;
        setToken(response.access_token);
      } else {
        throw new Error('Token expiré');
      }
    } catch (error) {
      logout();
      toast({
        title: 'Erreur de rafraîchissement',
        description: 'Votre session a expiré. Veuillez vous reconnecter.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const userData = await authApi.profile();
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors du rechargement du profil:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginAsDev,
    register,
    logout,
    refreshToken,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

