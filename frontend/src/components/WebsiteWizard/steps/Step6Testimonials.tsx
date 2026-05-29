import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Star, Upload } from 'lucide-react';
import { useState } from 'react';

interface Review {
  name: string;
  content: string;
  rating: number;
  photo?: File | string;
}

interface Step6Props {
  data: {
    reviews: Review[];
    stats: {
      yearsExperience: number;
      happyClients: number;
      projectsCompleted: number;
    };
  };
  onChange: (data: any) => void;
}

export function Step6Testimonials({ data, onChange }: Step6Props) {
  const [photoPreviews, setPhotoPreviews] = useState<{ [key: number]: string }>({});

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleStatsChange = (field: keyof typeof data.stats, value: number) => {
    onChange({
      ...data,
      stats: { ...data.stats, [field]: value },
    });
  };

  const addReview = () => {
    handleChange('reviews', [...data.reviews, { name: '', content: '', rating: 5 }]);
  };

  const removeReview = (index: number) => {
    handleChange('reviews', data.reviews.filter((_, i) => i !== index));
    const newPreviews = { ...photoPreviews };
    delete newPreviews[index];
    setPhotoPreviews(newPreviews);
  };

  const updateReview = (index: number, field: keyof Review, value: any) => {
    const newReviews = [...data.reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    handleChange('reviews', newReviews);
  };

  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews({ ...photoPreviews, [index]: reader.result as string });
      };
      reader.readAsDataURL(file);
      updateReview(index, 'photo', file);
    }
  };

  const RatingStars = ({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Chiffres Clés */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Chiffres Clés</h3>
        <p className="text-sm text-gray-600">Ces statistiques apparaîtront sur votre page</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <Label className="text-blue-900">Années d'expérience</Label>
            <Input
              type="number"
              value={data.stats.yearsExperience}
              onChange={(e) => handleStatsChange('yearsExperience', parseInt(e.target.value) || 0)}
              className="mt-2 text-2xl font-bold text-blue-900 bg-white"
            />
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <Label className="text-green-900">Clients satisfaits</Label>
            <Input
              type="number"
              value={data.stats.happyClients}
              onChange={(e) => handleStatsChange('happyClients', parseInt(e.target.value) || 0)}
              className="mt-2 text-2xl font-bold text-green-900 bg-white"
            />
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <Label className="text-purple-900">Projets réalisés</Label>
            <Input
              type="number"
              value={data.stats.projectsCompleted}
              onChange={(e) => handleStatsChange('projectsCompleted', parseInt(e.target.value) || 0)}
              className="mt-2 text-2xl font-bold text-purple-900 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Témoignages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">Témoignages Clients</h3>
            <p className="text-sm text-gray-600">Ajoutez les avis de vos clients</p>
          </div>
          <Button onClick={addReview} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {data.reviews.length === 0 && (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">Aucun témoignage ajouté</p>
            <Button onClick={addReview} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre premier témoignage
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {data.reviews.map((review, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4 bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <span className="font-medium">Témoignage #{index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReview(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Photo */}
                <div className="space-y-2">
                  <Label>Photo (optionnel)</Label>
                  <div className="border-2 border-dashed rounded-lg p-2">
                    {photoPreviews[index] ? (
                      <div className="space-y-1">
                        <img
                          src={photoPreviews[index]}
                          alt="Client"
                          className="w-full h-24 object-cover rounded-full mx-auto"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const newPreviews = { ...photoPreviews };
                            delete newPreviews[index];
                            setPhotoPreviews(newPreviews);
                            updateReview(index, 'photo', undefined);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(index, e)}
                          className="hidden"
                          id={`review-photo-${index}`}
                        />
                        <label htmlFor={`review-photo-${index}`}>
                          <Button variant="ghost" size="sm" asChild>
                            <span className="text-xs">Upload</span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="md:col-span-3 space-y-3">
                  <div className="space-y-2">
                    <Label>Nom du client *</Label>
                    <Input
                      placeholder="Marie Dupont"
                      value={review.name}
                      onChange={(e) => updateReview(index, 'name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Note *</Label>
                    <RatingStars
                      rating={review.rating}
                      onChange={(rating) => updateReview(index, 'rating', rating)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Avis *</Label>
                    <Textarea
                      rows={3}
                      placeholder="Excellent service, très professionnel..."
                      value={review.content}
                      onChange={(e) => updateReview(index, 'content', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.reviews.length > 0 && data.reviews.length < 6 && (
          <Button onClick={addReview} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un autre témoignage
          </Button>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Conseil:</strong> Les témoignages authentiques avec photos augmentent la crédibilité de 40%. 
          Demandez la permission à vos clients avant d'utiliser leur nom et photo.
        </p>
      </div>
    </div>
  );
}
