import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X
} from 'lucide-react';

interface ServicesConfigProps {
  services: any[];
  onSave: () => void;
}

const ServicesConfig: React.FC<ServicesConfigProps> = ({ services, onSave }) => {
  const { toast } = useToast();
  const [editingService, setEditingService] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    icon: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      icon: '',
    });
    setEditingService(null);
    setIsAdding(false);
  };

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price?.toString() || '',
      duration: service.duration?.toString() || '',
      icon: service.icon || '',
    });
    setEditingService(service);
    setIsAdding(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('auth_token');
    const endpoint = editingService
      ? `http://localhost:3001/api/v1/website/services/${editingService.id}`
      : 'http://localhost:3001/api/v1/website/services';

    const method = editingService ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : undefined,
          duration: formData.duration ? parseInt(formData.duration) : undefined,
          icon: formData.icon,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: editingService ? 'Service mis à jour' : 'Service ajouté',
        });
        resetForm();
        onSave();
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/website/services/${serviceId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Service supprimé',
        });
        onSave();
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Services Personnalisés</CardTitle>
              <CardDescription>
                Gérez vos services spécifiques à votre activité
              </CardDescription>
            </div>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Formulaire d'ajout/édition */}
          {isAdding && (
            <Card className="mb-6 border-2 border-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingService ? 'Modifier le service' : 'Nouveau service'}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Nom du service *</Label>
                    <Input
                      placeholder="Ex: Consultation personnalisée"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Description *</Label>
                    <Textarea
                      placeholder="Décrivez votre service..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Prix (€)</Label>
                    <Input
                      type="number"
                      placeholder="99.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Durée (minutes)</Label>
                    <Input
                      type="number"
                      placeholder="60"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Icône (emoji ou nom)</Label>
                    <Input
                      placeholder="✨ ou sparkles"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.description}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingService ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des services */}
          {services.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucun service personnalisé</p>
              <p className="text-sm mt-2">Cliquez sur "Ajouter un service" pour commencer</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {service.icon && (
                          <span className="text-2xl">{service.icon}</span>
                        )}
                        <h4 className="font-semibold">{service.name}</h4>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      {service.price && (
                        <span className="font-semibold text-primary">
                          {service.price.toFixed(2)}€
                        </span>
                      )}
                      {service.duration && (
                        <span className="text-muted-foreground">
                          {service.duration} min
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesConfig;
