# Système de Gestion des Cotisations - Documentation

## Vue d'ensemble

Le système de gestion des cotisations permet aux administrateurs de visualiser, valider et rejeter les cotisations des membres. Un système de notifications automatiques informe les membres du statut de leurs cotisations.

## Fonctionnalités implémentées

### 1. Liste des cotisations admin (`/dashboard/cotisations`)

#### Affichage
- Liste paginée (20 cotisations par page)
- Colonnes : Membre, Montant, Moyen de paiement, Date, Statut, Reçu, Actions
- Badges colorés pour les statuts :
  - 🟢 Vert (validé)
  - ⚪ Gris (en_attente)
  - 🔴 Rouge (rejeté)

#### Filtres de recherche
- **Statut** : Tous / En attente / Validé / Rejeté
- **Date début** : Filtrer à partir d'une date
- **Date fin** : Filtrer jusqu'à une date
- Bouton "Rechercher" pour appliquer les filtres

### 2. Actions administratives

#### Bouton "Voir" (👁️)
- Ouvre un dialog avec tous les détails de la cotisation
- Affiche : membre, montant, moyen de paiement, statut, dates
- Lien vers le reçu uploadé (si disponible)
- Historique de vérification (admin, date, commentaire)

#### Bouton "Valider" (✓)
**Disponible uniquement pour les cotisations "en_attente"**
- Ouvre un dialog de confirmation
- Champ commentaire **optionnel**
- Au clic sur "Valider" :
  1. Appel API `PUT /admin/cotisations/:id/valider`
  2. **Notification push automatique** envoyée au membre
  3. Rafraîchissement de la liste
- États de chargement pendant l'opération

#### Bouton "Rejeter" (❌)
**Disponible uniquement pour les cotisations "en_attente"**
- Ouvre un dialog de rejet
- Champ commentaire **OBLIGATOIRE** (motif du rejet)
- Validation côté client (bouton désactivé si vide)
- Au clic sur "Rejeter" :
  1. Appel API `PUT /admin/cotisations/:id/rejeter`
  2. **Notification push automatique** envoyée au membre avec le motif
  3. Rafraîchissement de la liste

### 3. Système de notifications automatiques

#### Après validation
```typescript
Titre: "Cotisation validée"
Message: "Votre cotisation de {montant} HTG a été validée."
Cible: Le membre concerné uniquement
```

#### Après rejet
```typescript
Titre: "Cotisation rejetée"
Message: "Votre cotisation de {montant} HTG a été rejetée. Raison: {commentaire}"
Cible: Le membre concerné uniquement
```

#### Implémentation
- Utilise `adminService.sendNotification()`
- Type de ciblage : `target_type: 'specific'`
- ID du membre passé dans `target_ids: [membre_id]`
- Ne bloque pas l'opération si la notification échoue (erreur loggée)

## Architecture technique

### Services API

#### Endpoints utilisés
```typescript
// Liste des cotisations
GET /admin/cotisations?page=1&limit=20&statut=en_attente&date_debut=...&date_fin=...

// Validation
PUT /admin/cotisations/:id/valider
Body: { commentaire?: string }

// Rejet
PUT /admin/cotisations/:id/rejeter
Body: { commentaire: string }

// Notification
POST /admin/notifications/send
Body: {
  title: string,
  body: string,
  target_type: 'specific',
  target_ids: number[]
}
```

#### Méthodes adminService
```typescript
// lib/api/adminService.ts

async getCotisations(filters: CotisationFilters, token: string)
async validerCotisation(id: number, commentaire?: string, token: string)
async rejeterCotisation(id: number, commentaire: string, token: string)
async sendNotification(data: NotificationRequest, token: string)
```

### Types TypeScript

```typescript
// types/backend.ts

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

export interface CotisationFilters extends PaginatedRequest {
  statut?: string;
  date_debut?: string;
  date_fin?: string;
  membre_id?: number;
}

export interface NotificationRequest {
  title: string;
  body: string;
  target_type: 'all' | 'specific' | 'role';
  target_ids?: number[];
  target_role?: string;
  data?: Record<string, any>;
}
```

### Composants UI

**Composants shadcn/ui utilisés** :
- `Dialog` - Modales pour détails/validation/rejet
- `Table` - Affichage de la liste
- `Badge` - Statuts colorés
- `Button` - Actions
- `Select` - Filtres
- `Input` - Champs de dates
- `Textarea` - Commentaires
- `Label` - Libellés de champs

## Workflows utilisateur

### Workflow admin : Valider une cotisation

1. Admin navigue vers `/dashboard/cotisations`
2. Filtre optionnel par "En attente"
3. Clic sur "Valider" pour une cotisation
4. Dialog s'ouvre avec confirmation
5. (Optionnel) Ajoute un commentaire
6. Clic sur "Valider"
7. **Notification envoyée automatiquement au membre**
8. Liste rafraîchie, cotisation passe à "validé"

### Workflow admin : Rejeter une cotisation

1. Admin navigue vers `/dashboard/cotisations`
2. Clic sur "Rejeter" pour une cotisation en attente
3. Dialog s'ouvre
4. **Saisie obligatoire du motif** du rejet
5. Clic sur "Rejeter"
6. **Notification avec le motif envoyée au membre**
7. Liste rafraîchie, cotisation passe à "rejeté"

### Workflow membre (côté mobile/frontend)

1. Membre soumet une cotisation
2. Statut initial : "en_attente"
3. **Reçoit une notification push** quand l'admin valide/rejette
4. Peut voir le statut dans son profil
5. Si rejeté : voit le commentaire expliquant le motif

## Gestion des erreurs

- Messages d'erreur clairs affichés en rouge
- Bouton "Réessayer" si échec de chargement
- États de chargement pendant les opérations
- Validation côté client (commentaire obligatoire pour rejet)
- Notifications silencieuses (ne bloque pas si échec)

## Sécurité

- Authentification JWT requise
- Vérification du rôle admin au backend
- Audit automatique de toutes les actions admin
- Token passé dans toutes les requêtes API

## Statistiques (Dashboard principal)

Le dashboard principal (`/dashboard`) affiche :
- Nombre total de cotisations validées
- Nombre de cotisations en attente
- Revenus totaux collectés
- Nouveaux membres ce mois

## Améliorations futures

### Côté admin
- [ ] Validation en masse (plusieurs cotisations à la fois)
- [ ] Export CSV/Excel des cotisations
- [ ] Graphiques d'évolution des cotisations
- [ ] Relance automatique pour cotisations en attente depuis X jours
- [ ] Templates de commentaires pour rejets fréquents

### Côté membre
- [ ] Page dédiée "Mes cotisations" avec historique
- [ ] Upload de reçu directement depuis l'app mobile
- [ ] Paiement MonCash intégré
- [ ] Rappels push avant expiration

### Notifications
- [ ] Templates personnalisables par l'admin
- [ ] Historique des notifications envoyées
- [ ] Retry automatique si échec d'envoi
- [ ] Support SMS en plus des push notifications

## Tests

Pour tester le workflow complet :

1. **Backend** : S'assurer que nou-backend est démarré
2. **Créer cotisation de test** :
   ```sql
   INSERT INTO cotisations (membre_id, montant, moyen_paiement, statut_paiement, date_paiement)
   VALUES (1, 500, 'moncash', 'en_attente', NOW());
   ```
3. **Frontend** : Se connecter comme admin
4. Naviguer vers `/dashboard/cotisations`
5. Tester validation avec commentaire
6. Tester rejet sans commentaire (doit bloquer)
7. Tester rejet avec commentaire
8. Vérifier que les notifications sont envoyées
9. Vérifier l'audit log dans `/dashboard/audit`

## Notes de migration

Si vous migrez depuis une version antérieure :

1. Vérifier que le backend supporte les endpoints :
   - `PUT /admin/cotisations/:id/rejeter`
   - `POST /admin/notifications/send`

2. S'assurer que la table `cotisations` a les colonnes :
   - `commentaire_verification` TEXT
   - `admin_verificateur_id` INT
   - `date_verification` DATETIME

3. Mettre à jour les types TypeScript si besoin

## Support

Pour toute question ou bug, consulter :
- Documentation backend : `nou-backend/API_DOCUMENTATION.md`
- Logs d'audit : `/dashboard/audit`
- Console navigateur pour erreurs JavaScript
