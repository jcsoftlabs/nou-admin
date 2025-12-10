'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { albumService } from '@/lib/api/albumService';
import type { Album, AlbumFormData } from '@/types/album';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface AlbumFormProps {
  initialData?: Album;
  isEdit?: boolean;
}

export function AlbumForm({ initialData, isEdit = false }: AlbumFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_couverture ? albumService.getImageUrl(initialData.image_couverture) : null
  );
  
  const [formData, setFormData] = useState<AlbumFormData>({
    titre: initialData?.titre || '',
    description: initialData?.description || '',
    date_evenement: initialData?.date_evenement || '',
    lieu_evenement: initialData?.lieu_evenement || '',
    est_public: initialData?.est_public ?? true,
    ordre: initialData?.ordre || 0,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image_couverture: file });
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token') || '';
      
      if (isEdit && initialData) {
        const response = await albumService.updateAlbum(initialData.id, formData, token);
        if (response.success) {
          alert('Album mis à jour avec succès');
          router.push(`/dashboard/mediatheque/${initialData.id}`);
        } else {
          alert(response.message || 'Erreur lors de la mise à jour');
        }
      } else {
        const response = await albumService.createAlbum(formData, token);
        if (response.success) {
          alert('Album créé avec succès');
          router.push('/dashboard/mediatheque');
        } else {
          alert(response.message || 'Erreur lors de la création');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? 'Modifier l\'album' : 'Nouvel album'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="titre">Titre *</Label>
          <Input
            id="titre"
            value={formData.titre}
            onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
            required
            placeholder="Congrès National 2024"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Description de l'événement..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date_evenement">Date de l'événement</Label>
            <Input
              id="date_evenement"
              type="date"
              value={formData.date_evenement}
              onChange={(e) => setFormData({ ...formData, date_evenement: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="lieu_evenement">Lieu</Label>
            <Input
              id="lieu_evenement"
              value={formData.lieu_evenement}
              onChange={(e) => setFormData({ ...formData, lieu_evenement: e.target.value })}
              placeholder="Port-au-Prince"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="image_couverture">Image de couverture</Label>
          <Input
            id="image_couverture"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="mt-4 relative h-48 w-full rounded-lg overflow-hidden">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="est_public"
              checked={formData.est_public}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, est_public: checked as boolean })
              }
            />
            <Label htmlFor="est_public" className="cursor-pointer">
              Album public
            </Label>
          </div>

          <div className="flex-1">
            <Label htmlFor="ordre">Ordre d'affichage</Label>
            <Input
              id="ordre"
              type="number"
              value={formData.ordre}
              onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
              className="w-24"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'album'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
