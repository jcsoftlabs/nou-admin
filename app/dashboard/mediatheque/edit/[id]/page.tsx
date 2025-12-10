'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { albumService } from '@/lib/api/albumService';
import type { Album } from '@/types/album';
import { AlbumForm } from '@/components/mediatheque/AlbumForm';

export default function EditAlbumPage() {
  const params = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlbum();
  }, [params.id]);

  const loadAlbum = async () => {
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

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  if (!album) {
    return <div className="p-6 text-center">Album non trouvé</div>;
  }

  return <AlbumForm initialData={album} isEdit />;
}
