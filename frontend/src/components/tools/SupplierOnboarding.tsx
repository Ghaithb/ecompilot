import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Loader2, Store, MapPin, Phone, CheckCircle2 } from 'lucide-react';

export default function SupplierOnboarding() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    city: '',
    phone: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/wholesale/onboard', formData);
      setSuccess(true);
      toast({ title: '🎉 Demande envoyée', description: 'Votre compte grossiste a été créé et est en attente de vérification.' });
    } catch (error) {
      toast({ title: '❌ Erreur', description: 'Impossible de finaliser l\'onboarding.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-12 pb-12 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">Bienvenue dans le réseau !</h2>
          <p className="text-emerald-700 max-w-sm mx-auto">
            Votre profil est en cours de revue. Vous recevrez un email dès que vous pourrez commencer à partager vos produits.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-primary" />
          <div>
            <CardTitle>Profil Grossiste</CardTitle>
            <CardDescription>Complétez vos informations pour être visible par les marchands.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom du commerce / Marque</Label>
              <Input 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Tunisia Wholesale Group"
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie principale</Label>
              <Input 
                required 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="Ex: Mode, Maison, High-Tech..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ville (Tunisie)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  required 
                  className="pl-9"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  placeholder="Tunis, Sousse, Sfax..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone professionnel</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  required 
                  className="pl-9"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="+216 ..."
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Présentation rapide</Label>
            <Textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Décrivez vos points forts, délais de livraison, etc."
              className="h-24"
            />
          </div>
          <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {loading ? 'Finalisation...' : 'Enregistrer mon profil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
