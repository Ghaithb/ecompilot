import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Search,
  Filter,
  Eye,
  Send,
  CheckCircle2
} from 'lucide-react';

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
  status: 'unread' | 'read' | 'replied';
  source: string;
  createdAt: string;
}

export default function WebsiteMessagesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const { data: messages, isLoading } = useQuery({
    queryKey: ['website-messages', statusFilter],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('source', 'website');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/website/messages?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!response.ok) throw new Error('Erreur chargement messages');
      return response.json();
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/website/messages/${messageId}/read`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!response.ok) throw new Error('Erreur');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-messages'] });
      toast({ title: 'Message marqué comme lu' });
    }
  });

  const sendReplyMutation = useMutation({
    mutationFn: async (data: { messageId: string; reply: string }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/website/messages/${data.messageId}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reply: data.reply })
        }
      );
      
      if (!response.ok) throw new Error('Erreur envoi');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-messages'] });
      toast({
        title: 'Réponse envoyée',
        description: 'Votre réponse a été envoyée par email'
      });
      setShowReply(false);
      setReplyText('');
    }
  });

  const filteredMessages = messages?.filter((msg: Message) => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: messages?.length || 0,
    unread: messages?.filter((m: Message) => m.status === 'unread').length || 0,
    replied: messages?.filter((m: Message) => m.status === 'replied').length || 0
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Messages Clients</h1>
        <p className="text-muted-foreground">Messages de contact depuis votre site web</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Non lus</CardTitle>
            <Mail className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Répondus</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.replied}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="unread">Non lus</SelectItem>
                <SelectItem value="read">Lus</SelectItem>
                <SelectItem value="replied">Répondus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredMessages?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun message trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>De</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages?.map((message: Message) => (
                  <TableRow key={message._id} className={message.status === 'unread' ? 'bg-blue-50' : ''}>
                    <TableCell className="font-medium">{message.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {message.email}
                        </div>
                        {message.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {message.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{message.message}</div>
                    </TableCell>
                    <TableCell>
                      {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        message.status === 'unread' ? 'destructive' :
                        message.status === 'read' ? 'default' : 'secondary'
                      }>
                        {message.status === 'unread' ? 'Non lu' :
                         message.status === 'read' ? 'Lu' : 'Répondu'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMessage(message);
                            if (message.status === 'unread') {
                              markAsReadMutation.mutate(message._id);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowReply(true);
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Détails */}
      <Dialog open={!!selectedMessage && !showReply} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message de {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <strong>De:</strong> {selectedMessage.name}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                  {selectedMessage.email}
                </a>
              </div>
              {selectedMessage.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${selectedMessage.phone}`} className="text-blue-600 hover:underline">
                    {selectedMessage.phone}
                  </a>
                </div>
              )}
              <div>
                <strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <strong>Message:</strong>
                <p className="mt-2 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              
              <Button
                className="w-full"
                onClick={() => setShowReply(true)}
              >
                <Send className="h-4 w-4 mr-2" />
                Répondre
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Réponse */}
      <Dialog open={showReply} onOpenChange={setShowReply}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Répondre à {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded text-sm">
              <strong>Message original:</strong>
              <p className="mt-1">{selectedMessage?.message}</p>
            </div>
            
            <Textarea
              placeholder="Votre réponse..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={6}
            />
            
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  if (selectedMessage && replyText.trim()) {
                    sendReplyMutation.mutate({
                      messageId: selectedMessage._id,
                      reply: replyText
                    });
                  }
                }}
                disabled={!replyText.trim() || sendReplyMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {sendReplyMutation.isPending ? 'Envoi...' : 'Envoyer'}
              </Button>
              <Button variant="outline" onClick={() => setShowReply(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
