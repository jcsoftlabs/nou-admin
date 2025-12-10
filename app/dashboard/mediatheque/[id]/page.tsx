'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { albumService } from '@/lib/api/albumService';
import type { Album, AlbumPhoto } from '@/types/album';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';

export default function AlbumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [legendes, setLegendes] = useState<string[]>([]);

  useEffect(() => {
    loadAlbum();
  }, [params.id]);

  const loadAlbum = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await albumService.getAlbumById(Number(params.id), token);
      
      if (response.success && response.data) {
        setAlbum(response.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setLegendes(new Array(files.length).fill(''));
  };

  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0) {
      alert('Veuillez sélectionner au moins une photo');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await albumService.addPhotos(
        Number(params.id),
        selectedFiles,
        legendes,
        token
      );

      if (response.success) {
        alert(`${selectedFiles.length} photo(s) ajoutée(s) avec succès`);
        setSelectedFiles([]);
        setLegendes([]);
        loadAlbum();
      } else {
        alert(response.message || 'Erreur lors de l\'ajout des photos');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout des photos');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

    try {
      const token = localStorage.getItem('token') || '';
      const response = await albumService.deletePhoto(photoId, token);

      if (response.success) {
        alert('Photo supprimée avec succès');
        loadAlbum();
      } else {
        alert(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  if (!album) {
    return <div className="p-6 text-center">Album non trouvé</div>;
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      {/* Album Info */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{album.titre}</h1>
            {album.date_evenement && (
              <p className="text-gray-600 mb-1">
                {new Date(album.date_evenement).toLocaleDateString('fr-FR')}
              </p>
            )}
            {album.lieu_evenement && (
              <p className="text-gray-500">{album.lieu_evenement}</p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/mediatheque/edit/${album.id}`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>

        {album.description && (
          <p className="text-gray-700 mb-4">{album.description}</p>
        )}

        {album.image_couverture && (
          <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
            <Image
              src={albumService.getImageUrl(album.image_couverture)}
              alt={album.titre}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ajouter des photos</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="photos">Sélectionner les photos (max 50)</Label>
            <Input
              id="photos"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <p className="font-semibold">{selectedFiles.length} photo(s) sélectionnée(s)</p>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm">{file.name}</span>
                  <Input
                    placeholder="Légende (optionnel)"
                    value={legendes[index] || ''}
                    onChange={(e) => {
                      const newLegendes = [...legendes];
                      newLegendes[index] = e.target.value;
                      setLegendes(newLegendes);
                    }}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleUploadPhotos}
            disabled={uploading || selectedFiles.length === 0}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Upload en cours...' : 'Ajouter les photos'}
          </Button>
        </div>
      </div>

      {/* Photos Gallery */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Photos ({album.photos?.length || 0})
        </h2>

        {!album.photos || album.photos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucune photo dans cet album
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {album.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group border rounded-lg overflow-hidden"
              >
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={albumService.getImageUrl(photo.url_photo)}
                    alt={photo.legende || 'Photo'}
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {photo.legende && (
                  <div className="p-2 text-sm text-gray-700">
                    {photo.legende}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
