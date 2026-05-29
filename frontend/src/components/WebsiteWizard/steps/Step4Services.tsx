import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface Service {
  name: string;
  description: string;
  price?: number;
  duration?: string;
  image?: File | string;
}

interface Step4Props {
  data: Service[];
  onChange: (data: Service[]) => void;
}

export function Step4Services({ data, onChange }: Step4Props) {
  const [imagePreviews, setImagePreviews] = useState<{ [key: number]: string }>({});

  const addService = () => {
    onChange([...data, { name: '', description: '', price: undefined, duration: '' }]);
  };

  const removeService = (index: number) => {
    const newServices = data.filter((_, i) => i !== index);
    onChange(newServices);
    
    const newPreviews = { ...imagePreviews };
    delete newPreviews[index];
    setImagePreviews(newPreviews);
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const newServices = [...data];
    newServices[index] = { ...newServices[index], [field]: value };
    onChange(newServices);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews({ ...imagePreviews, [index]: reader.result as string });
      };
      reader.readAsDataURL(file);
      updateService(index, 'image', file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">Vos Services / Produits</h3>
          <p className="text-sm text-gray-600">Ajoutez les services que vous proposez</p>
        </div>
        <Button onClick={addService} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un service
        </Button>
      </div>

      {data.length === 0 && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Aucun service ajouté</p>
          <Button onClick={addService} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter votre premier service
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {data.map((service, index) => (
          <div key={index} className="border rounded-lg p-6 space-y-4 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <span className="font-medium">Service #{index + 1}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeService(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du service *</Label>
                <Input
                  placeholder="Ex: Coupe & Coiffage"
                  value={service.name}
                  onChange={(e) => updateService(index, 'name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  rows={3}
                  placeholder="Décrivez votre service en détail..."
                  value={service.description}
                  onChange={(e) => updateService(index, 'description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix (€)</Label>
                  <Input
                    type="number"
                    placeholder="49.90"
                    value={service.price || ''}
                    onChange={(e) => updateService(index, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Durée</Label>
                  <Input
                    placeholder="Ex: 1h30, 2 jours"
                    value={service.duration || ''}
                    onChange={(e) => updateService(index, 'duration', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image du service</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  {imagePreviews[index] ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreviews[index]}
                        alt="Service preview"
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPreviews = { ...imagePreviews };
                          delete newPreviews[index];
                          setImagePreviews(newPreviews);
                          updateService(index, 'image', undefined);
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Upload className="w-6 h-6 mx-auto text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        className="hidden"
                        id={`service-image-${index}`}
                      />
                      <label htmlFor={`service-image-${index}`}>
                        <Button variant="outline" size="sm" asChild>
                          <span>Choisir une image</span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length > 0 && data.length < 8 && (
        <Button onClick={addService} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un autre service
        </Button>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Conseil:</strong> Mettez en avant les bénéfices client plutôt que les caractéristiques techniques. 
          Ajoutez 4-8 services principaux pour ne pas surcharger.
        </p>
      </div>
    </div>
  );
}
