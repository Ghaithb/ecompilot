import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Bot, TrendingUp, Zap } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, register, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
  });

  if (isAuthenticated) {
    const isAdmin = user?.roles?.includes('admin');
    const target = isAdmin ? '/admin/users' : '/dashboard';
    return <Navigate to={target} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
  await login(loginData.email, loginData.password);
  // Redirection basée sur le rôle après connexion
  const isAdmin = user?.roles?.includes('admin');
  navigate(isAdmin ? '/admin/users' : '/dashboard', { replace: true });
    } catch (error) {
      // Error handled in AuthContext
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerData);
      // Redirection vers le questionnaire d'onboarding après inscription
      navigate('/onboarding/survey', { replace: true });
    } catch (error) {
      // Error handled in AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Section présentation */}
        <div className="space-y-8">
          {/* Message de bienvenue */}
          <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded-md mb-4">
            <p className="font-medium">Bienvenue sur EcomPilot</p>
            <p className="text-sm">Veuillez vous connecter avec vos identifiants réels pour accéder à la plateforme.</p>
          </div>
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EcomPilot
                </h1>
                <p className="text-gray-600">L'IA qui pilote votre e-commerce</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Révolutionnez votre e-commerce avec l'IA
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Une plateforme SaaS tout-en-un qui unifie vente, finance et intelligence artificielle 
              pour optimiser automatiquement votre business.
            </p>
          </div>

          {/* Fonctionnalités IA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Bot className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Assistant IA Copilote</h3>
              </div>
              <p className="text-sm text-gray-600">
                Votre conseiller intelligent 24/7 pour optimiser vos ventes et finances
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Prévisions IA</h3>
              </div>
              <p className="text-sm text-gray-600">
                Prédictions de ventes et recommandations de stock automatisées
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Pricing Dynamique</h3>
              </div>
              <p className="text-sm text-gray-600">
                Optimisation automatique des prix pour maximiser vos marges
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
              <div className="flex items-center gap-3 mb-2">
                <Bot className="w-6 h-6 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Contenu IA</h3>
              </div>
              <p className="text-sm text-gray-600">
                Génération automatique de descriptions et stratégies marketing
              </p>
            </div>
          </div>
        </div>

        {/* Section authentification */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">Accéder à EcomPilot</CardTitle>
              <p className="text-gray-600">Connectez-vous ou créez votre compte</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="connexion" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="connexion">Connexion</TabsTrigger>
                  <TabsTrigger value="inscription">Inscription</TabsTrigger>
                </TabsList>
                
                <TabsContent value="connexion" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
                      <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="inscription" className="space-y-4 mt-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">Prénom</label>
                        <input
                          id="firstName"
                          placeholder="John"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">Nom</label>
                        <input
                          id="lastName"
                          placeholder="Doe"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
                      <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="text-sm font-medium">Nom de votre entreprise</label>
                      <input
                        id="companyName"
                        placeholder="Mon E-commerce"
                        value={registerData.companyName}
                        onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Création...' : 'S\'inscrire'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;