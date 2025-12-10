export interface Album {
  id: number;
  titre: string;
  description: string | null;
  date_evenement: string | null;
  lieu_evenement: string | null;
  image_couverture: string | null;
  est_public: boolean;
  ordre: number;
  auteur_id: number;
  created_at: string;
  updated_at: string;
  auteur?: {
    id: number;
    nom: string;
    prenom: string;
  };
  photos?: AlbumPhoto[];
}

export interface AlbumPhoto {
  id: number;
  album_id: number;
  url_photo: string;
  legende: string | null;
  ordre: number;
  created_at: string;
}

export interface AlbumFormData {
  titre: string;
  description?: string;
  date_evenement?: string;
  lieu_evenement?: string;
  est_public?: boolean;
  ordre?: number;
  image_couverture?: File;
}

// Type pour la réponse paginée des albums (sans wrapper ApiResponse)
export interface PaginatedAlbumsData {
  data: Album[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AlbumFilters {
  page?: number;
  limit?: number;
  est_public?: boolean;
  annee?: number;
  include_photos?: boolean;
}
