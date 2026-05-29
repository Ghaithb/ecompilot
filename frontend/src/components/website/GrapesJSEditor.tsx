import React, { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsPluginForms from 'grapesjs-plugin-forms';

interface GrapesJSEditorProps {
  initialContent?: any;
  onSave?: (data: { html: string; css: string; content: any }) => void;
  onContentChange?: (data: { html: string; css: string; content: any }) => void;
}

const GrapesJSEditor: React.FC<GrapesJSEditorProps> = ({
  initialContent,
  onSave,
  onContentChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (!editorRef.current || editorInstanceRef.current) return;

    // Initialiser GrapesJS
    const editor = grapesjs.init({
      container: editorRef.current,
      height: 'calc(100vh - 200px)',
      width: 'auto',
      storageManager: false, // Désactiver le stockage local
      
      // Plugins
      plugins: [
        gjsPresetWebpage,
        gjsBlocksBasic,
        gjsPluginForms,
      ],
      
      pluginsOpts: {
        'gjs-preset-webpage': {
          blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video'],
          modalImportTitle: 'Importer',
          modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Collez ici votre code HTML/CSS</div>',
          modalImportContent: (editor: Editor) => {
            return editor.getHtml() + '<style>' + editor.getCss() + '</style>';
          },
        },
      },

      // Canvas
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
          'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
        ],
        scripts: [],
      },

      // Panels
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: '<i class="fa fa-clone"></i>',
                command: 'sw-visibility',
              },
              {
                id: 'export',
                className: 'btn-open-export',
                label: '<i class="fa fa-code"></i>',
                command: 'export-template',
                context: 'export-template',
              },
              {
                id: 'show-json',
                className: 'btn-show-json',
                label: '<i class="fa fa-file-code-o"></i>',
                context: 'show-json',
                command(editor: Editor) {
                  editor.Modal.setTitle('Composants JSON')
                    .setContent(`<textarea style="width:100%; height: 250px;">
                      ${JSON.stringify(editor.getComponents())}
                    </textarea>`)
                    .open();
                },
              },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: '<i class="fa fa-desktop"></i>',
                command: 'set-device-desktop',
                active: true,
                togglable: false,
              },
              {
                id: 'device-tablet',
                label: '<i class="fa fa-tablet"></i>',
                command: 'set-device-tablet',
                togglable: false,
              },
              {
                id: 'device-mobile',
                label: '<i class="fa fa-mobile"></i>',
                command: 'set-device-mobile',
                togglable: false,
              },
            ],
          },
        ],
      },

      // Device Manager
      deviceManager: {
        devices: [
          {
            name: 'Desktop',
            width: '',
          },
          {
            name: 'Tablet',
            width: '768px',
            widthMedia: '992px',
          },
          {
            name: 'Mobile',
            width: '320px',
            widthMedia: '480px',
          },
        ],
      },

      // Block Manager
      blockManager: {
        appendTo: '.blocks-container',
      },

      // Style Manager
      styleManager: {
        appendTo: '.styles-container',
        sectors: [
          {
            name: 'Général',
            open: false,
            buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
          },
          {
            name: 'Dimension',
            open: false,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
          },
          {
            name: 'Typographie',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
          },
          {
            name: 'Décorations',
            open: false,
            buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background'],
          },
        ],
      },

      // Layer Manager
      layerManager: {
        appendTo: '.layers-container',
      },

      // Trait Manager
      traitManager: {
        appendTo: '.traits-container',
      },
    });

    // Charger le contenu initial
    if (initialContent) {
      try {
        if (typeof initialContent === 'string') {
          editor.setComponents(initialContent);
        } else if (initialContent.html) {
          // Charger le HTML
          editor.setComponents(initialContent.html);
          
          // Charger le CSS avec un délai pour s'assurer que le canvas est prêt
          setTimeout(() => {
            if (initialContent.css) {
              try {
                // Vérifier que l'éditeur et le style manager sont prêts
                if (editor && editor.setStyle && typeof editor.setStyle === 'function') {
                  editor.setStyle(initialContent.css);
                }
              } catch (error) {
                console.warn('Erreur lors du chargement du CSS:', error);
              }
              
              // Forcer le rafraîchissement du canvas
              const canvas = editor.Canvas.getBody();
              if (canvas) {
                canvas.style.opacity = '0.99';
                setTimeout(() => {
                  canvas.style.opacity = '1';
                }, 10);
              }
            }

            // Nettoyer les attributs invalides (@click, @, v-, :, etc.)
            cleanInvalidAttributes(editor);
          }, 100);
        } else {
          editor.loadProjectData(initialContent);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
      }
    }

    // Fonction pour nettoyer les attributs invalides (Vue.js, Alpine.js, etc.)
    const cleanInvalidAttributes = (editor: Editor) => {
      try {
        const wrapper = editor.getWrapper();
        if (wrapper) {
          const allComponents = wrapper.find('*');
          allComponents.forEach((component: any) => {
            const attrs = component.getAttributes();
            const invalidAttrs = Object.keys(attrs).filter(attr => 
              attr.startsWith('@') || attr.startsWith(':') || attr.startsWith('v-') || attr.startsWith('x-')
            );
            
            if (invalidAttrs.length > 0) {
              console.warn('🧹 Nettoyage des attributs invalides:', invalidAttrs);
              invalidAttrs.forEach(attr => {
                try {
                  component.removeAttributes(attr);
                } catch (e) {
                  console.warn(`Impossible de supprimer l'attribut ${attr}:`, e);
                }
              });
            }
          });
        }
      } catch (error) {
        console.warn('Erreur lors du nettoyage des attributs:', error);
      }
    };

    // Commandes personnalisées
    editor.Commands.add('set-device-desktop', {
      run: (editor) => editor.setDevice('Desktop'),
    });
    editor.Commands.add('set-device-tablet', {
      run: (editor) => editor.setDevice('Tablet'),
    });
    editor.Commands.add('set-device-mobile', {
      run: (editor) => editor.setDevice('Mobile'),
    });

    // Écouter les changements
    editor.on('change:changesCount', () => {
      if (onContentChange) {
        const html = editor.getHtml();
        const css = editor.getCss();
        const content = editor.getProjectData();
        
        onContentChange({ html, css, content });
      }
    });

    // Nettoyer les attributs invalides lors de l'ajout de composants
    editor.on('component:add', () => {
      setTimeout(() => cleanInvalidAttributes(editor), 50);
    });

    // Nettoyer lors de la mise à jour d'attributs
    editor.on('component:update', (component: any) => {
      try {
        const attrs = component.getAttributes();
        const invalidAttrs = Object.keys(attrs).filter(attr => 
          attr.startsWith('@') || attr.startsWith(':') || attr.startsWith('v-') || attr.startsWith('x-')
        );
        
        if (invalidAttrs.length > 0) {
          invalidAttrs.forEach(attr => {
            try {
              component.removeAttributes(attr);
            } catch (e) {
              // Ignore
            }
          });
        }
      } catch (error) {
        // Ignore
      }
    });

    editorInstanceRef.current = editor;

    // Raccourci Ctrl+S pour sauvegarder
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, []);

  // Fonction de sauvegarde
  const handleSave = () => {
    if (editorInstanceRef.current && onSave) {
      const editor = editorInstanceRef.current;
      const html = editor.getHtml();
      const css = editor.getCss();
      const content = editor.getProjectData();
      
      onSave({ html, css, content });
    }
  };

  return (
    <div className="grapesjs-editor-wrapper">
      {/* Toolbar */}
      <div className="editor-toolbar flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-4">
          <div className="panel__devices"></div>
          <div className="panel__basic-actions"></div>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
          title="Sauvegarder les modifications (Ctrl+S)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Sauvegarder
        </button>
      </div>

      {/* Editor Layout */}
      <div className="editor-layout flex h-full">
        {/* Sidebar Left - Blocks & Layers */}
        <div className="editor-sidebar-left w-64 bg-card border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-2">Blocs</h3>
            <div className="blocks-container"></div>
          </div>
          <div className="p-4 border-t">
            <h3 className="font-semibold mb-2">Calques</h3>
            <div className="layers-container"></div>
          </div>
        </div>

        {/* Canvas */}
        <div className="editor-canvas flex-1">
          <div ref={editorRef}></div>
        </div>

        {/* Sidebar Right - Styles & Traits */}
        <div className="editor-sidebar-right w-64 bg-card border-l overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-2">Styles</h3>
            <div className="styles-container"></div>
          </div>
          <div className="p-4 border-t">
            <h3 className="font-semibold mb-2">Propriétés</h3>
            <div className="traits-container"></div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .grapesjs-editor-wrapper {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }

        .editor-toolbar {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .editor-layout {
          flex: 1;
          overflow: hidden;
        }

        .editor-sidebar-left,
        .editor-sidebar-right {
          background: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }

        .editor-canvas {
          background: #e9ecef;
          padding: 20px;
        }

        .gjs-one-bg {
          background-color: #ffffff;
        }

        .gjs-two-color {
          color: #333333;
        }

        .gjs-three-bg {
          background-color: #f8f9fa;
          color: #333333;
        }

        .gjs-four-color,
        .gjs-four-color-h:hover {
          color: #3b82f6;
        }

        .gjs-block {
          min-height: 60px;
          padding: 12px;
          margin: 8px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          color: white;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .gjs-block:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
        }

        .gjs-block__media {
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .gjs-block-label {
          font-size: 13px;
          text-align: center;
          font-weight: 500;
        }

        .gjs-frame {
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          background: white;
        }

        .gjs-cv-canvas {
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        .gjs-pn-panel {
          border-radius: 6px;
        }

        .gjs-pn-btn {
          padding: 8px 12px;
          margin: 2px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .gjs-pn-btn:hover {
          background: #e9ecef !important;
          transform: scale(1.05);
        }

        .gjs-pn-active {
          background: #3b82f6 !important;
          color: white !important;
        }

        /* Améliorer les inputs */
        .gjs-field,
        .gjs-input {
          border-radius: 6px;
          border: 2px solid #e9ecef;
          padding: 8px 12px;
          transition: border-color 0.2s;
        }

        .gjs-field:focus,
        .gjs-input:focus {
          border-color: #3b82f6;
          outline: none;
        }

        /* Améliorer les boutons du style manager */
        .gjs-sm-sector {
          border-radius: 8px;
          margin-bottom: 10px;
          overflow: hidden;
        }

        .gjs-sm-sector-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
          padding: 12px;
          border-radius: 6px 6px 0 0;
        }

        /* Scrollbar personnalisée */
        .editor-sidebar-left::-webkit-scrollbar,
        .editor-sidebar-right::-webkit-scrollbar {
          width: 8px;
        }

        .editor-sidebar-left::-webkit-scrollbar-track,
        .editor-sidebar-right::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .editor-sidebar-left::-webkit-scrollbar-thumb,
        .editor-sidebar-right::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .editor-sidebar-left::-webkit-scrollbar-thumb:hover,
        .editor-sidebar-right::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default GrapesJSEditor;
