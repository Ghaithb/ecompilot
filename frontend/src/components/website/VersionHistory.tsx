import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  History,
  RotateCcw,
  Clock,
  User,
  MessageSquare,
  Tag,
  GitBranch,
} from 'lucide-react';
import { apiUrl, getAuthHeaders, resolveUploadUrl } from '@/lib/apiConfig';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Version {
  _id: string;
  version: number;
  label: string;
  comment: string;
  createdBy: string;
  createdAt: string;
  isAutoSave: boolean;
}

interface VersionHistoryProps {
  pageId: string;
  onRestore: (versionData: { content: any; html: string; css: string }) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ pageId, onRestore }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAutoSaves, setShowAutoSaves] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pageId) {
      fetchVersions();
    }
  }, [pageId, showAutoSaves]);

  const fetchVersions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = apiUrl(`/website/pages/${pageId}/versions${showAutoSaves ? '?includeAutoSave=true' : ''}`);
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      }
    } catch (error) {
      console.error('Erreur chargement versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (version: Version) => {
    setSelectedVersion(version);
    setRestoreDialogOpen(true);
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        apiUrl(`/website/pages/versions/${selectedVersion._id}/restore`),
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) throw new Error('Erreur restauration');

      const versionData = await response.json();
      onRestore(versionData);

      toast({
        title: 'Succès',
        description: `Version ${selectedVersion.version} restaurée`,
      });

      setRestoreDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historique des Versions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAutoSaves(!showAutoSaves)}
            >
              {showAutoSaves ? 'Masquer auto-sauvegardes' : 'Afficher auto-sauvegardes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune version sauvegardée
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <Card key={version._id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={index === 0 ? 'default' : 'secondary'}>
                              <GitBranch className="w-3 h-3 mr-1" />
                              v{version.version}
                            </Badge>
                            {version.isAutoSave && (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                            {index === 0 && (
                              <Badge className="bg-green-500 text-xs">
                                Actuelle
                              </Badge>
                            )}
                          </div>

                          {/* Label */}
                          {version.label && (
                            <div className="flex items-center gap-2 mb-1">
                              <Tag className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium text-sm">{version.label}</span>
                            </div>
                          )}

                          {/* Comment */}
                          {version.comment && (
                            <div className="flex items-start gap-2 mb-2">
                              <MessageSquare className="w-3 h-3 text-muted-foreground mt-1" />
                              <p className="text-sm text-muted-foreground">
                                {version.comment}
                              </p>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(version.createdAt)}
                            </div>
                            {version.createdBy && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {version.createdBy}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {index !== 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreClick(version)}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restaurer
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurer cette version ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez restaurer la version {selectedVersion?.version}.
              {selectedVersion?.label && ` (${selectedVersion.label})`}
              <br /><br />
              <strong>Attention :</strong> Les modifications non sauvegardées seront perdues.
              Une nouvelle version sera automatiquement créée avec l'état actuel avant la restauration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              Confirmer la Restauration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VersionHistory;
