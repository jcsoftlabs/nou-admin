'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Receipt, Eye } from 'lucide-react';
import { adminService } from '@/lib/api';
import { Cotisation } from '@/types/backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function CotisationsPage() {
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [statutFilter, setStatutFilter] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedCotisation, setSelectedCotisation] = useState<Cotisation | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [montantValide, setMontantValide] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCotisations();
  }, [page]);

  const loadCotisations = async () => {
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

      const result = await adminService.getCotisations(
        { page, limit: 20, statut: statutFilter === 'all' ? undefined : statutFilter, date_debut: dateDebut, date_fin: dateFin },
        userToken
      );

      if (result.success && result.data) {
        setCotisations(result.data.data);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError(result.message || "Impossible de charger les cotisations.");
        setCotisations([]);
      }
    } catch (err) {
      console.error('Erreur chargement cotisations:', err);
      setError("Une erreur critique est survenue.");
      setCotisations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async () => {
    if (!selectedCotisation) return;
    try {
      console.log('adminService object:', adminService);
      setActionLoading(true);
      const result = await adminService.validerCotisation(
        selectedCotisation.id,
        montantValide,
        commentaire || undefined,
        token
      );
      if (result.success) {
        // Envoyer notification au membre
        await sendNotification(
          selectedCotisation.membre_id,
          'Cotisation validée',
          `Votre cotisation de ${montantValide} HTG a été validée.`
        );
        setShowValidateDialog(false);
        setCommentaire('');
        setSelectedCotisation(null);
        loadCotisations();
      } else {
        setError(result.message || "Échec de la validation");
      }
    } catch (error) {
      console.error('Erreur validation:', error);
      setError('Erreur lors de la validation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejeter = async () => {
    if (!selectedCotisation) return;
    if (!commentaire.trim()) {
      setError('Un commentaire est requis pour rejeter une cotisation');
      return;
    }

    try {
      setActionLoading(true);
      const result = await adminService.rejeterCotisation(
        selectedCotisation.id,
        commentaire,
        token
      );
      if (result.success) {
        // Envoyer notification au membre
        await sendNotification(
          selectedCotisation.membre_id,
          'Cotisation rejetée',
          `Votre cotisation de ${selectedCotisation.montant} HTG a été rejetée. Raison: ${commentaire}`
        );
        setShowRejectDialog(false);
        setCommentaire('');
        setSelectedCotisation(null);
        loadCotisations();
      } else {
        setError(result.message || "Échec du rejet");
      }
    } catch (error) {
      console.error('Erreur rejet:', error);
      setError('Erreur lors du rejet');
    } finally {
      setActionLoading(false);
    }
  };

  const sendNotification = async (membreId: number, title: string, body: string) => {
    try {
      await adminService.sendNotification(
        {
          title,
          body,
          target_type: 'specific',
          target_ids: [membreId],
        },
        token
      );
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      // Ne pas bloquer si la notification échoue
    }
  };

  const openDetailDialog = (cotisation: Cotisation) => {
    setSelectedCotisation(cotisation);
    setShowDetailDialog(true);
  };

  const openValidateDialog = (cotisation: Cotisation) => {
    setSelectedCotisation(cotisation);
    setCommentaire('');
    setMontantValide(cotisation.montant);
    setShowValidateDialog(true);
  };

  const openRejectDialog = (cotisation: Cotisation) => {
    setSelectedCotisation(cotisation);
    setCommentaire('');
    setShowRejectDialog(true);
  };

  const handleSearch = () => {
    setPage(1);
    loadCotisations();
  };

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'validé': 'default',
      'en_attente': 'secondary',
      'rejeté': 'destructive',
    };
    return <Badge variant={variants[statut] || 'secondary'}>{statut}</Badge>;
  };

  if (loading && cotisations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des cotisations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadCotisations} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Receipt className="h-8 w-8" />
          Cotisations
        </h1>
        <p className="text-muted-foreground">Gérez et validez les cotisations des membres</p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Info :</strong> Cotisation annuelle = 1500 HTG | Premier versement minimum = 150 HTG | Versements multiples autorisés
          </p>
        </div>
      </div>

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
                  <SelectItem value="validé">Validé</SelectItem>
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
                <TableHead>Montant versement</TableHead>
                <TableHead>Moyen paiement</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Reçu</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotisations.length > 0 ? (
                cotisations.map((cotisation) => (
                  <TableRow key={cotisation.id}>
                    <TableCell>
                      {cotisation.membre ? `${cotisation.membre.prenom} ${cotisation.membre.nom}` : `ID ${cotisation.membre_id}`}
                    </TableCell>
                    <TableCell className="font-bold">{cotisation.montant} HTG</TableCell>
                    <TableCell>{cotisation.moyen_paiement}</TableCell>
                    <TableCell>{cotisation.date_paiement ? new Date(cotisation.date_paiement).toLocaleDateString('fr-FR') : '-'}</TableCell>
                    <TableCell>{getStatutBadge(cotisation.statut_paiement)}</TableCell>
                    <TableCell>
                      {cotisation.recu || cotisation.url_recu ? (
                        <Button size="sm" variant="outline" asChild>
                          <a href={cotisation.url_recu || cotisation.recu} target="_blank" rel="noopener noreferrer">
                            Voir
                          </a>
                        </Button>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetailDialog(cotisation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {cotisation.statut_paiement === 'en_attente' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openValidateDialog(cotisation)}
                              disabled={actionLoading}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(cotisation)}
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
                    Aucune cotisation trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
            Précédent
          </Button>
          <span className="flex items-center px-4">Page {page} sur {totalPages}</span>
          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
            Suivant
          </Button>
        </div>
      )}

      {/* Dialog Détails */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la cotisation</DialogTitle>
          </DialogHeader>
          {selectedCotisation && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">Informations cotisation annuelle</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <Label className="text-blue-700">Cotisation annuelle</Label>
                    <p className="font-bold text-blue-900">1500 HTG</p>
                  </div>
                  <div>
                    <Label className="text-blue-700">Versement actuel</Label>
                    <p className="font-bold text-blue-900">{selectedCotisation.montant} HTG</p>
                  </div>
                  <div>
                    <Label className="text-blue-700">Minimum 1er versement</Label>
                    <p className="font-bold text-blue-900">150 HTG</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Membre</Label>
                  <p className="font-medium">
                    {selectedCotisation.membre
                      ? `${selectedCotisation.membre.prenom} ${selectedCotisation.membre.nom}`
                      : `ID ${selectedCotisation.membre_id}`}
                  </p>
                </div>
                <div>
                  <Label>Montant de ce versement</Label>
                  <p className="font-medium text-lg">{selectedCotisation.montant} HTG</p>
                </div>
                <div>
                  <Label>Moyen de paiement</Label>
                  <p className="font-medium">{selectedCotisation.moyen_paiement}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  {getStatutBadge(selectedCotisation.statut_paiement)}
                </div>
                <div>
                  <Label>Date de paiement</Label>
                  <p className="font-medium">
                    {selectedCotisation.date_paiement
                      ? new Date(selectedCotisation.date_paiement).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                {selectedCotisation.date_verification && (
                  <div>
                    <Label>Date de vérification</Label>
                    <p className="font-medium">
                      {new Date(selectedCotisation.date_verification).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedCotisation.commentaire_verification && (
                <div>
                  <Label>Commentaire de vérification</Label>
                  <p className="text-sm bg-muted p-3 rounded">
                    {selectedCotisation.commentaire_verification}
                  </p>
                </div>
              )}

              {(selectedCotisation.url_recu || selectedCotisation.recu) && (
                <div>
                  <Label>Reçu</Label>
                  <div className="mt-2 border rounded p-2">
                    <a
                      href={selectedCotisation.url_recu || selectedCotisation.recu}
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

      {/* Dialog Valider */}
      <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider la cotisation</DialogTitle>
            <DialogDescription>
              Confirmer la validation de cette cotisation. Vous pouvez ajuster le montant si nécessaire.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="montant-valide">Montant à valider</Label>
              <Input
                id="montant-valide"
                type="number"
                value={montantValide}
                onChange={(e) => setMontantValide(Number(e.target.value))}
                placeholder="Montant"
              />
            </div>
            <div>
              <Label htmlFor="commentaire-validate">Commentaire (optionnel)</Label>
              <Textarea
                id="commentaire-validate"
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
              onClick={() => setShowValidateDialog(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button onClick={handleValider} disabled={actionLoading}>
              {actionLoading ? 'En cours...' : 'Valider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejeter */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la cotisation</DialogTitle>
            <DialogDescription>
              Rejeter cette cotisation de {selectedCotisation?.montant} HTG
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
                Un motif est obligatoire pour rejeter une cotisation
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
