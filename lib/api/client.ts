import { ApiResponse } from '@/types/backend';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { token, headers, ...restOptions } = options;

    const config: RequestInit = {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          return {
            success: false,
            message: 'Réponse du serveur invalide',
          };
        }
      } else {
        const text = await response.text();
        return {
          success: false,
          message: text || 'Réponse du serveur invalide',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Une erreur est survenue',
          errors: data.errors,
        };
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }

  async uploadFile<T>(
    endpoint: string,
    formData: FormData,
    token?: string,
    method: 'POST' | 'PUT' = 'POST'
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          return {
            success: false,
            message: 'Réponse du serveur invalide',
          };
        }
      } else {
        const text = await response.text();
        return {
          success: false,
          message: text || 'Réponse du serveur invalide',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Une erreur est survenue',
          errors: data.errors,
        };
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'upload du fichier',
      };
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const apiClient = new ApiClient(API_URL);
