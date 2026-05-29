import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import GrapesJSEditor from '@/components/website/GrapesJSEditor';
import TemplateLibrary from '@/components/website/TemplateLibrary';
import SectionsLibrary from '@/components/website/SectionsLibrary';
import ProductsIntegration from '@/components/website/ProductsIntegration';
import VersionHistory from '@/components/website/VersionHistory';
import SEOOptimizer from '@/components/website/SEOOptimizer';
import ABTesting from '@/components/website/ABTesting';
import DevicePreview from '@/components/website/DevicePreview';

import {
  ArrowLeft,
  Save,
  Eye,
  History,
  Search,
  Package,
  Layout,
  FlaskConical,
  Monitor,
  Sparkles,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';

const WebsiteBuilderPagePro: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editorData, setEditorData] = useState<any>(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activePanel, setActivePanel] = useState<'sections' | 'products' | 'seo' | 'versions' | 'ab-test' | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(!pageId);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  useEffect(() => {
    if (pageId) {
      fetchPage();
    } else {
      setLoading(false);
    }
  }, [pageId]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/website/pages/${pageId}`);
      setPage(data);
      // Support des deux formats: content.html ou html direct
      const htmlContent = data.content?.html || data.html || '';
      setEditorData(htmlContent);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: { html: string; css: string; content: any }) => {
    setSaving(true);
    try {
      const payload = {
        ...page,
        content: data.content,
        html: data.html,
        css: data.css,
      };
      const { data: savedPage } = pageId
        ? await api.put(`/website/pages/${pageId}`, payload)
        : await api.post(`/website/pages`, payload);
      setPage(savedPage);
      setHasChanges(false);

      toast({
        title: 'Succès',
        description: 'Page sauvegardée avec succès',
      });

      if (!pageId) {
        navigate(`/website/builder/${savedPage._id}`);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (data: { html: string; css: string; content: any }) => {
    setEditorData(data);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Formulaire de création
  if (showCreateForm && !pageId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Créer une Nouvelle Page</h1>
            <p className="text-muted-foreground mt-2">
              Choisissez comment démarrer votre nouvelle page
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowTemplateLibrary(true)}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layout className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Templates Professionnels</h3>
                <p className="text-muted-foreground">
                  Démarrez avec un template pré-conçu et personnalisez-le
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
              setPage({ name: 'Nouvelle Page', slug: '/nouvelle-page' });
              setShowCreateForm(false);
            }}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Page Vierge</h3>
                <p className="text-muted-foreground">
                  Commencez from scratch et créez votre design unique
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => navigate('/website/pages')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>

        {showTemplateLibrary && (
          <TemplateLibrary
            onSelectTemplate={(template) => {
              setPage({
                name: template.name,
                slug: `/${template.name.toLowerCase().replace(/\s+/g, '-')}`,
                content: template.content,
              });
              setEditorData(template.content);
              setShowTemplateLibrary(false);
              setShowCreateForm(false);
            }}
            onClose={() => setShowTemplateLibrary(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header avec outils professionnels */}
      <div className="bg-card border-b">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/website/pages')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-semibold">{page?.name || 'Nouvelle Page'}</h1>
                <p className="text-xs text-muted-foreground">{page?.slug}</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {hasChanges && (
                <span className="text-sm text-orange-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  Non sauvegardé
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Prévisualiser
              </Button>

              <Button
                size="sm"
                onClick={() => editorData && handleSave(editorData)}
                disabled={saving || !hasChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tools Bar */}
        <div className="px-6 py-2 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant={activePanel === 'sections' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActivePanel(activePanel === 'sections' ? null : 'sections')}
            >
              <Layout className="w-4 h-4 mr-2" />
              Sections
            </Button>

            <Button
              variant={activePanel === 'products' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActivePanel(activePanel === 'products' ? null : 'products')}
            >
              <Package className="w-4 h-4 mr-2" />
              Produits
            </Button>

            <Button
              variant={activePanel === 'seo' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActivePanel(activePanel === 'seo' ? null : 'seo')}
            >
              <Search className="w-4 h-4 mr-2" />
              SEO
            </Button>

            <Button
              variant={activePanel === 'versions' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActivePanel(activePanel === 'versions' ? null : 'versions')}
            >
              <History className="w-4 h-4 mr-2" />
              Versions
            </Button>

            <Button
              variant={activePanel === 'ab-test' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActivePanel(activePanel === 'ab-test' ? null : 'ab-test')}
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              A/B Testing
            </Button>

            <div className="flex-1" />

            <Button variant="outline" size="sm" onClick={() => setShowTemplateLibrary(true)}>
              <Layout className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Side Panel */}
        {activePanel && (
          <div className="w-96 border-r bg-card overflow-y-auto">
            <div className="p-4">
              {activePanel === 'sections' && (
                <SectionsLibrary
                  onSelectSection={(section) => {
                    // Logique d'insertion de section
                    toast({
                      title: 'Section ajoutée',
                      description: `${section.name} a été ajouté à la page`,
                    });
                  }}
                />
              )}

              {activePanel === 'products' && pageId && (
                <ProductsIntegration
                  onInsertProducts={(config) => {
                    toast({
                      title: 'Produits insérés',
                      description: `${config.products.length} produits ajoutés`,
                    });
                  }}
                />
              )}

              {activePanel === 'seo' && (
                <SEOOptimizer
                  data={page?.seo || { title: '', description: '', keywords: [] }}
                  onChange={(seoData) => {
                    setPage({ ...page, seo: seoData });
                    setHasChanges(true);
                  }}
                  pageContent={editorData?.html}
                />
              )}

              {activePanel === 'versions' && pageId && (
                <VersionHistory
                  pageId={pageId}
                  onRestore={(versionData) => {
                    setEditorData(versionData);
                    toast({
                      title: 'Version restaurée',
                      description: 'La version a été restaurée avec succès',
                    });
                  }}
                />
              )}

              {activePanel === 'ab-test' && pageId && (
                <ABTesting
                  pageId={pageId}
                  currentContent={editorData}
                  onCreateTest={(testData) => {
                    toast({
                      title: 'Test créé',
                      description: `Test A/B "${testData.name}" créé avec succès`,
                    });
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1">
          <GrapesJSEditor
            initialContent={editorData}
            onSave={handleSave}
            onContentChange={handleContentChange}
          />
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Prévisualisation Multi-Devices</DialogTitle>
            <DialogDescription>
              Visualisez votre page sur différents appareils
            </DialogDescription>
          </DialogHeader>
          <div className="h-[80vh]">
            <DevicePreview
              html={editorData?.html || ''}
              css={editorData?.css || ''}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Library */}
      {showTemplateLibrary && (
        <TemplateLibrary
          onSelectTemplate={(template) => {
            setEditorData(template.content);
            setShowTemplateLibrary(false);
            toast({
              title: 'Template appliqué',
              description: `Template "${template.name}" appliqué avec succès`,
            });
          }}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}
    </div>
  );
};

export default WebsiteBuilderPagePro;
