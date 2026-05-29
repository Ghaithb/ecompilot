import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAi } from '@/contexts/AiContext';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Package, 
  DollarSign,
  BarChart3,
  Lightbulb,
  Zap
} from 'lucide-react';

const AiCopilotPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    chatWithCopilot, 
    chatHistory, 
    isLoading, 
    dashboardInsights,
    recommendations 
  } = useAi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const currentMessage = message;
    setMessage('');
    
    try {
      await chatWithCopilot(currentMessage, {
        dashboardInsights,
        selectedSuggestion,
      });
      setSelectedSuggestion(null);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      text: "Analyse mes ventes de la semaine",
      category: "Ventes"
    },
    {
      icon: <Package className="w-4 h-4" />,
      text: "Quels produits dois-je réassortir ?",
      category: "Stock"
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      text: "Optimise les prix de mes produits",
      category: "Prix"
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      text: "Prévisions de ventes pour le mois",
      category: "Prévisions"
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      text: "Stratégie marketing pour Black Friday",
      category: "Marketing"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      text: "Détecte les anomalies dans mes commandes",
      category: "Sécurité"
    }
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setSelectedSuggestion(suggestion);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Assistant IA EcomPilot</h1>
            <p className="text-muted-foreground text-sm">Votre copilote intelligent pour l'e-commerce et la finance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Zone de chat principale */}
        <div className="lg:col-span-3">
          <Card className="h-[620px] flex flex-col rounded-2xl border-gradient shadow-elegant glass">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Conversation avec l'IA
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 pb-4">
                  {chatHistory.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-primary/10 flex items-center justify-center">
                        <Bot className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-semibold mb-1 text-foreground">Bonjour ! Je suis votre assistant IA EcomPilot</p>
                      <p className="text-sm">Posez-moi des questions sur vos ventes, stocks, prix, ou utilisez les suggestions à droite.</p>
                    </div>
                  )}
                  
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className="space-y-3">
                      {/* Message utilisateur */}
                      <div className="flex items-start gap-2 justify-end w-full">
                        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2 shadow-sm max-w-[80%] min-w-0 break-words overflow-hidden">
                          <p className="leading-relaxed text-sm break-words overflow-wrap-anywhere m-0">{chat.message}</p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full border border-primary/20 flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      
                      {/* Réponse IA */}
                      {chat.response && (
                        <div className="flex items-start gap-2 w-full">
                          <div className="p-2 bg-gradient-primary rounded-full shadow-xs flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-card rounded-2xl px-4 py-2 shadow-sm border border-border max-w-[80%] min-w-0 flex-1 overflow-hidden">
                            <div className="prose prose-sm max-w-none dark:prose-invert overflow-hidden">
                              <p className="whitespace-pre-wrap leading-relaxed text-sm text-foreground break-words overflow-wrap-anywhere m-0">{chat.response}</p>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1.5">
                              {chat.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className="p-2 bg-gradient-primary rounded-full">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-card rounded-2xl px-4 py-2 border border-border">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">L'IA réfléchit...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              {/* Zone de saisie */}
              <div className="border-t p-3">
                <div className="flex gap-2 items-center">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Posez votre question à l'IA..."
                    className="flex-1 rounded-xl"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl h-10"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Suggestions rapides */}
          <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Suggestions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 pr-3">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto px-3 py-2 rounded-lg hover:bg-gray-50 whitespace-normal break-words"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-0.5 text-gray-600">{suggestion.icon}</div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm leading-5 break-words">{suggestion.text}</div>
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {suggestion.category}
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recommandations IA */}
          {recommendations && (
            <Card className="rounded-2xl border-gradient shadow-elegant glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <span className="text-gradient">Recommandations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {recommendations.recommendations}
                </div>
                <Separator className="my-3" />
                <div className="text-xs text-muted-foreground">
                  Mis à jour: {new Date(recommendations.generatedAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights rapides */}
          {dashboardInsights && (
            <Card className="rounded-2xl border-gradient shadow-elegant glass">
              <CardHeader>
                <CardTitle className="text-base text-gradient">Insights IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-green-600 dark:text-green-400">Santé financière</div>
                  <div className="text-xs text-muted-foreground">
                    Score: {dashboardInsights.financialAnalysis?.healthScore || 'N/A'}/10
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="font-medium text-blue-600 dark:text-blue-400">Prévisions</div>
                  <div className="text-xs text-muted-foreground">
                    CA prévu: {dashboardInsights.salesForecasts?.predictedRevenue || 'N/A'}€
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="font-medium text-orange-600 dark:text-orange-400">Stock</div>
                  <div className="text-xs text-muted-foreground">
                    Produits à réassortir: {dashboardInsights.inventoryAnalysis?.lowStockCount || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiCopilotPage;

