import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Folder,
  Upload,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  Eye,
  Copy,
} from 'lucide-react';

const MediaGalleryPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  const folders = [
    { id: 'all', name: 'Tous les médias', count: 847, icon: Folder },
    { id: 'products', name: 'Images produits', count: 432, icon: ImageIcon },
    { id: 'marketing', name: 'Marketing', count: 156, icon: FileText },
    { id: 'videos', name: 'Vidéos', count: 45, icon: Video },
    { id: 'logos', name: 'Logos & Branding', count: 23, icon: Folder },
  ];

  const mediaFiles = [
    {
      id: 1,
      name: 'product-hero-1.jpg',
      type: 'image',
      size: '2.4 MB',
      dimensions: '1920x1080',
      uploadDate: '2024-11-20',
      folder: 'products',
      url: '/placeholder.jpg',
    },
    {
      id: 2,
      name: 'promo-banner.jpg',
      type: 'image',
      size: '1.8 MB',
      dimensions: '1200x600',
      uploadDate: '2024-11-19',
      folder: 'marketing',
      url: '/placeholder.jpg',
    },
    {
      id: 3,
      name: 'demo-video.mp4',
      type: 'video',
      size: '15.6 MB',
      dimensions: '1920x1080',
      uploadDate: '2024-11-18',
      folder: 'videos',
      url: '/placeholder.mp4',
    },
    {
      id: 4,
      name: 'logo-primary.svg',
      type: 'image',
      size: '24 KB',
      dimensions: '512x512',
      uploadDate: '2024-11-17',
      folder: 'logos',
      url: '/placeholder.svg',
    },
    {
      id: 5,
      name: 'product-detail-2.jpg',
      type: 'image',
      size: '1.2 MB',
      dimensions: '1200x800',
      uploadDate: '2024-11-16',
      folder: 'products',
      url: '/placeholder.jpg',
    },
    {
      id: 6,
      name: 'social-media-post.jpg',
      type: 'image',
      size: '890 KB',
      dimensions: '1080x1080',
      uploadDate: '2024-11-15',
      folder: 'marketing',
      url: '/placeholder.jpg',
    },
  ];

  const getFileIcon = (type: string) => {
    if (type === 'video') return Video;
    return ImageIcon;
  };

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-primary" />
            Galerie de médias
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez toutes vos images et vidéos
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Uploader des fichiers
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total fichiers</p>
                <p className="text-2xl font-bold">847</p>
              </div>
              <Folder className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Images</p>
                <p className="text-2xl font-bold">611</p>
              </div>
              <ImageIcon className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vidéos</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <Video className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Espace utilisé</p>
                <p className="text-2xl font-bold">4.2 GB</p>
              </div>
              <Folder className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Folders */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Dossiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {folders.map((folder) => {
                  const Icon = folder.icon;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        selectedFolder === folder.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{folder.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {folder.count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher des fichiers..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Grid/List */}
          <Card>
            <CardContent className="pt-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mediaFiles.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div
                        key={file.id}
                        className="group relative aspect-square border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <FileIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <Button size="sm" variant="secondary">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                          <p className="text-white text-xs font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-white text-xs opacity-75">
                            {file.size}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {mediaFiles.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileIcon className="w-5 h-5 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-gray-600">
                              {file.dimensions} • {file.size}
                            </p>
                          </div>
                          <Badge variant="secondary">{file.folder}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MediaGalleryPage;
