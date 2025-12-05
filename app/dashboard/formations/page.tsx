'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, BookOpen, List, ChevronRight } from 'lucide-react';
import { adminService } from '@/lib/api';
import { Formation } from '@/types/backend';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FormationsPage() {
  const router = useRouter();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    niveau: '',
    image_couverture_url: '',
    est_active: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

      const result = await adminService.getFormations(1, 50, undefined, userToken);
      if (result.success && result.data) {
        setFormations(result.data.data);
      } else {
        setError(result.message || "Impossible de charger les formations.");
        setFormations([]);
      }
    } catch (err) {
      console.error('Erreur chargement formations:', err);
      setError("Une erreur critique est survenue.");
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const result = await adminService.createFormation(formData, token);
      if (result.success) {
        setIsCreateDialogOpen(false);
        loadData();
        resetForm();
      }
    } catch (error) {
      console.error('Erreur création formation:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFormation) return;
    try {
      const result = await adminService.updateFormation(
        selectedFormation.id,
        formData,
        token
      );
      if (result.success) {
        setSelectedFormation(null);
        loadData();
        resetForm();
      }
    } catch (error) {
      console.error('Erreur mise à jour formation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      niveau: '',
      image_couverture_url: '',
      est_active: true,
    });
  };

  const openEditDialog = (formation: Formation) => {
    setSelectedFormation(formation);
    setFormData({
      titre: formation.titre,
      description: formation.description || '',
      niveau: formation.niveau || '',
      image_couverture_url: formation.image_couverture_url || '',
      est_active: formation.est_active ?? true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des formations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadData} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Formations</h1>
          <p className="text-muted-foreground">Gérer les formations et leurs modules</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle formation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une formation</DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle formation au système
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) =>
                    setFormData({ ...formData, titre: e.target.value })
                  }
                  placeholder="Introduction à la politique"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description de la formation..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="niveau">Niveau</Label>
                  <Select
                    value={formData.niveau}
                    onValueChange={(value) =>
                      setFormData({ ...formData, niveau: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="débutant">Débutant</SelectItem>
                      <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="avancé">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="image_url">URL Image de couverture</Label>
                  <Input
                    id="image_url"
                    value={formData.image_couverture_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        image_couverture_url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="est_active"
                  checked={formData.est_active}
                  onChange={(e) =>
                    setFormData({ ...formData, est_active: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="est_active">Formation active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreate}>Créer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {formations.length > 0 ? (
          formations.map((formation) => (
            <Card key={formation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {formation.titre}
                    </CardTitle>
                    {formation.niveau && (
                      <Badge variant="secondary">{formation.niveau}</Badge>
                    )}
                  </div>
                  <Badge variant={formation.est_active ? 'default' : 'secondary'}>
                    {formation.est_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {formation.description || 'Pas de description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <List className="h-4 w-4" />
                    {formation.modules?.length || 0} module(s)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(formation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/formations/${formation.id}`)}
                    >
                      Gérer modules
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucune formation trouvée.
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {selectedFormation && (
        <Dialog
          open={!!selectedFormation}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedFormation(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la formation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-titre">Titre *</Label>
                <Input
                  id="edit-titre"
                  value={formData.titre}
                  onChange={(e) =>
                    setFormData({ ...formData, titre: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-niveau">Niveau</Label>
                  <Select
                    value={formData.niveau}
                    onValueChange={(value) =>
                      setFormData({ ...formData, niveau: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="débutant">Débutant</SelectItem>
                      <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="avancé">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-image_url">URL Image</Label>
                  <Input
                    id="edit-image_url"
                    value={formData.image_couverture_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        image_couverture_url: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-est_active"
                  checked={formData.est_active}
                  onChange={(e) =>
                    setFormData({ ...formData, est_active: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="edit-est_active">Formation active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFormation(null);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleUpdate}>Mettre à jour</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
