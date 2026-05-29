import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo?: File | string;
}

interface Step5Props {
  data: {
    story: string;
    foundingYear?: number;
    teamSize?: number;
    values: string[];
    team: TeamMember[];
  };
  onChange: (data: any) => void;
}

export function Step5About({ data, onChange }: Step5Props) {
  const [photoPreviews, setPhotoPreviews] = useState<{ [key: number]: string }>({});

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addValue = () => {
    handleChange('values', [...data.values, '']);
  };

  const removeValue = (index: number) => {
    handleChange('values', data.values.filter((_, i) => i !== index));
  };

  const updateValue = (index: number, value: string) => {
    const newValues = [...data.values];
    newValues[index] = value;
    handleChange('values', newValues);
  };

  const addTeamMember = () => {
    handleChange('team', [...data.team, { name: '', role: '', bio: '' }]);
  };

  const removeTeamMember = (index: number) => {
    handleChange('team', data.team.filter((_, i) => i !== index));
    const newPreviews = { ...photoPreviews };
    delete newPreviews[index];
    setPhotoPreviews(newPreviews);
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: any) => {
    const newTeam = [...data.team];
    newTeam[index] = { ...newTeam[index], [field]: value };
    handleChange('team', newTeam);
  };

  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews({ ...photoPreviews, [index]: reader.result as string });
      };
      reader.readAsDataURL(file);
      updateTeamMember(index, 'photo', file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Histoire */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Histoire de l'entreprise</h3>
        
        <div className="space-y-2">
          <Label htmlFor="story">Votre histoire *</Label>
          <Textarea
            id="story"
            rows={6}
            placeholder="Racontez l'histoire de votre entreprise, comment elle a été créée, votre mission..."
            value={data.story}
            onChange={(e) => handleChange('story', e.target.value)}
          />
          <p className="text-xs text-gray-500">Soyez authentique et personnel</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foundingYear">Année de création</Label>
            <Input
              id="foundingYear"
              type="number"
              placeholder="2015"
              value={data.foundingYear || ''}
              onChange={(e) => handleChange('foundingYear', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSize">Nombre d'employés</Label>
            <Input
              id="teamSize"
              type="number"
              placeholder="8"
              value={data.teamSize || ''}
              onChange={(e) => handleChange('teamSize', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>
      </div>

      {/* Valeurs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Vos Valeurs</h3>
          <Button onClick={addValue} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {data.values.length === 0 && (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-600">
            Aucune valeur ajoutée. Ex: Excellence, Innovation, Écoute client
          </div>
        )}

        <div className="space-y-2">
          {data.values.map((value, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Valeur #${index + 1}`}
                value={value}
                onChange={(e) => updateValue(index, e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeValue(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Équipe */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">Votre Équipe</h3>
            <p className="text-sm text-gray-600">Présentez les membres clés</p>
          </div>
          <Button onClick={addTeamMember} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {data.team.length === 0 && (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-600">
            Aucun membre ajouté
          </div>
        )}

        <div className="space-y-4">
          {data.team.map((member, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <span className="font-medium">Membre #{index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTeamMember(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Photo */}
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <div className="border-2 border-dashed rounded-lg p-2">
                    {photoPreviews[index] ? (
                      <div className="space-y-1">
                        <img
                          src={photoPreviews[index]}
                          alt="Member"
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const newPreviews = { ...photoPreviews };
                            delete newPreviews[index];
                            setPhotoPreviews(newPreviews);
                            updateTeamMember(index, 'photo', undefined);
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
                          id={`member-photo-${index}`}
                        />
                        <label htmlFor={`member-photo-${index}`}>
                          <Button variant="ghost" size="sm" asChild>
                            <span className="text-xs">Upload</span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Infos */}
                <div className="md:col-span-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label>Nom *</Label>
                      <Input
                        placeholder="Jean Dupont"
                        value={member.name}
                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Poste *</Label>
                      <Input
                        placeholder="Directeur"
                        value={member.role}
                        onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Biographie courte</Label>
                    <Textarea
                      rows={2}
                      placeholder="Décrivez brièvement son parcours..."
                      value={member.bio}
                      onChange={(e) => updateTeamMember(index, 'bio', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
