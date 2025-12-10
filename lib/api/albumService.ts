import { apiClient } from './client';
import type {
  Album,
  AlbumPhoto,
  AlbumFormData,
  PaginatedAlbumsResponse,
  AlbumResponse,
  PhotosResponse,
  AlbumFilters,
} from '@/types/album';

/**
 * Service pour gérer les albums et leurs photos
 */
export const albumService = {
  /**
   * Récupérer tous les albums avec pagination et filtres
   */
  async getAlbums(
    filters: AlbumFilters = {},
    token?: string
  ): Promise<PaginatedAlbumsResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.est_public !== undefined) params.append('est_public', filters.est_public.toString());
    if (filters.annee) params.append('annee', filters.annee.toString());
    if (filters.include_photos) params.append('include_photos', 'true');
    
    const queryString = params.toString();
    const endpoint = `/albums${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PaginatedAlbumsResponse>(endpoint, token);
  },

  /**
   * Récupérer un album par son ID avec toutes ses photos
   */
  async getAlbumById(id: number, token?: string): Promise<AlbumResponse> {
    return apiClient.get<AlbumResponse>(`/albums/${id}`, token);
  },

  /**
   * Créer un nouvel album (Admin)
   */
  async createAlbum(data: AlbumFormData, token: string): Promise<AlbumResponse> {
    const formData = new FormData();
    
    formData.append('titre', data.titre);
    if (data.description) formData.append('description', data.description);
    if (data.date_evenement) formData.append('date_evenement', data.date_evenement);
    if (data.lieu_evenement) formData.append('lieu_evenement', data.lieu_evenement);
    formData.append('est_public', data.est_public !== undefined ? String(data.est_public) : 'true');
    if (data.ordre !== undefined) formData.append('ordre', String(data.ordre));
    if (data.image_couverture) formData.append('image_couverture', data.image_couverture);

    return apiClient.uploadFile<AlbumResponse>('/albums/admin', formData, token, 'POST');
  },

  /**
   * Mettre à jour un album (Admin)
   */
  async updateAlbum(id: number, data: AlbumFormData, token: string): Promise<AlbumResponse> {
    const formData = new FormData();
    
    if (data.titre) formData.append('titre', data.titre);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.date_evenement !== undefined) formData.append('date_evenement', data.date_evenement);
    if (data.lieu_evenement !== undefined) formData.append('lieu_evenement', data.lieu_evenement);
    if (data.est_public !== undefined) formData.append('est_public', String(data.est_public));
    if (data.ordre !== undefined) formData.append('ordre', String(data.ordre));
    if (data.image_couverture) formData.append('image_couverture', data.image_couverture);

    return apiClient.uploadFile<AlbumResponse>(`/albums/admin/${id}`, formData, token, 'PUT');
  },

  /**
   * Supprimer un album (Admin)
   */
  async deleteAlbum(id: number, token: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete<{ success: boolean; message?: string }>(`/albums/admin/${id}`, token);
  },

  /**
   * Ajouter des photos à un album (Admin)
   */
  async addPhotos(
    albumId: number,
    photos: File[],
    legendes: string[] = [],
    token: string
  ): Promise<PhotosResponse> {
    const formData = new FormData();
    
    photos.forEach((photo) => {
      formData.append('photos', photo);
    });
    
    if (legendes.length > 0) {
      formData.append('legendes', JSON.stringify(legendes));
    }

    return apiClient.uploadFile<PhotosResponse>(`/albums/admin/${albumId}/photos`, formData, token, 'POST');
  },

  /**
   * Mettre à jour une photo (Admin)
   */
  async updatePhoto(
    photoId: number,
    data: { legende?: string; ordre?: number },
    token: string
  ): Promise<{ success: boolean; data: AlbumPhoto; message?: string }> {
    return apiClient.put<{ success: boolean; data: AlbumPhoto; message?: string }>(
      `/albums/admin/photos/${photoId}`,
      data,
      token
    );
  },

  /**
   * Supprimer une photo (Admin)
   */
  async deletePhoto(photoId: number, token: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete<{ success: boolean; message?: string }>(`/albums/admin/photos/${photoId}`, token);
  },

  /**
   * Réordonner les photos d'un album (Admin)
   */
  async reorderPhotos(
    albumId: number,
    ordres: Array<{ photo_id: number; ordre: number }>,
    token: string
  ): Promise<AlbumResponse> {
    return apiClient.put<AlbumResponse>(
      `/albums/admin/${albumId}/photos/reorder`,
      { ordres },
      token
    );
  },

  /**
   * Helper pour obtenir l'URL complète d'une image
   * Note: Les URLs Cloudinary sont déjà complètes, pas besoin de préfixe
   */
  getImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    
    // Si c'est déjà une URL complète (Cloudinary), la retourner telle quelle
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    // Sinon, c'est un chemin local (dev), ajouter le préfixe de l'API
    return `${apiClient.getBaseUrl()}${relativePath}`;
  },
};
