import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Mail, MessageSquare, ShoppingCart } from 'lucide-react';

const ContentManagementSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion du Contenu</CardTitle>
          <CardDescription>
            Gérez les réservations, messages, newsletter et commandes de votre site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Réservations</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Newsletter</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Commandes</span>
              </TabsTrigger>
            </TabsList>

            {/* Réservations */}
            <TabsContent value="bookings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Réservations</CardTitle>
                  <CardDescription>
                    Gérez les réservations de vos clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">Aucune réservation pour le moment</p>
                    <p className="text-sm text-muted-foreground">
                      Les réservations de vos clients apparaîtront ici
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages */}
            <TabsContent value="messages" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messages de Contact</CardTitle>
                  <CardDescription>
                    Messages reçus via le formulaire de contact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">Aucun message pour le moment</p>
                    <p className="text-sm text-muted-foreground">
                      Les messages de vos visiteurs apparaîtront ici
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Newsletter */}
            <TabsContent value="newsletter" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Abonnés Newsletter</CardTitle>
                  <CardDescription>
                    Liste des abonnés à votre newsletter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">Aucun abonné pour le moment</p>
                    <p className="text-sm text-muted-foreground">
                      Les abonnés à votre newsletter apparaîtront ici
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commandes */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commandes du Site</CardTitle>
                  <CardDescription>
                    Commandes passées sur votre site web
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">Aucune commande pour le moment</p>
                    <p className="text-sm text-muted-foreground">
                      Les commandes de votre site apparaîtront ici
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManagementSection;
