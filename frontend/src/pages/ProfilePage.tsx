import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { User, Mail, Building, Shield, Bell, Palette, Save, Camera, Loader2 } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { setTheme } = useTheme();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    companyName: user?.companyName || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    pushNotifications: user?.preferences?.pushNotifications ?? true,
    darkMode: user?.preferences?.darkMode ?? false,
    language: user?.preferences?.language ?? 'fr',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEmailVerificationDialogOpen, setIsEmailVerificationDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Charger les préférences de l'utilisateur seulement au montage initial
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Seulement quand l'utilisateur change, pas à chaque update

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof profileData) => authApi.updateProfile(data),
    onSuccess: async (response) => {
      console.log('✅ Profile updated:', response);
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
      await refreshProfile();
    },
    onError: (error: any) => {
      console.error('❌ Error updating profile:', error.response?.data);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de mettre à jour le profil',
        variant: 'destructive',
      });
    },
  });

  // Mutation pour changer le mot de passe
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast({
        title: 'Mot de passe changé',
        description: 'Votre mot de passe a été modifié avec succès.',
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de changer le mot de passe',
        variant: 'destructive',
      });
    },
  });

  // Mutation pour mettre à jour les préférences
  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: typeof preferences) => {
      console.log('🔧 Saving preferences:', prefs);
      return authApi.updatePreferences(prefs);
    },
    onSuccess: async (response) => {
      console.log('✅ Preferences saved:', response);
      setTheme(preferences.darkMode ? 'dark' : 'light');
      toast({
        title: 'Préférences enregistrées',
        description: 'Vos préférences ont été mises à jour.',
      });
      await refreshProfile();
    },
    onError: (error: any) => {
      console.error('❌ Error saving preferences:', error.response?.data);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de mettre à jour les préférences',
        variant: 'destructive',
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: 'destructive',
      });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* En-tête du profil */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-600 mt-1">{user?.email}</p>
          <div className="flex gap-2 mt-2">
            {user?.roles?.includes('admin') && (
              <Badge variant="default" className="bg-purple-600">
                <Shield className="w-3 h-3 mr-1" />
                Administrateur
              </Badge>
            )}
            <Badge variant="secondary">
              <Building className="w-3 h-3 mr-1" />
              {user?.companyName}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Informations du profil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Gérez vos informations de profil et votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prénom</label>
              <Input
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <Input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              placeholder="votre@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building className="w-4 h-4" />
              Entreprise
            </label>
            <Input
              value={profileData.companyName}
              onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
              placeholder="Nom de votre entreprise"
            />
          </div>

          <Button 
            onClick={handleSaveProfile} 
            className="w-full md:w-auto"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Enregistrer les modifications</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Préférences
          </CardTitle>
          <CardDescription>
            Personnalisez votre expérience sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info sur les notifications */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 text-sm">À propos des notifications</p>
                <p className="text-xs text-blue-700 mt-1">
                  Ces préférences contrôlent les types de notifications que vous recevrez. 
                  Aucune vérification d'email n'est requise - activez simplement les options souhaitées et enregistrez.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Notifications par email</p>
                <p className="text-sm text-gray-600">
                  Recevoir des alertes pour les commandes, stock bas, etc.
                </p>
              </div>
            </div>
            <Button
              variant={preferences.emailNotifications ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                console.log('👆 Click on emailNotifications, current:', preferences.emailNotifications);
                setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications });
                console.log('✅ New state will be:', !preferences.emailNotifications);
              }}
            >
              {preferences.emailNotifications ? 'Activé' : 'Désactivé'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-sm text-gray-600">
                  Notifications dans le navigateur (à venir)
                </p>
              </div>
            </div>
            <Button
              variant={preferences.pushNotifications ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                console.log('👆 Click on pushNotifications, current:', preferences.pushNotifications);
                setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications });
                console.log('✅ New state will be:', !preferences.pushNotifications);
              }}
            >
              {preferences.pushNotifications ? 'Activé' : 'Désactivé'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Mode sombre</p>
                <p className="text-sm text-gray-600">Activer le thème sombre</p>
              </div>
            </div>
            <Button
              variant={preferences.darkMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                console.log('👆 Click on darkMode, current:', preferences.darkMode);
                setPreferences({ ...preferences, darkMode: !preferences.darkMode });
                console.log('✅ New state will be:', !preferences.darkMode);
              }}
            >
              {preferences.darkMode ? 'Activé' : 'Désactivé'}
            </Button>
          </div>

          <Button 
            onClick={() => {
              console.log('💾 Click on Save button');
              console.log('💾 Current preferences:', preferences);
              handleSavePreferences();
            }} 
            className="w-full md:w-auto mt-4"
            disabled={updatePreferencesMutation.isPending}
          >
            {updatePreferencesMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Enregistrer les préférences</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Gérez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Changer le mot de passe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Changer le mot de passe</DialogTitle>
                <DialogDescription>
                  Entrez votre mot de passe actuel et choisissez un nouveau mot de passe.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mot de passe actuel</label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouveau mot de passe</label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Changement...</>
                  ) : (
                    'Changer le mot de passe'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="w-full md:w-auto ml-0 md:ml-2" disabled>
            Activer l'authentification à deux facteurs (Bientôt)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
