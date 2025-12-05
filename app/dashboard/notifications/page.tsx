'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send } from 'lucide-react';
import { adminService } from '@/lib/api';

export default function NotificationsPage() {
  const [token, setToken] = useState('');
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    target_type: 'all' as 'all' | 'specific' | 'role',
    target_role: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const { token: userToken } = await response.json();
      if (!userToken) {
        setError("Token d'authentification introuvable.");
      }
      setToken(userToken);
    } catch (err) {
      setError("Impossible de charger le token d'authentification.");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.body) {
      setError('Titre et message sont requis');
      return;
    }

    try {
      setSending(true);
      setError(null);
      setSuccess(null);
      const result = await adminService.sendNotification(
        {
          title: formData.title,
          body: formData.body,
          target_type: formData.target_type,
          target_role: formData.target_type === 'role' ? formData.target_role : undefined,
        },
        token
      );

      if (result.success) {
        setSuccess('Notification envoyée avec succès !');
        setFormData({
          title: '',
          body: '',
          target_type: 'all',
          target_role: '',
        });
      } else {
        setError(result.message || "Erreur lors de l'envoi");
      }
    } catch (err) {
      console.error('Erreur envoi notification:', err);
      setError("Une erreur critique est survenue lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Notifications
        </h1>
        <p className="text-muted-foreground">Envoyez des notifications push aux membres</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Envoyer une notification</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          {success && <p className="text-sm text-green-600 mb-4">{success}</p>}
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de la notification"
                required
              />
            </div>

            <div>
              <Label htmlFor="body">Message *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Contenu du message..."
                rows={5}
                required
              />
            </div>

            <div>
              <Label htmlFor="target_type">Destinataires</Label>
              <Select
                value={formData.target_type}
                onValueChange={(value: 'all' | 'specific' | 'role') => setFormData({ ...formData, target_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les membres</SelectItem>
                  <SelectItem value="role">Par rôle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.target_type === 'role' && (
              <div>
                <Label htmlFor="target_role">Rôle cible</Label>
                <Select
                  value={formData.target_role}
                  onValueChange={(value) => setFormData({ ...formData, target_role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="membre">Membres</SelectItem>
                    <SelectItem value="partner">Partners</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({ title: '', body: '', target_type: 'all', target_role: '' })
                }
              >
                Réinitialiser
              </Button>
              <Button type="submit" disabled={sending}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Historique récent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            L&apos;historique des notifications envoyées sera disponible ici.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
