import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Facebook, Instagram, Twitter, Linkedin, Loader2, Send, Image as ImageIcon } from 'lucide-react';
import { socialMediaApi, SocialStatus } from '@/lib/socialMediaApi';
import { useToast } from '@/hooks/use-toast';

interface SocialPostComposerProps {
  onPublishSuccess?: () => void;
}

const SocialPostComposer: React.FC<SocialPostComposerProps> = ({ onPublishSuccess }) => {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [platforms, setPlatforms] = useState({
    facebook: false,
    instagram: false,
    twitter: false,
    linkedin: false,
  });
  const [status, setStatus] = useState<SocialStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await socialMediaApi.getSocialStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const handlePublish = async () => {
    if (!message.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le message ne peut pas être vide',
        variant: 'destructive',
      });
      return;
    }

    const selectedPlatforms = Object.entries(platforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform);

    if (selectedPlatforms.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Sélectionnez au moins une plateforme',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const results: { platform: string; success: boolean; error?: string }[] = [];

    try {
      // Publier sur chaque plateforme sélectionnée
      for (const platform of selectedPlatforms) {
        try {
          switch (platform) {
            case 'facebook':
              if (status?.facebook.connected) {
                await socialMediaApi.publishFacebook(message, imageUrl || undefined);
                results.push({ platform: 'Facebook', success: true });
              }
              break;
            case 'instagram':
              if (status?.instagram.connected) {
                if (!imageUrl) {
                  results.push({ platform: 'Instagram', success: false, error: 'Image requise' });
                } else {
                  await socialMediaApi.publishInstagram(imageUrl, message);
                  results.push({ platform: 'Instagram', success: true });
                }
              }
              break;
            case 'twitter':
              if (status?.twitter.connected) {
                await socialMediaApi.publishTwitter(message);
                results.push({ platform: 'Twitter', success: true });
              }
              break;
            case 'linkedin':
              if (status?.linkedin.connected) {
                await socialMediaApi.publishLinkedin(message, imageUrl || undefined);
                results.push({ platform: 'LinkedIn', success: true });
              }
              break;
          }
        } catch (error: any) {
          results.push({
            platform: platform.charAt(0).toUpperCase() + platform.slice(1),
            success: false,
            error: error.response?.data?.message || error.message,
          });
        }
      }

      // Afficher les résultats
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast({
          title: 'Publication réussie',
          description: `Publié sur ${successCount} plateforme(s)${failCount > 0 ? `, ${failCount} échec(s)` : ''}`,
        });
        
        // Réinitialiser le formulaire
        setMessage('');
        setImageUrl('');
        setPlatforms({ facebook: false, instagram: false, twitter: false, linkedin: false });
        
        if (onPublishSuccess) {
          onPublishSuccess();
        }
      }

      if (failCount > 0) {
        const errors = results.filter(r => !r.success).map(r => `${r.platform}: ${r.error}`).join('\n');
        toast({
          title: 'Erreurs de publication',
          description: errors,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getCharacterCount = () => {
    if (platforms.twitter) {
      return `${message.length}/280`;
    }
    return `${message.length} caractères`;
  };

  const isTwitterLimitExceeded = platforms.twitter && message.length > 280;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publier sur les Réseaux Sociaux</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Écrivez votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className={isTwitterLimitExceeded ? 'border-red-500' : ''}
          />
          <div className="flex justify-between items-center text-sm">
            <span className={isTwitterLimitExceeded ? 'text-red-500 font-medium' : 'text-gray-500'}>
              {getCharacterCount()}
            </span>
            {isTwitterLimitExceeded && (
              <span className="text-red-500 text-xs">Limite Twitter dépassée</span>
            )}
          </div>
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image (URL)</Label>
          <div className="flex gap-2">
            <ImageIcon className="w-5 h-5 text-gray-400 mt-2" />
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500">
            Requis pour Instagram, optionnel pour les autres plateformes
          </p>
        </div>

        {/* Sélection des plateformes */}
        <div className="space-y-3">
          <Label>Publier sur :</Label>
          <div className="grid grid-cols-2 gap-3">
            {/* Facebook */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="facebook"
                checked={platforms.facebook}
                onCheckedChange={(checked) =>
                  setPlatforms({ ...platforms, facebook: checked as boolean })
                }
                disabled={!status?.facebook.connected}
              />
              <Label
                htmlFor="facebook"
                className={`flex items-center gap-2 cursor-pointer ${
                  !status?.facebook.connected ? 'text-gray-400' : ''
                }`}
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
                {!status?.facebook.connected && (
                  <span className="text-xs text-gray-400">(non connecté)</span>
                )}
              </Label>
            </div>

            {/* Instagram */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="instagram"
                checked={platforms.instagram}
                onCheckedChange={(checked) =>
                  setPlatforms({ ...platforms, instagram: checked as boolean })
                }
                disabled={!status?.instagram.connected}
              />
              <Label
                htmlFor="instagram"
                className={`flex items-center gap-2 cursor-pointer ${
                  !status?.instagram.connected ? 'text-gray-400' : ''
                }`}
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                Instagram
                {!status?.instagram.connected && (
                  <span className="text-xs text-gray-400">(non connecté)</span>
                )}
              </Label>
            </div>

            {/* Twitter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="twitter"
                checked={platforms.twitter}
                onCheckedChange={(checked) =>
                  setPlatforms({ ...platforms, twitter: checked as boolean })
                }
                disabled={!status?.twitter.connected}
              />
              <Label
                htmlFor="twitter"
                className={`flex items-center gap-2 cursor-pointer ${
                  !status?.twitter.connected ? 'text-gray-400' : ''
                }`}
              >
                <Twitter className="w-4 h-4 text-blue-400" />
                Twitter
                {!status?.twitter.connected && (
                  <span className="text-xs text-gray-400">(non connecté)</span>
                )}
              </Label>
            </div>

            {/* LinkedIn */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="linkedin"
                checked={platforms.linkedin}
                onCheckedChange={(checked) =>
                  setPlatforms({ ...platforms, linkedin: checked as boolean })
                }
                disabled={!status?.linkedin.connected}
              />
              <Label
                htmlFor="linkedin"
                className={`flex items-center gap-2 cursor-pointer ${
                  !status?.linkedin.connected ? 'text-gray-400' : ''
                }`}
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
                {!status?.linkedin.connected && (
                  <span className="text-xs text-gray-400">(non connecté)</span>
                )}
              </Label>
            </div>
          </div>
        </div>

        {/* Bouton de publication */}
        <Button
          onClick={handlePublish}
          disabled={loading || isTwitterLimitExceeded}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publication en cours...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Publier
            </>
          )}
        </Button>

        {/* Avertissement si aucune plateforme connectée */}
        {status &&
          !status.facebook.connected &&
          !status.instagram.connected &&
          !status.twitter.connected &&
          !status.linkedin.connected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              ⚠️ Aucun réseau social connecté. Allez dans{' '}
              <a href="/social-media" className="underline font-medium">
                Réseaux Sociaux
              </a>{' '}
              pour connecter vos comptes.
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default SocialPostComposer;
