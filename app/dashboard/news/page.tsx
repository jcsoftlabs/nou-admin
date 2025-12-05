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
import { Newspaper, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { newsService } from '@/lib/api';
import { News } from '@/types/backend';

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [categorieFilter, setCategorieFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    slug: '',
    resume: '',
    contenu: '',
    categorie: '',
    image_couverture_url: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

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
      loadNews();
    }
  }, [page, token]);

  const loadNews = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const result = await newsService.getNewsList(
        {
          page,
          limit: 20,
          categorie: categorieFilter || undefined,
          onlyPublished: publishedFilter === 'published' ? true : publishedFilter === 'draft' ? false : undefined,
        },
        token
      );

      if (result.success && result.data) {
        // L'API peut renvoyer soit { data: [...], pagination: {...} } soit directement un tableau
        if (Array.isArray(result.data)) {
          setNews(result.data);
          setTotalPages(1);
        } else if (result.data.data && result.data.pagination) {
          setNews(result.data.data);
          setTotalPages(result.data.pagination.totalPages);
        } else {
          setNews([]);
          setTotalPages(1);
        }
      } else {
        setError(result.message || 'Impossible de charger les articles.');
        setNews([]);
      }
    } catch (err) {
      console.error('Erreur chargement news:', err);
      setError('Une erreur critique est survenue.');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadNews();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await newsService.updateNews(editingNews.id, formData, token);
      } else {
        // Si un fichier image est sélectionné, utiliser l'upload avec image
        if (coverFile) {
          await newsService.createNewsWithImage(formData, coverFile, token);
        } else {
          await newsService.createNews(formData, token);
        }
      }
      setIsDialogOpen(false);
      setEditingNews(null);
      resetForm();
      loadNews();
    } catch (err) {
      console.error('Erreur sauvegarde article:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article?')) return;
    try {
      await newsService.deleteNews(id, token);
      loadNews();
    } catch (err) {
      console.error('Erreur suppression article:', err);
    }
  };

  const handlePublish = async (id: number, isPublished: boolean) => {
    try {
      if (isPublished) {
        await newsService.unpublishNews(id, token);
      } else {
        await newsService.publishNews(id, token);
      }
      loadNews();
    } catch (err) {
      console.error('Erreur publication article:', err);
    }
  };

  const openEditDialog = (article: News) => {
    setEditingNews(article);
    setFormData({
      titre: article.titre,
      slug: article.slug,
      resume: article.resume || '',
      contenu: article.contenu,
      categorie: article.categorie || '',
      image_couverture_url: article.image_couverture_url || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      slug: '',
      resume: '',
      contenu: '',
      categorie: '',
      image_couverture_url: '',
    });
    setCoverFile(null);
  };

  if (loading && news.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadNews} className="mt-4">
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
            <Newspaper className="h-8 w-8" />
            Articles de News
          </h1>
          <p className="text-muted-foreground">Gérez les articles d&apos;actualités</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingNews(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNews ? 'Modifier' : 'Créer'} un article</DialogTitle>
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
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="mon-article-slug"
                  required
                />
              </div>
              <div>
                <Label htmlFor="resume">Résumé</Label>
                <Textarea
                  id="resume"
                  value={formData.resume}
                  onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="contenu">Contenu *</Label>
                <Textarea
                  id="contenu"
                  value={formData.contenu}
                  onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                  rows={10}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categorie">Catégorie</Label>
                <Input
                  id="categorie"
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  placeholder="Politique, Économie, Culture..."
                />
              </div>
              <div>
                <Label htmlFor="coverFile">Image de couverture (upload)</Label>
                <Input
                  id="coverFile"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  disabled={!!editingNews}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formats acceptés: JPG, PNG, WEBP (max 5MB)
                  {editingNews && " - L'upload n'est disponible que lors de la création"}
                </p>
              </div>
              {formData.image_couverture_url && (
                <div>
                  <Label htmlFor="image">URL actuelle de l&apos;image</Label>
                  <Input
                    id="image"
                    value={formData.image_couverture_url}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingNews ? 'Mettre à jour' : 'Créer'}
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
              <Label>Catégorie</Label>
              <Input
                placeholder="Filtrer par catégorie"
                value={categorieFilter}
                onChange={(e) => setCategorieFilter(e.target.value)}
              />
            </div>
            <div>
              <Label>Statut de publication</Label>
              <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
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
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date publication</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.length > 0 ? (
                news.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{article.titre}</p>
                        <p className="text-xs text-muted-foreground">{article.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {article.categorie ? (
                        <Badge variant="outline">{article.categorie}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.est_publie ? 'default' : 'secondary'}>
                        {article.est_publie ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {article.date_publication
                        ? new Date(article.date_publication).toLocaleDateString('fr-FR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePublish(article.id, article.est_publie)}
                        >
                          {article.est_publie ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(article)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Aucun article trouvé.
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
