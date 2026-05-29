import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Package, DollarSign, Truck, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CalculatorInputs {
  // Costs
  productCost: number;
  shippingCost: number;
  returnCost: number;
  processingCost: number;
  leadCost: number;
  
  // Revenue
  sellingPrice: number;
  totalLeads: number;
  
  // Rates
  confirmationRate: number; // %
  deliveryRate: number; // %
}

interface CalculatorResults {
  confirmedLeads: number;
  deliveredLeads: number;
  profitPerUnit: number;
  totalProfit: number;
  breakEvenLeadCost: number;
}

const CalculatorPage = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    productCost: 15,
    shippingCost: 7,
    returnCost: 1,
    processingCost: 0,
    leadCost: 2.5,
    sellingPrice: 40,
    totalLeads: 100,
    confirmationRate: 75,
    deliveryRate: 80,
  });

  const [results, setResults] = useState<CalculatorResults>({
    confirmedLeads: 0,
    deliveredLeads: 0,
    profitPerUnit: 0,
    totalProfit: 0,
    breakEvenLeadCost: 0,
  });

  const calculate = () => {
    const confirmed = inputs.totalLeads * (inputs.confirmationRate / 100);
    const delivered = confirmed * (inputs.deliveryRate / 100);
    
    const totalCostPerUnit = inputs.productCost + inputs.shippingCost + inputs.processingCost;
    const profit = inputs.sellingPrice - totalCostPerUnit;
    const totalProfit = delivered * profit - (inputs.totalLeads * inputs.leadCost) - (confirmed - delivered) * inputs.returnCost;
    
    const breakEven = profit / (inputs.confirmationRate / 100 * inputs.deliveryRate / 100);

    setResults({
      confirmedLeads: confirmed,
      deliveredLeads: delivered,
      profitPerUnit: profit,
      totalProfit: totalProfit,
      breakEvenLeadCost: breakEven,
    });
  };

  useEffect(() => {
    calculate();
  }, [inputs]);

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    setInputs({
      ...inputs,
      [field]: parseFloat(value) || 0,
    });
  };

  const currencyFormat = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="calculator-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calculateur de Profit COD</h1>
          <p className="page-subtitle">
            Calculez vos marges et optimisez votre business e-commerce
          </p>
        </div>
      </div>

      {/* Input Grid */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Paramètres de calcul</CardTitle>
          <CardDescription>
            Entrez vos coûts et paramètres pour calculer votre rentabilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Costs */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="shippingCost">Coût de livraison</Label>
                <div className="relative">
                  <Input
                    id="shippingCost"
                    type="number"
                    step="0.1"
                    value={inputs.shippingCost}
                    onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">TND</span>
                </div>
              </div>

              <div>
                <Label htmlFor="returnCost">Coût de retour</Label>
                <div className="relative">
                  <Input
                    id="returnCost"
                    type="number"
                    step="0.1"
                    value={inputs.returnCost}
                    onChange={(e) => handleInputChange('returnCost', e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">TND</span>
                </div>
              </div>

              <div>
                <Label htmlFor="processingCost">Coût de traitement</Label>
                <div className="relative">
                  <Input
                    id="processingCost"
                    type="number"
                    step="0.1"
                    value={inputs.processingCost}
                    onChange={(e) => handleInputChange('processingCost', e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">TND</span>
                </div>
              </div>
            </div>

            {/* Column 2: Product & Lead */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="productCost">Coût du produit</Label>
                <div className="relative">
                  <Input
                    id="productCost"
                    type="number"
                    step="0.1"
                    value={inputs.productCost}
                    onChange={(e) => handleInputChange('productCost', e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">TND</span>
                </div>
              </div>

              <div>
                <Label htmlFor="leadCost">Coût du lead</Label>
                <div className="relative">
                  <Input
                    id="leadCost"
                    type="number"
                    step="0.1"
                    value={inputs.leadCost}
                    onChange={(e) => handleInputChange('leadCost', e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">TND</span>
                </div>
              </div>

              <div>
                <Label htmlFor="totalLeads">Total nets reçus</Label>
                <Input
                  id="totalLeads"
                  type="number"
                  value={inputs.totalLeads}
                  onChange={(e) => handleInputChange('totalLeads', e.target.value)}
                />
              </div>
            </div>

            {/* Column 3: Revenue & Rates */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="sellingPrice">Prix de vente</Label>
                <div className="relative">
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.1"
                    value={inputs.sellingPrice}
                    onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">TND</span>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmationRate">Taux de confirmation</Label>
                <div className="relative">
                  <Input
                    id="confirmationRate"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={inputs.confirmationRate}
                    onChange={(e) => handleInputChange('confirmationRate', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">%</span>
                </div>
              </div>

              <div>
                <Label htmlFor="deliveryRate">Taux de livraison</Label>
                <div className="relative">
                  <Input
                    id="deliveryRate"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={inputs.deliveryRate}
                    onChange={(e) => handleInputChange('deliveryRate', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button size="lg" onClick={calculate} className="px-8">
              <Calculator className="mr-2" size={20} />
              Calculer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <Target className="text-purple-600" size={24} />
              </div>
              <div className="text-sm text-gray-600 mb-1">Leads confirmés</div>
              <div className="text-2xl font-bold text-purple-600">
                {currencyFormat(results.confirmedLeads)}
              </div>
              <div className="text-xs text-gray-500 mt-1">leads</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Package className="text-blue-600" size={24} />
              </div>
              <div className="text-sm text-gray-600 mb-1">Leads livrés</div>
              <div className="text-2xl font-bold text-blue-600">
                {currencyFormat(results.deliveredLeads)}
              </div>
              <div className="text-xs text-gray-500 mt-1">leads</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div className="text-sm text-gray-600 mb-1">Profit par unité</div>
              <div className="text-2xl font-bold text-green-600">
                {currencyFormat(results.profitPerUnit)}
              </div>
              <div className="text-xs text-gray-500 mt-1">TND/unité</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <div className="text-sm text-gray-600 mb-1">Profit total</div>
              <div className="text-2xl font-bold text-emerald-600">
                {currencyFormat(results.totalProfit)}
              </div>
              <div className="text-xs text-gray-500 mt-1">TND</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <Truck className="text-orange-600" size={24} />
              </div>
              <div className="text-sm text-gray-600 mb-1">Coût lead break-even</div>
              <div className="text-2xl font-bold text-orange-600">
                {currencyFormat(results.breakEvenLeadCost)}
              </div>
              <div className="text-xs text-gray-500 mt-1">TND</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Calculator className="text-blue-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Comment utiliser ce calculateur?
              </h3>
              <div className="text-blue-700 text-sm space-y-2">
                <p>
                  <strong>Coûts:</strong> Entrez tous vos coûts (produit, livraison, retour, traitement, lead).
                </p>
                <p>
                  <strong>Prix de vente:</strong> Le prix que votre client paie.
                </p>
                <p>
                  <strong>Taux de confirmation:</strong> % de leads qui confirment leur commande (typiquement 60-80%).
                </p>
                <p>
                  <strong>Taux de livraison:</strong> % de commandes confirmées qui sont livrées avec succès (typiquement 75-85%).
                </p>
                <p>
                  <strong>Break-even lead cost:</strong> Le coût maximum par lead pour rester profitable.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .calculator-page {
          max-width: 1400px;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: #6b7280;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default CalculatorPage;
