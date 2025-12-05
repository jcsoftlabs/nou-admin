'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Check, X, Gift, Eye } from 'lucide-react';
import { adminService } from '@/lib/api';
import { Don } from '@/types/backend';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function DonsPage() {
  const [dons, setDons] = useState<Don[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [statutFilter, setStatutFilter] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedDon, setSelectedDon] = useState<Don | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDons();
  }, [page]);

  const loadDons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/me');
      const { token: userToken } = await response.json();
      setToken(userToken);

      if (!userToken) {
        setError("Token d'authentification introuvable.");
        setLoading(false);
        return;
      }

      const result = await adminService.getDons(
        { 
          page, 
          limit: 20, 
          statut: statutFilter === 'all' ? undefined : statutFilter, 
          date_debut: dateDebut, 
          date_fin: dateFin 
        },
        userToken
      );

      if (result.success && result.data) {
        setDons(result.data.data);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError(result.message || "Impossible de charger les dons.");
        setDons([]);
      }
    } catch (err) {
      console.error('Erreur chargement dons:', err);
      setError("Une erreur critique est survenue.");
      setDons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprouver = async () => {
    if (!selectedDon) return;
    try {
      setActionLoading(true);
      const result = await adminService.approuverDon(
        selectedDon.id,
        commentaire || undefined,
        token
      );
      if (result.success) {
        setShowApproveDialog(false);
        setCommentaire('');
        setSelectedDon(null);
        loadDons();
      } else {
        setError(result.message || "Échec de l'approbation");
      }
    } catch (error) {
      console.error('Erreur approbation:', error);
      setError("Erreur lors de l'approbation du don");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejeter = async () => {
    if (!selectedDon) return;
    if (!commentaire.trim()) {
      setError("Un commentaire est requis pour rejeter un don");
      return;
    }

    try {
      setActionLoading(true);
      const result = await adminService.rejeterDon(
        selectedDon.id,
        commentaire,
        token
      );
      if (result.success) {
        setShowRejectDialog(false);
        setCommentaire('');
        setSelectedDon(null);
        loadDons();
      } else {
        setError(result.message || "Échec du rejet");
      }
    } catch (error) {
      console.error('Erreur rejet:', error);
      setError("Erreur lors du rejet du don");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadDons();
  };

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'approuvé': 'default',
      'en_attente': 'secondary',
      'rejeté': 'destructive',
    };
    return <Badge variant={variants[statut] || 'secondary'}>{statut}</Badge>;
  };

  const openDetailDialog = (don: Don) => {
    setSelectedDon(don);
    setShowDetailDialog(true);
  };

  const openApproveDialog = (don: Don) => {
    setSelectedDon(don);
    setCommentaire('');
    setShowApproveDialog(true);
  };

  const openRejectDialog = (don: Don) => {
    setSelectedDon(don);
    setCommentaire('');
    setShowRejectDialog(true);
  };

  if (loading && dons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des dons...</p>
      </div>
    );
  }

  if (error && dons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadDons} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gift className="h-8 w-8" />
          Dons
        </h1>
        <p className="text-muted-foreground">Gérez et validez les dons des membres</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select value={statutFilter} onValueChange={setStatutFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="approuvé">Approuvé</SelectItem>
                  <SelectItem value="rejeté">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date début</label>
              <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Date fin</label>
              <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">Rechercher</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membre</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Moyen paiement</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Reçu</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dons.length > 0 ? (
                dons.map((don) => (
                  <TableRow key={don.id}>
                    <TableCell>
                      {don.membre ? `${don.membre.prenom} ${don.membre.nom}` : `ID ${don.membre_id}`}
                    </TableCell>
                    <TableCell className="font-bold">{don.montant} HTG</TableCell>
                    <TableCell>{don.moyen_paiement}</TableCell>
                    <TableCell>
                      {don.date_don ? new Date(don.date_don).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell>{getStatutBadge(don.statut)}</TableCell>
                    <TableCell>
                      {don.recu || don.url_recu ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetailDialog(don)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {don.statut === 'en_attente' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openApproveDialog(don)}
                              disabled={actionLoading}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(don)}
                              disabled={actionLoading}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    Aucun don trouvé
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
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="px-4 py-2">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Dialog Détails */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du don</DialogTitle>
          </DialogHeader>
          {selectedDon && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Membre</Label>
                  <p className="font-medium">
                    {selectedDon.membre
                      ? `${selectedDon.membre.prenom} ${selectedDon.membre.nom}`
                      : `ID ${selectedDon.membre_id}`}
                  </p>
                </div>
                <div>
                  <Label>Montant</Label>
                  <p className="font-medium">{selectedDon.montant} HTG</p>
                </div>
                <div>
                  <Label>Moyen de paiement</Label>
                  <p className="font-medium">{selectedDon.moyen_paiement}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  {getStatutBadge(selectedDon.statut)}
                </div>
                <div>
                  <Label>Date du don</Label>
                  <p className="font-medium">
                    {selectedDon.date_don
                      ? new Date(selectedDon.date_don).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                {selectedDon.date_verification && (
                  <div>
                    <Label>Date de vérification</Label>
                    <p className="font-medium">
                      {new Date(selectedDon.date_verification).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedDon.commentaire_verification && (
                <div>
                  <Label>Commentaire de vérification</Label>
                  <p className="text-sm bg-muted p-3 rounded">
                    {selectedDon.commentaire_verification}
                  </p>
                </div>
              )}

              {(selectedDon.url_recu || selectedDon.recu) && (
                <div>
                  <Label>Reçu</Label>
                  <div className="mt-2 border rounded p-2">
                    <a
                      href={selectedDon.url_recu || selectedDon.recu}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ouvrir le reçu dans un nouvel onglet
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Approuver */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver le don</DialogTitle>
            <DialogDescription>
              Confirmer l&apos;approbation de ce don de {selectedDon?.montant} HTG
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="commentaire-approve">Commentaire (optionnel)</Label>
              <Textarea
                id="commentaire-approve"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Ajouter un commentaire..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button onClick={handleApprouver} disabled={actionLoading}>
              {actionLoading ? 'En cours...' : 'Approuver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejeter */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le don</DialogTitle>
            <DialogDescription>
              Rejeter ce don de {selectedDon?.montant} HTG
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="commentaire-reject">Motif du rejet *</Label>
              <Textarea
                id="commentaire-reject"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Expliquez la raison du rejet..."
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Un motif est obligatoire pour rejeter un don
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejeter}
              disabled={actionLoading || !commentaire.trim()}
            >
              {actionLoading ? 'En cours...' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
