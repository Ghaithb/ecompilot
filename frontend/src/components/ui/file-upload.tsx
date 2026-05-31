import React, { useRef, useState } from 'react';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';
import { apiUrl, getAuthHeaders, resolveUploadUrl } from '@/lib/apiConfig';

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  accept?: string;
  maxSize?: number; // en MB
  endpoint: string;
  label?: string;
  currentUrl?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  accept = 'image/*',
  maxSize = 5,
  endpoint,
  label = 'Choisir un fichier',
  currentUrl,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: `La taille maximale est de ${maxSize}MB`,
        variant: 'destructive',
      });
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFileName(file.name);

    // Upload
    setUploading(true);
    try {
  const formData = new FormData();
  // Use the endpoint last segment as the field name (e.g. 'image' or 'logo')
  const parts = endpoint.split('/');
  const fieldName = parts[parts.length - 1] || 'file';
  formData.append(fieldName, file);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(apiUrl(`/${endpoint}`), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'upload');
      }

      const result = await response.json();

      toast({
        title: 'Succès',
        description: 'Fichier uploadé avec succès',
      });

      onUploadSuccess(resolveUploadUrl(result.url));
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
      setPreview(null);
      setFileName('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadSuccess('');
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">{label}</p>
          <p className="text-xs text-muted-foreground">
            {accept.includes('image') ? 'PNG, JPG, GIF, SVG, WebP' : 'Fichiers acceptés'}  (max {maxSize}MB)
          </p>
        </div>
      ) : (
        <div className="relative border rounded-lg p-4">
          {preview.startsWith('data:') || preview.includes('http') ? (
            <div className="flex items-center gap-4">
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{fileName || 'Image uploadée'}</p>
                {uploading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Upload en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                    <Check className="w-4 h-4" />
                    Uploadé avec succès
                  </div>
                )}
              </div>
              {!uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : null}
        </div>
      )}

      {!preview && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Upload en cours...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {label}
            </>
          )}
        </Button>
      )}
    </div>
  );
};
