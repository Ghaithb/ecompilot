import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';

interface MultiImageUploadProps {
  onUploadSuccess: (urls: string[]) => void;
  maxImages?: number;
  maxSize?: number; // en MB
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  onUploadSuccess,
  maxImages = 10,
  maxSize = 5,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; name: string }>>([]);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: 'Trop d\'images',
        description: `Maximum ${maxImages} images`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        if (file.size > maxSize * 1024 * 1024) {
          toast({
            title: `${file.name} trop volumineux`,
            description: `Max ${maxSize}MB`,
            variant: 'destructive',
          });
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:3001/api/v1/upload/image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedUrls.push(`http://localhost:3001${result.url}`);
        }
      }

      const newImages = uploadedUrls.map((url, i) => ({
        url,
        name: files[i].name,
      }));

      setImages([...images, ...newImages]);
      onUploadSuccess([...images.map(img => img.url), ...uploadedUrls]);

      toast({
        title: 'Succès',
        description: `${uploadedUrls.length} image(s) uploadée(s)`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUploadSuccess(newImages.map(img => img.url));
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        className="hidden"
        disabled={uploading || images.length >= maxImages}
      />

      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Cliquez pour uploader des images</p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF, WebP (max {maxSize}MB) - Max {maxImages} images
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {images.length < maxImages && (
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
                  Ajouter des images ({images.length}/{maxImages})
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
