import { apiClient } from './client';
import { ApiResponse, News, NewsFilters, PaginatedResponse } from '@/types/backend';

export class NewsService {
  /**
   * Obtenir la liste des articles avec filtres (admin)
   */
  async getNewsList(
    filters: NewsFilters,
    token: string
  ): Promise<ApiResponse<PaginatedResponse<News>>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.categorie) params.append('categorie', filters.categorie);
    if (filters.onlyPublished !== undefined) {
      params.append('onlyPublished', filters.onlyPublished.toString());
    }

    const queryString = params.toString();
    return apiClient.get<PaginatedResponse<News>>(
      `/admin/news${queryString ? `?${queryString}` : ''}`,
      token
    );
  }

  /**
   * Créer un article
   */
  async createNews(
    data: Partial<News>,
    token: string
  ): Promise<ApiResponse<News>> {
    return apiClient.post<News>('/admin/news', data, token);
  }

  /**
   * Créer un article avec upload d'image
   */
  async createNewsWithImage(
    data: Partial<News>,
    coverFile: File,
    token: string
  ): Promise<ApiResponse<News>> {
    const formData = new FormData();
    formData.append('cover', coverFile);
    formData.append('titre', data.titre || '');
    if (data.slug) formData.append('slug', data.slug);
    if (data.resume) formData.append('resume', data.resume);
    formData.append('contenu', data.contenu || '');
    if (data.categorie) formData.append('categorie', data.categorie);
    if (data.est_publie !== undefined) formData.append('est_publie', String(data.est_publie));

    return apiClient.uploadFile<News>('/admin/news', formData, token);
  }

  /**
   * Mettre à jour un article
   */
  async updateNews(
    id: number,
    data: Partial<News>,
    token: string
  ): Promise<ApiResponse<News>> {
    return apiClient.put<News>(`/admin/news/${id}`, data, token);
  }

  /**
   * Supprimer un article (soft delete)
   */
  async deleteNews(id: number, token: string): Promise<ApiResponse<News>> {
    return apiClient.delete<News>(`/admin/news/${id}`, token);
  }

  /**
   * Publier un article
   */
  async publishNews(id: number, token: string): Promise<ApiResponse<News>> {
    return apiClient.put<News>(`/admin/news/${id}/publish`, {}, token);
  }

  /**
   * Dépublier un article
   */
  async unpublishNews(id: number, token: string): Promise<ApiResponse<News>> {
    return apiClient.put<News>(`/admin/news/${id}/unpublish`, {}, token);
  }
}

export const newsService = new NewsService();
