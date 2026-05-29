import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FlaskConical, TrendingUp, Users, Target, Award, Play, Pause, StopCircle } from 'lucide-react';

interface ABTestData {
  name: string;
  description: string;
  variantA: {
    name: string;
    content: any;
  };
  variantB: {
    name: string;
    content: any;
  };
  trafficSplit: number;
  goal: string;
  status: 'active' | 'paused' | 'completed';
  stats?: {
    variantA: { views: number; conversions: number; conversionRate: number };
    variantB: { views: number; conversions: number; conversionRate: number };
    winner?: 'A' | 'B';
    confidence?: number;
  };
}

interface ABTestingProps {
  pageId: string;
  currentContent: any;
  onCreateTest: (testData: ABTestData) => void;
}

const ABTesting: React.FC<ABTestingProps> = ({ pageId, currentContent, onCreateTest }) => {
  const [testData, setTestData] = useState<ABTestData>({
    name: '',
    description: '',
    variantA: {
      name: 'Version Originale',
      content: currentContent,
    },
    variantB: {
      name: 'Nouvelle Variante',
      content: currentContent,
    },
    trafficSplit: 50,
    goal: 'click_button',
    status: 'paused',
  });

  const [existingTests, setExistingTests] = useState<ABTestData[]>([
    // Exemple de test pour démonstration
    {
      name: 'Test Hero CTA',
      description: 'Tester deux variantes du bouton principal',
      variantA: { name: 'Bleu', content: {} },
      variantB: { name: 'Vert', content: {} },
      trafficSplit: 50,
      goal: 'click_button',
      status: 'active',
      stats: {
        variantA: { views: 1250, conversions: 87, conversionRate: 6.96 },
        variantB: { views: 1280, conversions: 112, conversionRate: 8.75 },
        winner: 'B',
        confidence: 85,
      },
    },
  ]);

  const calculateWinner = (stats: ABTestData['stats']) => {
    if (!stats) return null;
    
    const { variantA, variantB, confidence } = stats;
    
    if (confidence && confidence >= 95) {
      return variantA.conversionRate > variantB.conversionRate ? 'A' : 'B';
    }
    
    return null;
  };

  const getWinnerBadge = (test: ABTestData) => {
    if (!test.stats?.winner) return null;
    
    const winner = test.stats.winner === 'A' ? test.variantA : test.variantB;
    const improvement = Math.abs(
      test.stats.variantA.conversionRate - test.stats.variantB.conversionRate
    );
    
    return (
      <Badge className="bg-green-500">
        <Award className="w-3 h-3 mr-1" />
        {winner.name} gagne (+{improvement.toFixed(2)}%)
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Créer un nouveau test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            Créer un Test A/B
          </CardTitle>
          <CardDescription>
            Testez différentes variantes pour optimiser vos conversions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-name">Nom du test</Label>
            <Input
              id="test-name"
              value={testData.name}
              onChange={(e) => setTestData({ ...testData, name: e.target.value })}
              placeholder="Ex: Test bouton CTA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-description">Description</Label>
            <Textarea
              id="test-description"
              value={testData.description}
              onChange={(e) => setTestData({ ...testData, description: e.target.value })}
              placeholder="Objectif et détails du test"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Variante A (Contrôle)</Label>
              <Input
                value={testData.variantA.name}
                onChange={(e) => setTestData({
                  ...testData,
                  variantA: { ...testData.variantA, name: e.target.value }
                })}
                placeholder="Nom de la variante A"
              />
            </div>
            <div className="space-y-2">
              <Label>Variante B (Test)</Label>
              <Input
                value={testData.variantB.name}
                onChange={(e) => setTestData({
                  ...testData,
                  variantB: { ...testData.variantB, name: e.target.value }
                })}
                placeholder="Nom de la variante B"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Objectif de conversion</Label>
            <Select value={testData.goal} onValueChange={(v) => setTestData({ ...testData, goal: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="click_button">Clic sur bouton</SelectItem>
                <SelectItem value="form_submit">Soumission formulaire</SelectItem>
                <SelectItem value="add_to_cart">Ajout au panier</SelectItem>
                <SelectItem value="page_view">Vue de page</SelectItem>
                <SelectItem value="time_on_page">Temps sur la page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Répartition du trafic: {testData.trafficSplit}% sur variante B
            </Label>
            <Slider
              value={[testData.trafficSplit]}
              onValueChange={(v) => setTestData({ ...testData, trafficSplit: v[0] })}
              min={0}
              max={100}
              step={5}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Variante A: {100 - testData.trafficSplit}%</span>
              <span>Variante B: {testData.trafficSplit}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => onCreateTest(testData)}
              disabled={!testData.name}
              className="flex-1"
            >
              Créer le Test
            </Button>
            <Button variant="outline">
              Éditer Variante B
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tests existants */}
      <Card>
        <CardHeader>
          <CardTitle>Tests en Cours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {existingTests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun test actif
            </div>
          ) : (
            existingTests.map((test, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {test.name}
                          {test.status === 'active' && (
                            <Badge className="bg-green-500">
                              <Play className="w-3 h-3 mr-1" />
                              Actif
                            </Badge>
                          )}
                          {getWinnerBadge(test)}
                        </h4>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {test.status === 'active' && (
                          <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <StopCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    {test.stats && (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Variante A */}
                        <div className="p-4 rounded-lg border bg-card">
                          <div className="text-sm font-medium mb-3 flex items-center justify-between">
                            <span>{test.variantA.name}</span>
                            {test.stats.winner === 'A' && (
                              <Award className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Vues
                              </span>
                              <span className="font-medium">{test.stats.variantA.views}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Conversions
                              </span>
                              <span className="font-medium">{test.stats.variantA.conversions}</span>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="text-2xl font-bold text-primary">
                                {test.stats.variantA.conversionRate.toFixed(2)}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Taux de conversion
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Variante B */}
                        <div className="p-4 rounded-lg border bg-card">
                          <div className="text-sm font-medium mb-3 flex items-center justify-between">
                            <span>{test.variantB.name}</span>
                            {test.stats.winner === 'B' && (
                              <Award className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Vues
                              </span>
                              <span className="font-medium">{test.stats.variantB.views}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Conversions
                              </span>
                              <span className="font-medium">{test.stats.variantB.conversions}</span>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="text-2xl font-bold text-primary">
                                {test.stats.variantB.conversionRate.toFixed(2)}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Taux de conversion
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confidence */}
                    {test.stats?.confidence && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Niveau de confiance</span>
                          <span className={`font-medium ${
                            test.stats.confidence >= 95 ? 'text-green-600' :
                            test.stats.confidence >= 80 ? 'text-orange-600' :
                            'text-muted-foreground'
                          }`}>
                            {test.stats.confidence}%
                          </span>
                        </div>
                        <Progress value={test.stats.confidence} />
                        {test.stats.confidence >= 95 && (
                          <p className="text-xs text-green-600">
                            ✓ Résultats statistiquement significatifs
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ABTesting;
