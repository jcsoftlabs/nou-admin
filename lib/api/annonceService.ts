import { apiClient } from './client';
import { ApiResponse, Annonce, AnnonceFilters, PaginatedResponse } from '@/types/backend';

export class AnnonceService {
  /**
   * Obtenir la liste des annonces avec filtres (admin)
   */
  async getAnnonces(
    filters: AnnonceFilters,
    token: string
  ): Promise<ApiResponse<PaginatedResponse<Annonce>>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.statut) params.append('statut', filters.statut);
    if (filters.priorite) params.append('priorite', filters.priorite);

    const queryString = params.toString();
    return apiClient.get<PaginatedResponse<Annonce>>(
      `/admin/annonces${queryString ? `?${queryString}` : ''}`,
      token
    );
  }

  /**
   * Créer une annonce
   */
  async createAnnonce(
    data: Partial<Annonce>,
    token: string
  ): Promise<ApiResponse<Annonce>> {
    return apiClient.post<Annonce>('/admin/annonces', data, token);
  }

  /**
   * Mettre à jour une annonce
   */
  async updateAnnonce(
    id: number,
    data: Partial<Annonce>,
    token: string
  ): Promise<ApiResponse<Annonce>> {
    return apiClient.put<Annonce>(`/admin/annonces/${id}`, data, token);
  }

  /**
   * Changer le statut d'une annonce
   */
  async changeAnnonceStatus(
    id: number,
    statut: 'brouillon' | 'publie' | 'archive',
    token: string
  ): Promise<ApiResponse<Annonce>> {
    return apiClient.put<Annonce>(`/admin/annonces/${id}/status`, { statut }, token);
  }
}

export const annonceService = new AnnonceService();
