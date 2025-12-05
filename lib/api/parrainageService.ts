import { apiClient } from './client';
import { ApiResponse, ParrainageStats } from '@/types/backend';

export class ParrainageService {
  /**
   * Obtenir les statistiques de parrainage d'un membre
   */
  async getStats(parrainId: number, token: string): Promise<ApiResponse<ParrainageStats>> {
    return apiClient.get<ParrainageStats>(`/parrainage/stats?parrain_id=${parrainId}`, token);
  }

  /**
   * Obtenir la liste des filleuls d'un parrain
   */
  async getFilleuls(token: string): Promise<ApiResponse<ParrainageStats>> {
    return apiClient.get<ParrainageStats>('/parrainage/filleuls', token);
  }

  /**
   * Ajuster manuellement les points d'un referral (admin seulement)
   */
  async adjustPoints(
    referralId: number,
    points: number,
    raison: string,
    token: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put<{ success: boolean }>(
      `/referrals/${referralId}/adjust-points`,
      { points, raison },
      token
    );
  }
}

export const parrainageService = new ParrainageService();
