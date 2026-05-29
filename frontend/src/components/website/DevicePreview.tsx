import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  RotateCw,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Device {
  id: string;
  name: string;
  icon: React.ElementType;
  width: number;
  height: number;
  category: 'desktop' | 'tablet' | 'mobile';
}

const devices: Device[] = [
  // Desktop
  { id: 'desktop-1920', name: 'Desktop HD', icon: Monitor, width: 1920, height: 1080, category: 'desktop' },
  { id: 'desktop-1366', name: 'Desktop Laptop', icon: Monitor, width: 1366, height: 768, category: 'desktop' },
  
  // Tablet
  { id: 'ipad-pro', name: 'iPad Pro', icon: Tablet, width: 1024, height: 1366, category: 'tablet' },
  { id: 'ipad', name: 'iPad', icon: Tablet, width: 768, height: 1024, category: 'tablet' },
  { id: 'tablet-landscape', name: 'Tablet Paysage', icon: Tablet, width: 1024, height: 768, category: 'tablet' },
  
  // Mobile
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', icon: Smartphone, width: 393, height: 852, category: 'mobile' },
  { id: 'iphone-se', name: 'iPhone SE', icon: Smartphone, width: 375, height: 667, category: 'mobile' },
  { id: 'pixel-7', name: 'Google Pixel 7', icon: Smartphone, width: 412, height: 915, category: 'mobile' },
  { id: 'samsung-s23', name: 'Samsung S23', icon: Smartphone, width: 360, height: 780, category: 'mobile' },
];

interface DevicePreviewProps {
  html: string;
  css: string;
  websiteSlug?: string;
  pageSlug?: string;
}

const DevicePreview: React.FC<DevicePreviewProps> = ({ html, css, websiteSlug, pageSlug }) => {
  const [selectedDevice, setSelectedDevice] = useState<Device>(devices[0]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [scale, setScale] = useState(1);
  const [showRuler, setShowRuler] = useState(false);

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const toggleOrientation = () => {
    setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait');
  };

  const getFrameSize = () => {
    if (orientation === 'landscape') {
      return { width: selectedDevice.height, height: selectedDevice.width };
    }
    return { width: selectedDevice.width, height: selectedDevice.height };
  };

  const frameSize = getFrameSize();
  const Icon = selectedDevice.icon;

  const previewContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        ${css}
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Toolbar */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select
              value={selectedDevice.id}
              onValueChange={(id) => {
                const device = devices.find(d => d.id === id);
                if (device) setSelectedDevice(device);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Desktop
                </div>
                {devices.filter(d => d.category === 'desktop').map(device => (
                  <SelectItem key={device.id} value={device.id}>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      {device.name}
                    </div>
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                  Tablette
                </div>
                {devices.filter(d => d.category === 'tablet').map(device => (
                  <SelectItem key={device.id} value={device.id}>
                    <div className="flex items-center gap-2">
                      <Tablet className="w-4 h-4" />
                      {device.name}
                    </div>
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                  Mobile
                </div>
                {devices.filter(d => d.category === 'mobile').map(device => (
                  <SelectItem key={device.id} value={device.id}>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      {device.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="secondary">
              {frameSize.width} × {frameSize.height}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleOrientation}
              disabled={selectedDevice.category === 'desktop'}
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Rotation
            </Button>

            <Select value={scale.toString()} onValueChange={(v) => setScale(parseFloat(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">50%</SelectItem>
                <SelectItem value="0.75">75%</SelectItem>
                <SelectItem value="1">100%</SelectItem>
                <SelectItem value="1.25">125%</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>

            {websiteSlug && pageSlug && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/store/${websiteSlug}${pageSlug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ouvrir
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
        <div
          className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{
            width: frameSize.width * scale,
            height: frameSize.height * scale,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Device Frame Decoration */}
          {selectedDevice.category === 'mobile' && (
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900 rounded-t-lg flex items-center justify-center">
              <div className="w-16 h-1 bg-gray-700 rounded-full" />
            </div>
          )}

          {/* Preview Content */}
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border-0"
            style={{
              marginTop: selectedDevice.category === 'mobile' ? '32px' : 0,
              height: selectedDevice.category === 'mobile' ? 'calc(100% - 32px)' : '100%',
            }}
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />

          {/* Ruler Overlay */}
          {showRuler && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px bg-red-500" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-red-500" />
              <div className="absolute top-0 bottom-0 left-0 w-px bg-red-500" />
              <div className="absolute top-0 bottom-0 right-0 w-px bg-red-500" />
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-card border-t px-4 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Appareil: {selectedDevice.name}</span>
            <span>Orientation: {orientation === 'portrait' ? 'Portrait' : 'Paysage'}</span>
            <span>Zoom: {(scale * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span>{selectedDevice.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicePreview;
