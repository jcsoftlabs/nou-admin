# Gestion des Dons - Documentation

## Vue d'ensemble

La fonctionnalité de gestion des dons permet aux administrateurs de visualiser, approuver et rejeter les dons effectués par les membres de l'organisation NOU.

## Fonctionnalités implémentées

### 1. Liste des dons
- **Affichage paginé** : Liste de tous les dons avec pagination (20 dons par page)
- **Informations affichées** :
  - Nom du membre donateur
  - Montant du don (en HTG)
  - Moyen de paiement (MonCash, Cash, ou Reçu uploadé)
  - Date du don
  - Statut actuel (En attente, Approuvé, Rejeté)
  - Lien vers le reçu (si disponible)

### 2. Filtres de recherche
Les administrateurs peuvent filtrer les dons par :
- **Statut** : Tous, En attente, Approuvé, Rejeté
- **Date début** : Date de début de la période
- **Date fin** : Date de fin de la période

### 3. Actions administratives

#### Approuver un don
- Disponible uniquement pour les dons "En attente"
- Permet d'ajouter un commentaire optionnel
- Met à jour le statut à "Approuvé"
- Enregistre la date de vérification et l'ID de l'admin

#### Rejeter un don
- Disponible uniquement pour les dons "En attente"
- **Requiert obligatoirement un commentaire** expliquant le motif du rejet
- Met à jour le statut à "Rejeté"
- Enregistre la date de vérification et l'ID de l'admin

### 4. Vue détaillée
- Affichage complet des informations du don
- Visualisation du reçu uploadé (lien direct)
- Historique de vérification :
  - Date de vérification
  - Commentaire de l'administrateur

## Structure technique

### Types TypeScript

```typescript
// types/backend.ts
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
```

### Services API

```typescript
// lib/api/adminService.ts

// Obtenir la liste des dons avec filtres
async getDons(filters: DonFilters, token: string): Promise<ApiResponse<PaginatedResponse<Don>>>

// Approuver un don
async approuverDon(id: number, commentaire: string | undefined, token: string): Promise<ApiResponse<Don>>

// Rejeter un don
async rejeterDon(id: number, commentaire: string, token: string): Promise<ApiResponse<Don>>
```

### Endpoints backend utilisés

- `GET /admin/dons` - Liste paginée des dons avec filtres
- `PUT /admin/dons/:id/approuver` - Approuver un don
- `PUT /admin/dons/:id/rejeter` - Rejeter un don

## Navigation

L'entrée "Dons" se trouve dans le menu latéral (sidebar), entre "Cotisations" et "Formations", avec l'icône 🎁 (Gift).

## Gestion des erreurs

- Affichage des messages d'erreur en cas de problème de connexion
- Validation côté client avant l'envoi des requêtes
- États de chargement pendant les opérations
- Feedback visuel pour toutes les actions

## Améliorations futures possibles

1. **Statistiques des dons** : Graphiques montrant l'évolution des dons
2. **Export de données** : Exportation CSV/Excel des dons
3. **Notifications** : Alertes automatiques pour nouveaux dons en attente
4. **Filtres avancés** : Par montant, par membre, etc.
5. **Historique complet** : Tous les changements de statut d'un don
6. **Validation en masse** : Approuver/rejeter plusieurs dons à la fois

## Sécurité

- Authentification JWT requise pour toutes les opérations
- Vérification du rôle admin au niveau du backend
- Audit logs automatique des actions d'approbation/rejet
- Validation des données côté serveur

## Interface utilisateur

L'interface utilise les composants shadcn/ui pour un design cohérent :
- Tables responsives
- Dialogs pour les confirmations
- Badges colorés pour les statuts
- Boutons désactivés pendant les chargements
- Messages d'erreur clairs et informatifs
