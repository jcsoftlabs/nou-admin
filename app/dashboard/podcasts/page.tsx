'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mic, Plus, Play } from 'lucide-react';
import { adminService } from '@/lib/api';
import { Podcast } from '@/types/backend';

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPodcasts();
  }, [page]);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/me');
      const { token: userToken } = await response.json();
      setToken(userToken);

      if (!userToken) {
        setError("Token d&apos;authentification introuvable.");
        setLoading(false);
        return;
      }

      const result = await adminService.getPodcasts(page, 20, undefined, userToken);
      if (result.success && result.data) {
        setPodcasts(result.data.data);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError(result.message || "Impossible de charger les podcasts.");
        setPodcasts([]);
      }
    } catch (err) {
      console.error('Erreur chargement podcasts:', err);
      setError("Une erreur critique est survenue.");
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const audioFile = formData.get('audio') as File;
    const coverFile = formData.get('cover') as File;

    if (!audioFile) {
      alert('Fichier audio requis');
      return;
    }

    try {
      setUploading(true);
      const result = await adminService.uploadPodcast(
        {
          titre: formData.get('titre') as string,
          description: formData.get('description') as string,
          categorie: formData.get('categorie') as string,
          duree: parseInt(formData.get('duree') as string) || 0,
        },
        audioFile,
        coverFile || undefined,
        token
      );

      if (result.success) {
        setIsUploadOpen(false);
        loadPodcasts();
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading && podcasts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des podcasts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadPodcasts} className="mt-4">
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
            <Mic className="h-8 w-8" />
            Podcasts
          </h1>
          <p className="text-muted-foreground">Gérez les podcasts de l&apos;organisation</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau podcast
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload un nouveau podcast</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="titre">Titre *</Label>
                <Input id="titre" name="titre" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Input id="categorie" name="categorie" placeholder="Politique, Éducation..." />
                </div>
                <div>
                  <Label htmlFor="duree">Durée (minutes)</Label>
                  <Input id="duree" name="duree" type="number" />
                </div>
              </div>
              <div>
                <Label htmlFor="audio">Fichier audio * (MP3, WAV)</Label>
                <Input id="audio" name="audio" type="file" accept="audio/*" required />
              </div>
              <div>
                <Label htmlFor="cover">Image de couverture (JPG, PNG)</Label>
                <Input id="cover" name="cover" type="file" accept="image/*" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Upload en cours...' : 'Uploader'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {podcasts.length > 0 ? (
          podcasts.map((podcast) => (
            <Card key={podcast.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      {podcast.titre}
                    </CardTitle>
                    {podcast.categorie && (
                      <Badge variant="secondary">{podcast.categorie}</Badge>
                    )}
                  </div>
                  {podcast.est_en_direct && <Badge>En direct</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {podcast.description || 'Pas de description'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {podcast.duree && <span>{podcast.duree} min</span>}
                    {podcast.nombre_ecoutes !== undefined && (
                      <span className="ml-2 text-muted-foreground">
                        {podcast.nombre_ecoutes} écoutes
                      </span>
                    )}
                  </div>
                  {podcast.audio_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={podcast.audio_url} target="_blank" rel="noopener noreferrer">
                        <Play className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun podcast trouvé.
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
          Précédent
        </Button>
        <span className="flex items-center px-4">Page {page} sur {totalPages}</span>
        <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
