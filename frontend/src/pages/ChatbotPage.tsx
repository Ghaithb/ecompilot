import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Settings as SettingsIcon,
  TrendingUp,
  Clock,
  CheckCircle,
  Zap,
  BarChart3,
  Users,
  Brain,
  MessageCircle,
} from 'lucide-react';
import { rasaApi } from '@/lib/rasaApi';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  confidence?: number;
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      confidence: 0.98,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [topIntents, setTopIntents] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les analytics au montage
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [analyticsData, intentsData] = await Promise.all([
          rasaApi.getAnalytics(),
          rasaApi.getTopIntents(5),
        ]);
        setAnalytics(analyticsData);
        setTopIntents(intentsData);
      } catch (error) {
        console.error('Erreur chargement analytics:', error);
      }
    };
    
    loadAnalytics();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Appel API Backend Rasa via le service
      const data = await rasaApi.sendMessage({
        message: messageToSend,
        conversationId: conversationId || undefined,
        channel: 'web',
      });

      // Sauvegarder l'ID de conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      // Ajouter les réponses du bot
      const botMessages: Message[] = data.botMessages.map((msg: any, index: number) => ({
        id: messages.length + 2 + index,
        text: msg.text,
        sender: 'bot' as const,
        timestamp: new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        confidence: msg.confidence,
      }));

      setMessages((prev) => [...prev, ...botMessages]);
      setIsTyping(false);
    } catch (error) {
      console.error('Erreur Rasa:', error);
      
      // Fallback vers réponse simulée en cas d'erreur
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(messageToSend),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.85,
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('commande') || lowerInput.includes('order')) {
      return 'Je peux vous aider à suivre votre commande. Quel est votre numéro de commande ?';
    } else if (lowerInput.includes('produit') || lowerInput.includes('article')) {
      return 'Nous avons une large gamme de produits. Que recherchez-vous exactement ?';
    } else if (lowerInput.includes('prix') || lowerInput.includes('coût')) {
      return 'Les prix varient selon les produits. Puis-je avoir plus de détails sur ce qui vous intéresse ?';
    } else if (lowerInput.includes('livraison') || lowerInput.includes('shipping')) {
      return 'Nous offrons la livraison dans toute l\'Afrique. Les délais sont de 2-5 jours ouvrables.';
    } else if (lowerInput.includes('paiement') || lowerInput.includes('payment')) {
      return 'Nous acceptons Orange Money, MTN Money, Wave, cartes bancaires et paiement à la livraison.';
    }
    return 'Je comprends votre question. Laissez-moi vous aider avec cela. Pouvez-vous me donner plus de détails ?';
  };

  const quickActions = [
    'Suivre ma commande',
    'Voir les produits',
    'Infos livraison',
    'Moyens de paiement',
  ];

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            Assistant Conversationnel Rasa
          </h1>
          <p className="text-gray-600 mt-2">
            Chatbot IA avec NLP pour la communication client
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <SettingsIcon className="w-4 h-4" />
          Configurer Rasa
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversations</p>
                <p className="text-2xl font-bold">{analytics?.totalConversations || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Total</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de résolution</p>
                <p className="text-2xl font-bold">{analytics?.resolutionRate?.toFixed(1) || 0}%</p>
                <p className="text-xs text-green-600 mt-1">Excellent</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps réponse</p>
                <p className="text-2xl font-bold">1.2s</p>
                <p className="text-xs text-blue-600 mt-1">Très rapide</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{analytics?.averageSatisfaction?.toFixed(1) || 0}/5</p>
                <p className="text-xs text-green-600 mt-1">
                  {'⭐'.repeat(Math.round(analytics?.averageSatisfaction || 0))}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Interface de test
            </CardTitle>
            <CardDescription>Testez votre assistant conversationnel</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Messages Area */}
            <div className="h-[500px] border rounded-lg flex flex-col bg-gray-50">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[80%] ${
                        message.sender === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-purple-500 text-white'
                        }`}
                      >
                        {message.sender === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.sender === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                          {message.confidence && (
                            <Badge variant="secondary" className="text-xs">
                              {(message.confidence * 100).toFixed(0)}% confiance
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="border-t p-3 bg-white">
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(action)}
                      className="whitespace-nowrap"
                    >
                      {action}
                    </Button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={sendMessage} className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Analytics & Config */}
        <div className="space-y-4">
          {/* Rasa Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="w-5 h-5" />
                Statut Rasa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Serveur Rasa</span>
                <Badge variant="default">Connecté</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Modèle NLU</span>
                <Badge variant="default">Actif</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Version</span>
                <span className="text-sm font-mono">3.6.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Intents</span>
                <span className="text-sm font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Actions</span>
                <span className="text-sm font-semibold">15</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                Entraîner le modèle
              </Button>
            </CardContent>
          </Card>

          {/* Top Intents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-5 h-5" />
                Top Intents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topIntents.length > 0 ? topIntents.map((intent) => {
                  const total = topIntents.reduce((sum, i) => sum + i.count, 0);
                  const percentage = total > 0 ? (intent.count / total) * 100 : 0;
                  return (
                  <div key={intent.intent}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{intent.intent}</span>
                      <span className="text-sm text-gray-600">{intent.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  );
                }) : <p className="text-sm text-gray-500">Aucune donnée disponible</p>}
              </div>
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-5 h-5" />
                Conversations récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { user: 'Client #1234', time: '2min', status: 'active' },
                  { user: 'Client #5678', time: '15min', status: 'resolved' },
                  { user: 'Client #9012', time: '1h', status: 'resolved' },
                ].map((conv, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">{conv.user}</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{conv.time}</span>
                      </div>
                    </div>
                    <Badge
                      variant={conv.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {conv.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
