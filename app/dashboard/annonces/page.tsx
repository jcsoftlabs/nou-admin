'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Megaphone, Plus, Edit, Archive } from 'lucide-react';
import { annonceService } from '@/lib/api';
import { Annonce } from '@/types/backend';

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [statutFilter, setStatutFilter] = useState('all');
  const [prioriteFilter, setPrioriteFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnonce, setEditingAnnonce] = useState<Annonce | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    message: '',
    priorite: 'info' as 'info' | 'important' | 'urgent',
    statut: 'brouillon' as 'brouillon' | 'publie' | 'archive',
    date_publication: '',
    date_expiration: '',
  });

  useEffect(() => {
    const initToken = async () => {
      const response = await fetch('/api/auth/me');
      const { token: userToken } = await response.json();
      setToken(userToken);
    };
    initToken();
  }, []);

  useEffect(() => {
    if (token) {
      loadAnnonces();
    }
  }, [page, token]);

  const loadAnnonces = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const result = await annonceService.getAnnonces(
        {
          page,
          limit: 20,
          statut: statutFilter === 'all' ? undefined : statutFilter,
          priorite: prioriteFilter === 'all' ? undefined : prioriteFilter,
        },
        token
      );

      if (result.success && result.data) {
        // L'API peut renvoyer soit { data: [...], pagination: {...} } soit directement un tableau
        if (Array.isArray(result.data)) {
          setAnnonces(result.data);
          setTotalPages(1);
        } else if (result.data.data && result.data.pagination) {
          setAnnonces(result.data.data);
          setTotalPages(result.data.pagination.totalPages);
        } else {
          setAnnonces([]);
          setTotalPages(1);
        }
      } else {
        setError(result.message || 'Impossible de charger les annonces.');
        setAnnonces([]);
      }
    } catch (err) {
      console.error('Erreur chargement annonces:', err);
      setError('Une erreur critique est survenue.');
      setAnnonces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadAnnonces();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnonce) {
        await annonceService.updateAnnonce(editingAnnonce.id, formData, token);
      } else {
        await annonceService.createAnnonce(formData, token);
      }
      setIsDialogOpen(false);
      setEditingAnnonce(null);
      resetForm();
      loadAnnonces();
    } catch (err) {
      console.error('Erreur sauvegarde annonce:', err);
    }
  };

  const handleChangeStatus = async (id: number, newStatus: 'brouillon' | 'publie' | 'archive') => {
    try {
      await annonceService.changeAnnonceStatus(id, newStatus, token);
      loadAnnonces();
    } catch (err) {
      console.error('Erreur changement statut annonce:', err);
    }
  };

  const openEditDialog = (annonce: Annonce) => {
    setEditingAnnonce(annonce);
    setFormData({
      titre: annonce.titre,
      message: annonce.message,
      priorite: annonce.priorite,
      statut: annonce.statut,
      date_publication: annonce.date_publication ? annonce.date_publication.split('T')[0] : '',
      date_expiration: annonce.date_expiration ? annonce.date_expiration.split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      message: '',
      priorite: 'info',
      statut: 'brouillon',
      date_publication: '',
      date_expiration: '',
    });
  };

  const getPrioriteBadge = (priorite: string) => {
    const variants = {
      info: 'default',
      important: 'secondary',
      urgent: 'destructive',
    } as const;
    return <Badge variant={variants[priorite as keyof typeof variants] || 'default'}>{priorite}</Badge>;
  };

  const getStatutBadge = (statut: string) => {
    const variants = {
      brouillon: 'secondary',
      publie: 'default',
      archive: 'outline',
    } as const;
    return <Badge variant={variants[statut as keyof typeof variants] || 'default'}>{statut}</Badge>;
  };

  if (loading && annonces.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des annonces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadAnnonces} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            Annonces
          </h1>
          <p className="text-muted-foreground">Gérez les annonces importantes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingAnnonce(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle annonce
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAnnonce ? 'Modifier' : 'Créer'} une annonce</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priorite">Priorité</Label>
                  <Select
                    value={formData.priorite}
                    onValueChange={(value: 'info' | 'important' | 'urgent') => setFormData({ ...formData, priorite: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="statut">Statut</Label>
                  <Select
                    value={formData.statut}
                    onValueChange={(value: 'brouillon' | 'publie' | 'archive') => setFormData({ ...formData, statut: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                      <SelectItem value="publie">Publié</SelectItem>
                      <SelectItem value="archive">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_publication">Date de publication</Label>
                  <Input
                    id="date_publication"
                    type="date"
                    value={formData.date_publication}
                    onChange={(e) => setFormData({ ...formData, date_publication: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="date_expiration">Date d&apos;expiration</Label>
                  <Input
                    id="date_expiration"
                    type="date"
                    value={formData.date_expiration}
                    onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingAnnonce ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Statut</Label>
              <Select value={statutFilter} onValueChange={setStatutFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="publie">Publié</SelectItem>
                  <SelectItem value="archive">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priorité</Label>
              <Select value={prioriteFilter} onValueChange={setPrioriteFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                Rechercher
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {annonces.length > 0 ? (
                annonces.map((annonce) => (
                  <TableRow key={annonce.id}>
                    <TableCell className="font-medium">{annonce.titre}</TableCell>
                    <TableCell className="max-w-xs truncate">{annonce.message}</TableCell>
                    <TableCell>{getPrioriteBadge(annonce.priorite)}</TableCell>
                    <TableCell>{getStatutBadge(annonce.statut)}</TableCell>
                    <TableCell>
                      {annonce.date_expiration
                        ? new Date(annonce.date_expiration).toLocaleDateString('fr-FR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {annonce.statut !== 'publie' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeStatus(annonce.id, 'publie')}
                            title="Publier"
                          >
                            Publier
                          </Button>
                        )}
                        {annonce.statut !== 'archive' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeStatus(annonce.id, 'archive')}
                            title="Archiver"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(annonce)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    Aucune annonce trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
