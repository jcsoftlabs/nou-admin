'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { albumService } from '@/lib/api/albumService';
import type { Album } from '@/types/album';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
import Image from 'next/image';

export default function MediathequePage() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAlbums();
  }, [page]);

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await albumService.getAlbums({ page, limit: 12 }, token);
      
      if (response.success && response.data) {
        setAlbums(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setAlbums([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet album ?')) return;

    try {
      const token = localStorage.getItem('token') || '';
      const response = await albumService.deleteAlbum(id, token);
      
      if (response.success) {
        alert('Album supprimé avec succès');
        loadAlbums();
      } else {
        alert(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredAlbums = (albums || []).filter((album) =>
    album.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.lieu_evenement?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Médiathèque</h1>
          <p className="text-gray-500 mt-1">Gérez les albums photo des événements</p>
        </div>
        <Button onClick={() => router.push('/dashboard/mediatheque/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel album
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Rechercher un album..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Albums Grid */}
      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : filteredAlbums.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? 'Aucun album trouvé' : 'Aucun album pour le moment'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-48 bg-gray-200">
                {album.image_couverture ? (
                  <Image
                    src={albumService.getImageUrl(album.image_couverture)}
                    alt={album.titre}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Pas d'image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 truncate">{album.titre}</h3>
                {album.date_evenement && (
                  <p className="text-sm text-gray-600 mb-1">
                    {new Date(album.date_evenement).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {album.lieu_evenement && (
                  <p className="text-sm text-gray-500 mb-3 truncate">{album.lieu_evenement}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/mediatheque/${album.id}`)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/mediatheque/edit/${album.id}`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(album.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="px-4 py-2">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
