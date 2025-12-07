// Types pour les réponses API standardisées
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Interface Membre (40+ champs)
export interface Membre {
  id: number;
  username: string;
  code_adhesion: string;
  code_parrain?: string;
  nom: string;
  prenom: string;
  surnom?: string;
  sexe?: string;
  lieu_de_naissance?: string;
  date_de_naissance?: string;
  nom_pere?: string;
  nom_mere?: string;
  situation_matrimoniale?: string;
  nb_enfants?: number;
  nb_personnes_a_charge?: number;
  nin?: string;
  nif?: string;
  telephone_principal: string;
  telephone_etranger?: string;
  email?: string;
  telephone?: string;
  ville?: string;
  adresse_complete?: string;
  profession?: string;
  occupation?: string;
  departement?: string;
  commune?: string;
  section_communale?: string;
  facebook?: string;
  instagram?: string;
  a_ete_membre_politique?: boolean;
  role_politique_precedent?: string;
  nom_parti_precedent?: string;
  a_ete_membre_organisation?: boolean;
  role_organisation_precedent?: string;
  nom_organisation_precedente?: string;
  referent_nom?: string;
  referent_prenom?: string;
  referent_adresse?: string;
  referent_telephone?: string;
  relation_avec_referent?: string;
  a_ete_condamne?: boolean;
  a_violé_loi_drogue?: boolean;
  a_participe_activite_terroriste?: boolean;
  photo_profil_url?: string;
  password_hash?: string;
  role?: 'membre' | 'admin' | 'partner'; // Unifié
  role_utilisateur?: 'membre' | 'admin' | 'partner'; // Gardé pour rétrocompatibilité
  date_creation?: string;
  dernier_update?: string;
  statut?: string;
}

// Interface Cotisation
export interface Cotisation {
  id: number;
  membre_id: number;
  montant: number;
  moyen_paiement: 'moncash' | 'cash' | 'recu_upload';
  statut_paiement: 'en_attente' | 'validé' | 'rejeté';
  date_paiement?: string;
  recu?: string;
  url_recu?: string;
  admin_verificateur_id?: number;
  date_verification?: string;
  commentaire_verification?: string;
  date_creation?: string;
  membre?: Membre;
}

// Interface Formation
export interface Formation {
  id: number;
  titre: string;
  description?: string;
  niveau?: string;
  image_couverture_url?: string;
  est_active?: boolean;
  date_publication?: string;
  modules?: FormationModule[];
}

// Interface FormationModule
export interface FormationModule {
  id: number;
  formation_id: number;
  titre: string;
  description?: string;
  type_contenu?: string; // texte, video, image, mixte
  contenu_texte?: string; // Corps du cours (markdown/HTML)
  image_url?: string; // URL image principale du module
  video_url?: string; // URL vidéo (YouTube, fichier, etc.)
  ordre: number;
  quiz?: Quiz;
}

// Interface Quiz
export interface Quiz {
  id: number;
  titre: string;
  description?: string;
  module_id?: number;
  date_publication?: string;
  date_expiration?: string;
  questions?: QuizQuestion[];
}

// Interface QuizQuestion
export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string;
  points?: number;
}

// Interface QuizResultat
export interface QuizResultat {
  id: number;
  quiz_id: number;
  membre_id: number;
  score: number;
  date_completion: string;
  membre?: Membre;
}

// Interface Referral (Parrainage)
export interface Referral {
  id: number;
  parrain_id: number;
  filleul_id: number;
  points_attribues: number;
  date_creation: string;
  parrain?: Membre;
  filleul?: Membre;
}

// Interface pour les statistiques de parrainage
export interface ParrainageStats {
  parrain: Membre;
  filleuls: Array<{
    id: number;
    filleul: Membre;
    points_attribues: number;
    date_creation: string;
  }>;
  statistiques: {
    nombre_filleuls: number;
    points_total: number;
    points_base_par_filleul: number;
    points_bonus_par_paiement: number;
  };
}

// Interface Podcast
export interface Podcast {
  id: number;
  titre: string;
  description?: string;
  audio_url: string;
  cover_url?: string;
  categorie?: string;
  duree?: number;
  est_en_direct?: boolean;
  est_publie?: boolean;
  date_publication?: string;
  nombre_ecoutes?: number;
}

// Interface AuditLog
export interface AuditLog {
  id: number;
  user_id: number;
  action_type: string;
  target_type?: string;
  target_id?: number;
  data_before?: Record<string, unknown>;
  data_after?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: Membre;
}

// Interface pour les statistiques globales
export interface GlobalStats {
  total_membres: number;
  total_cotisations: number;
  total_revenus: number;
  cotisations_en_attente: number;
  nouveaux_membres_ce_mois: number;
  total_filleuls: number;
  total_points_parrainage: number;
  total_podcasts: number;
  total_quiz: number;
  total_formations: number;
}

// Interface pour les statistiques mensuelles
export interface MonthlyStatsItem {
  name: string; // Nom du mois (Jan, Fév, etc.)
  membres: number; // Nombre de nouveaux membres ce mois
  cotisations: number; // Nombre de cotisations validées ce mois
  montant: number; // Montant total collecté ce mois
}

export type MonthlyStats = MonthlyStatsItem[];

// Interface pour les statistiques par département
export interface DepartmentStatsItem {
  name: string; // Nom du département
  membres: number; // Nombre de membres dans ce département
}

export type DepartmentStats = DepartmentStatsItem[];

// Types pour l'authentification
export interface LoginRequest {
  identifier: string; // username, email ou téléphone
  password: string;
}

export interface LoginResponse {
  membre: Membre;
  token: string;
  refresh_token?: string;
}

// Types pour les requêtes paginées
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les filtres
export interface MembreFilters extends PaginatedRequest {
  role?: string;
  departement?: string;
}

export interface CotisationFilters extends PaginatedRequest {
  statut?: string;
  date_debut?: string;
  date_fin?: string;
  membre_id?: number;
}

export interface AuditLogFilters extends PaginatedRequest {
  action_type?: string;
  user_id?: number;
  date_debut?: string;
  date_fin?: string;
}

// Interface Don
export interface Don {
  id: number;
  membre_id: number;
  montant: number;
  moyen_paiement: 'moncash' | 'cash' | 'recu_upload';
  statut: 'en_attente' | 'approuvé' | 'rejeté';
  date_don?: string;
  recu?: string;
  url_recu?: string;
  admin_verificateur_id?: number;
  date_verification?: string;
  commentaire_verification?: string;
  date_creation?: string;
  membre?: Membre;
}

export interface DonFilters extends PaginatedRequest {
  statut?: string;
  date_debut?: string;
  date_fin?: string;
  membre_id?: number;
}

// Types pour les notifications
export interface NotificationRequest {
  title: string;
  body: string;
  target_type: 'all' | 'specific' | 'role';
  target_ids?: number[];
  target_role?: string;
  data?: Record<string, unknown>;
}

// Interface News (Articles)
export interface News {
  id: number;
  titre: string;
  slug: string;
  resume?: string;
  contenu: string;
  categorie?: string;
  image_couverture_url?: string;
  est_publie: boolean;
  date_publication?: string;
  auteur_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface NewsFilters extends PaginatedRequest {
  categorie?: string;
  onlyPublished?: boolean;
}

// Interface Annonce
export interface Annonce {
  id: number;
  titre: string;
  message: string;
  priorite: 'info' | 'important' | 'urgent';
  statut: 'brouillon' | 'publie' | 'archive';
  date_publication?: string;
  date_expiration?: string;
  auteur_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AnnonceFilters extends PaginatedRequest {
  statut?: string;
  priorite?: string;
}
