import { apiClient } from './client';
import { ApiResponse, Formation, PaginatedResponse } from '@/types/backend';

export class FormationService {
  /**
   * Obtenir toutes les formations actives (pour les membres)
   */
  async getFormations(token: string): Promise<ApiResponse<Formation[]>> {
    return apiClient.get<Formation[]>('/formations', token);
  }

  /**
   * Obtenir une formation spécifique par ID
   */
  async getFormationById(id: number, token: string): Promise<ApiResponse<Formation>> {
    return apiClient.get<Formation>(`/formations/${id}`, token);
  }
}

export const formationService = new FormationService();
