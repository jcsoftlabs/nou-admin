import { apiClient } from './client';
import {
  ApiResponse,
  GlobalStats,
  MonthlyStats,
  DepartmentStats,
  Membre,
  Cotisation,
  Podcast,
  Quiz,
  Formation,
  FormationModule,
  AuditLog,
  MembreFilters,
  CotisationFilters,
  AuditLogFilters,
  PaginatedResponse,
  NotificationRequest,
  Don,
  DonFilters,
} from '@/types/backend';

export class AdminService {
  /**
   * Obtenir les statistiques globales
   */
  async getStats(token: string): Promise<ApiResponse<GlobalStats>> {
    return apiClient.get<GlobalStats>('/admin/stats', token);
  }

  /**
   * Obtenir les statistiques mensuelles (6 derniers mois)
   */
  async getMonthlyStats(token: string): Promise<ApiResponse<MonthlyStats>> {
    return apiClient.get<MonthlyStats>('/admin/stats/monthly', token);
  }

  /**
   * Obtenir les statistiques par département
   */
  async getDepartmentStats(token: string): Promise<ApiResponse<DepartmentStats>> {
    return apiClient.get<DepartmentStats>('/admin/stats/departments', token);
  }

  /**
   * Obtenir la liste des statuts disponibles
   */
  async getStatuts(token: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/admin/statuts', token);
  }

  /**
   * Obtenir la liste des membres avec filtres
   */
  async getMembres(
    filters: MembreFilters,
    token: string
  ): Promise<ApiResponse<PaginatedResponse<Membre>>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.departement) params.append('departement', filters.departement);

    return apiClient.get<PaginatedResponse<Membre>>(
      `/admin/membres?${params.toString()}`,
      token
    );
  }

  /**
   * Obtenir un membre par son ID
   */
  async getMembreById(
    id: string,
    token: string
  ): Promise<ApiResponse<Membre>> {
    return apiClient.get<Membre>(`/admin/membres/${id}`, token);
  }

  /**
   * Créer un nouveau membre
   */
  async createMembre(
    data: Omit<Membre, 'id' | 'statut' | 'code_adhesion'>,
    token: string
  ): Promise<ApiResponse<Membre>> {
    return apiClient.post<Membre>('/admin/membres', data, token);
  }

  /**
   * Mettre à jour le statut d'un membre
   */
  async updateMembreStatus(
    id: number,
    statut: string,
    token: string
  ): Promise<ApiResponse<Membre>> {
    return apiClient.put<Membre>(`/admin/membres/${id}/status`, { statut }, token);
  }

  /**
   * Obtenir la liste des cotisations avec filtres
   */
  async getCotisations(
    filters: CotisationFilters,
    token: string
  ): Promise<ApiResponse<PaginatedResponse<Cotisation>>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.statut) params.append('statut', filters.statut);
    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);
    if (filters.membre_id) params.append('membre_id', filters.membre_id.toString());

    return apiClient.get<PaginatedResponse<Cotisation>>(
      `/admin/cotisations?${params.toString()}`,
      token
    );
  }

  /**
   * Valider une cotisation
   */
  async validerCotisation(
    id: number,
    montant: number,
    commentaire: string | undefined,
    token: string
  ): Promise<ApiResponse<Cotisation>> {
    return apiClient.put<Cotisation>(
      `/admin/cotisations/${id}/valider`,
      { montant, commentaire },
      token
    );
  }

  /**
   * Rejeter une cotisation
   */
  async rejeterCotisation(
    id: number,
    commentaire: string,
    token: string
  ): Promise<ApiResponse<Cotisation>> {
    return apiClient.put<Cotisation>(
      `/admin/cotisations/${id}/rejeter`,
      { commentaire },
      token
    );
  }

  /**
   * Obtenir la liste des podcasts
   */
  async getPodcasts(
    page: number = 1,
    limit: number = 20,
    est_en_direct?: boolean,
    token?: string
  ): Promise<ApiResponse<PaginatedResponse<Podcast>>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (est_en_direct !== undefined) {
      params.append('est_en_direct', est_en_direct.toString());
    }

    return apiClient.get<PaginatedResponse<Podcast>>(
      `/admin/podcasts?${params.toString()}`,
      token
    );
  }

  /**
   * Upload un nouveau podcast
   */
  async uploadPodcast(
    data: {
      titre: string;
      description?: string;
      categorie?: string;
      duree?: number;
      date_publication?: string;
      est_en_direct?: boolean;
    },
    audioFile: File,
    coverFile?: File,
    token?: string
  ): Promise<ApiResponse<Podcast>> {
    const formData = new FormData();
    formData.append('titre', data.titre);
    if (data.description) formData.append('description', data.description);
    if (data.categorie) formData.append('categorie', data.categorie);
    if (data.duree) formData.append('duree', data.duree.toString());
    if (data.date_publication) formData.append('date_publication', data.date_publication);
    if (data.est_en_direct !== undefined) {
      formData.append('est_en_direct', data.est_en_direct.toString());
    }
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);

    return apiClient.uploadFile<Podcast>('/admin/podcasts/upload', formData, token);
  }

  /**
   * Mettre à jour un podcast
   */
  async updatePodcast(
    id: number,
    data: {
      titre?: string;
      description?: string;
    },
    audioFile?: File,
    coverFile?: File,
    token?: string
  ): Promise<ApiResponse<Podcast>> {
    const formData = new FormData();
    if (data.titre) formData.append('titre', data.titre);
    if (data.description) formData.append('description', data.description);
    if (audioFile) formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);

    return apiClient.uploadFile<Podcast>(`/admin/podcasts/${id}`, formData, token, 'PUT');
  }

  /**
   * Supprimer un podcast
   */
  async deletePodcast(id: number, token: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/podcasts/${id}`, token);
  }

  /**
   * Incrémenter le compteur d'écoutes d'un podcast (public)
   */
  async incrementPodcastListen(id: number): Promise<ApiResponse<{ id: number; nombre_ecoutes: number }>> {
    return apiClient.post<{ id: number; nombre_ecoutes: number }>(`/podcasts/${id}/listen`);
  }

  /**
   * Publier/Dépublier un podcast
   */
  async togglePodcastPublish(
    id: number,
    est_publie: boolean,
    token: string
  ): Promise<ApiResponse<Podcast>> {
    return apiClient.put<Podcast>(`/admin/podcasts/${id}/publish`, { est_publie }, token);
  }

  /**
   * Obtenir la liste des quiz
   */
  async getQuiz(
    page: number = 1,
    limit: number = 20,
    actif?: boolean,
    token?: string
  ): Promise<ApiResponse<PaginatedResponse<Quiz>>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (actif !== undefined) params.append('actif', actif.toString());

    return apiClient.get<PaginatedResponse<Quiz>>(
      `/admin/quiz?${params.toString()}`,
      token
    );
  }

  /**
   * Créer un nouveau quiz
   */
  async createQuiz(
    data: {
      titre: string;
      description?: string;
      date_publication?: string;
      date_expiration?: string;
      module_id?: number;
    },
    token: string
  ): Promise<ApiResponse<Quiz>> {
    return apiClient.post<Quiz>('/admin/quiz', data, token);
  }

  /**
   * Mettre à jour un quiz
   */
  async updateQuiz(
    id: number,
    data: Partial<Quiz>,
    token: string
  ): Promise<ApiResponse<Quiz>> {
    return apiClient.put<Quiz>(`/admin/quiz/${id}`, data, token);
  }

  /**
   * Supprimer un quiz
   */
  async deleteQuiz(id: number, token: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/quiz/${id}`, token);
  }

  /**
   * Obtenir la liste des formations
   */
  async getFormations(
    page: number = 1,
    limit: number = 20,
    est_active?: boolean,
    token?: string
  ): Promise<ApiResponse<PaginatedResponse<Formation>>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (est_active !== undefined) {
      params.append('est_active', est_active.toString());
    }

    return apiClient.get<PaginatedResponse<Formation>>(
      `/admin/formations?${params.toString()}`,
      token
    );
  }

  /**
   * Créer une nouvelle formation
   */
  async createFormation(
    data: {
      titre: string;
      description?: string;
      niveau?: string;
      image_couverture_url?: string;
      est_active?: boolean;
      date_publication?: string;
    },
    token: string
  ): Promise<ApiResponse<Formation>> {
    return apiClient.post<Formation>('/admin/formations', data, token);
  }

  /**
   * Mettre à jour une formation
   */
  async updateFormation(
    id: number,
    data: Partial<Formation>,
    token: string
  ): Promise<ApiResponse<Formation>> {
    return apiClient.put<Formation>(`/admin/formations/${id}`,
      data, token);
  }

  /**
   * Supprimer une formation
   */
  async deleteFormation(id: number, token: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/formations/${id}`, token);
  }
  /**
   * Créer un module pour une formation
   */
  async createModule(
    formationId: number,
    data: {
      titre: string;
      description?: string;
      ordre: number;
      type_contenu?: string;
      contenu_texte?: string;
      image_url?: string;
      video_url?: string;
    },
    token: string
  ): Promise<ApiResponse<FormationModule>> {
    return apiClient.post<FormationModule>(
      `/admin/formations/${formationId}/modules`,
      data,
      token
    );
  }

  /**
   * Mettre à jour un module de formation
   */
  async updateModule(
    moduleId: number,
    data: {
      titre?: string;
      description?: string;
      ordre?: number;
      type_contenu?: string;
      contenu_texte?: string;
      image_url?: string;
      video_url?: string;
    },
    token: string
  ): Promise<ApiResponse<FormationModule>> {
    return apiClient.put<FormationModule>(
      `/admin/modules/${moduleId}`,
      data,
      token
    );
  }

  /**
   * Associer un quiz à un module
   */
  async attachQuizToModule(
    quizId: number,
    moduleId: number,
    token: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      '/admin/modules/attach-quiz',
      { quizId, moduleId },
      token
    );
  }

  /**
   * Envoyer une notification push
   */
  async sendNotification(
    data: NotificationRequest,
    token: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/admin/notifications/send', data, token);
  }

  /**
   * Obtenir les logs d'audit
   */
  async getAuditLogs(
    filters: AuditLogFilters,
    token: string
  ): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.action_type) params.append('action_type', filters.action_type);
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);

    return apiClient.get<PaginatedResponse<AuditLog>>(
      `/admin/auditlogs?${params.toString()}`,
      token
    );
  }

  /**
   * Obtenir la liste des dons avec filtres
   */
  async getDons(
    filters: DonFilters,
    token: string
  ): Promise<ApiResponse<PaginatedResponse<Don>>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.statut) params.append('statut', filters.statut);
    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);
    if (filters.membre_id) params.append('membre_id', filters.membre_id.toString());

    return apiClient.get<PaginatedResponse<Don>>(
      `/admin/dons?${params.toString()}`,
      token
    );
  }

  /**
   * Approuver un don
   */
  async approuverDon(
    id: number,
    commentaire: string | undefined,
    token: string
  ): Promise<ApiResponse<Don>> {
    return apiClient.put<Don>(
      `/admin/dons/${id}/approuver`,
      { commentaire },
      token
    );
  }

  /**
   * Rejeter un don
   */
  async rejeterDon(
    id: number,
    commentaire: string,
    token: string
  ): Promise<ApiResponse<Don>> {
    return apiClient.put<Don>(
      `/admin/dons/${id}/rejeter`,
      { commentaire },
      token
    );
  }
}

export const adminService = new AdminService();
