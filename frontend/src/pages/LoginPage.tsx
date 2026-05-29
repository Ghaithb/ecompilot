import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, Package, ArrowRight } from 'lucide-react';
import { SAAS_TAGLINE, SAAS_TAGLINE_FR } from '@/content/saas-launch';
import { ACTIVATION_KEY, PLAN_KEY } from '@/pages/onboarding/ActivationFlowPage';

const LoginPage: React.FC = () => {
  const { login, register, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('signup') ? 'register' : 'login';
  const urlPlan = searchParams.get('plan');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    country: 'TN',
    phone: '',
  });

  useEffect(() => {
    if (urlPlan === 'starter' || urlPlan === 'pro') {
      localStorage.setItem(PLAN_KEY, urlPlan);
    }
  }, [urlPlan]);

  if (isAuthenticated) {
    const isAdmin = user?.roles?.includes('admin');
    if (isAdmin) return <Navigate to="/admin/users" replace />;
    const activated = localStorage.getItem(ACTIVATION_KEY) === 'true';
    return <Navigate to={activated ? '/dashboard' : '/onboarding/activate'} replace />;
  }

  const afterAuth = () => {
    const activated = localStorage.getItem(ACTIVATION_KEY) === 'true';
    navigate(activated ? '/dashboard' : '/onboarding/activate', { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginData.email, loginData.password);
    afterAuth();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({
      ...registerData,
      companyName: registerData.companyName || registerData.firstName,
    });
    localStorage.removeItem(ACTIVATION_KEY);
    navigate('/onboarding/activate', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Truck className="h-5 w-5 text-primary" />
          EcomPilot
        </Link>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">← Retour au site</Link>
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <p className="text-xs font-medium text-primary uppercase tracking-wide">{SAAS_TAGLINE}</p>
            <h1 className="text-2xl font-semibold mt-2">Connexion commerçant</h1>
            <p className="text-sm text-muted-foreground mt-1">{SAAS_TAGLINE_FR}</p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Essai gratuit</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Se connecter</CardTitle>
                  <CardDescription>Accédez à vos commandes et expéditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        required
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Mot de passe</label>
                      <input
                        type="password"
                        required
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      Connexion
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>14 jours offerts</CardTitle>
                  <CardDescription>Starter 49 DT · Pro 95 DT après essai</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Prénom"
                        required
                        className="rounded-md border px-3 py-2 text-sm"
                        value={registerData.firstName}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, firstName: e.target.value })
                        }
                      />
                      <input
                        placeholder="Nom"
                        required
                        className="rounded-md border px-3 py-2 text-sm"
                        value={registerData.lastName}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, lastName: e.target.value })
                        }
                      />
                    </div>
                    <input
                      placeholder="Boutique / entreprise"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={registerData.companyName}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, companyName: e.target.value })
                      }
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, email: e.target.value })
                      }
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone (+216…)"
                      required
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={registerData.phone}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, phone: e.target.value })
                      }
                    />
                    <input
                      type="password"
                      placeholder="Mot de passe (8+ caractères)"
                      required
                      minLength={8}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      Créer mon compte
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" /> Commandes COD
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3" /> Multi-transporteurs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
