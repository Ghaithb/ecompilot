import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface LogoUploaderProps {
  websiteId: string;
  currentLogo?: string;
  onUploadSuccess?: (logoUrls: { logo: string; favicon: string }) => void;
}

export function LogoUploader({ websiteId, currentLogo, onUploadSuccess }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<{ logo: string; favicon: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validation
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('❌ Format non supporté. Utilisez PNG, JPG, SVG ou WebP');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('❌ Fichier trop volumineux (max 5MB)');
      return;
    }

    setFile(selectedFile);

    // Créer aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/v1/website/${websiteId}/logo/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur upload');
      }

      const data = await response.json();
      setUploadedUrls({ logo: data.logo, favicon: data.favicon });
      
      toast.success('✅ Logo uploadé avec succès !');
      
      if (onUploadSuccess) {
        onUploadSuccess({ logo: data.logo, favicon: data.favicon });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur upload';
      toast.error(`❌ ${message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer le logo ?')) return;

    setUploading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/v1/website/${websiteId}/logo/delete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur suppression');
      }

      setPreview(null);
      setFile(null);
      setUploadedUrls(null);
      
      toast.success('🗑️ Logo supprimé');
    } catch (error) {
      toast.error('❌ Erreur lors de la suppression');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(currentLogo || null);
    setUploadedUrls(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Logo du site</h3>
        <p className="text-sm text-gray-600">
          Formats acceptés: PNG, JPG, SVG, WebP (max 5MB)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone d'aperçu */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          {preview ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Logo preview"
                  className="max-w-full h-40 object-contain mx-auto"
                />
                {!uploadedUrls && file && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 bg-white/90 hover:bg-white"
                    onClick={handleReset}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {uploadedUrls && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Logo uploadé avec succès</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Aucun logo</p>
                <p className="text-xs text-gray-500">
                  Cliquez sur "Choisir un fichier" pour en ajouter un
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Choisir un fichier
          </Button>

          {file && !uploadedUrls && (
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Upload...
                </>
              ) : (
                'Uploader le logo'
              )}
            </Button>
          )}

          {(preview || uploadedUrls) && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Info supplémentaire */}
        {uploadedUrls && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
            <p className="font-medium text-blue-900">Fichiers générés:</p>
            <ul className="space-y-1 text-blue-700">
              <li>✅ Logo original</li>
              <li>✅ Logo large (400x400)</li>
              <li>✅ Logo medium (200x200)</li>
              <li>✅ Logo small (100x100)</li>
              <li>✅ Favicon (32x32)</li>
            </ul>
          </div>
        )}

        {file && !uploadedUrls && (
          <div className="text-sm text-gray-600">
            <p><strong>Fichier sélectionné:</strong> {file.name}</p>
            <p><strong>Taille:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
