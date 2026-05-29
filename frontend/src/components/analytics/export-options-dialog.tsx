import * as React from "react";
import { DialogTitle, DialogDescription } from "@/components/ui";
import { Label } from "@/components/ui";
import { Switch } from "@/components/ui";
import { Button } from "@/components/ui";

export interface ExportOptionsDialogProps {
  onExport: (options: ExportOptions) => void;
  onClose: () => void;
}

export interface ExportOptions {
  includeKpis: boolean;
  includeSalesChart: boolean;
  includeTopProducts: boolean;
  includeInventory: boolean;
  includeAiRecommendations: boolean;
  includeAnomalies: boolean;
  format: 'pdf' | 'csv';
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function ExportOptionsDialog({ onExport, onClose }: ExportOptionsDialogProps) {
  const [options, setOptions] = React.useState<ExportOptions>({
    includeKpis: true,
    includeSalesChart: true,
    includeTopProducts: true,
    includeInventory: true,
    includeAiRecommendations: true,
    includeAnomalies: true,
    format: 'pdf',
    dateRange: {
      from: new Date(),
      to: new Date()
    }
  });

  const handleToggleOption = (key: keyof ExportOptions, value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-4" role="dialog" aria-labelledby="export-dialog-title">
      <div>
        <DialogTitle id="export-dialog-title">Personnaliser l'export</DialogTitle>
        <DialogDescription>
          Sélectionnez les éléments à inclure dans votre rapport
        </DialogDescription>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="kpis" className="flex items-center space-x-2">
            <span>KPIs principaux</span>
          </Label>
          <Switch
            id="kpis"
            checked={options.includeKpis}
            onCheckedChange={(checked: boolean) => handleToggleOption('includeKpis', checked)}
            aria-label="Inclure les KPIs principaux"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="sales-chart" className="flex items-center space-x-2">
            <span>Graphique des ventes</span>
          </Label>
          <Switch
            id="sales-chart"
            checked={options.includeSalesChart}
            onCheckedChange={(checked) => handleToggleOption('includeSalesChart', checked)}
            aria-label="Inclure le graphique des ventes"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="top-products" className="flex items-center space-x-2">
            <span>Top produits</span>
          </Label>
          <Switch
            id="top-products"
            checked={options.includeTopProducts}
            onCheckedChange={(checked) => handleToggleOption('includeTopProducts', checked)}
            aria-label="Inclure les top produits"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="inventory" className="flex items-center space-x-2">
            <span>État des stocks</span>
          </Label>
          <Switch
            id="inventory"
            checked={options.includeInventory}
            onCheckedChange={(checked) => handleToggleOption('includeInventory', checked)}
            aria-label="Inclure l'état des stocks"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="ai-recommendations" className="flex items-center space-x-2">
            <span>Recommandations IA</span>
          </Label>
          <Switch
            id="ai-recommendations"
            checked={options.includeAiRecommendations}
            onCheckedChange={(checked) => handleToggleOption('includeAiRecommendations', checked)}
            aria-label="Inclure les recommandations IA"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="anomalies" className="flex items-center space-x-2">
            <span>Anomalies détectées</span>
          </Label>
          <Switch
            id="anomalies"
            checked={options.includeAnomalies}
            onCheckedChange={(checked) => handleToggleOption('includeAnomalies', checked)}
            aria-label="Inclure les anomalies détectées"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="w-24"
          aria-label="Annuler l'export"
        >
          Annuler
        </Button>
        <Button
          onClick={() => onExport(options)}
          className="w-24"
          aria-label="Générer le rapport"
        >
          Exporter
        </Button>
      </div>
    </div>
  );
}