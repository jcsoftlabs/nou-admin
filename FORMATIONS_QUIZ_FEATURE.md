# Gestion des Formations et Quiz - Documentation

## Vue d'ensemble

Les fonctionnalités de gestion des formations et quiz ont été améliorées pour correspondre exactement aux paramètres du backend `nou-backend`. Le système permet maintenant de créer des formations structurées avec des modules riches (texte, image, vidéo) et d'associer des quiz à ces modules.

## Architecture Backend

### Modèles

#### Formation
- `id`: INT
- `titre`: VARCHAR(255) *
- `description`: TEXT
- `niveau`: VARCHAR(50) (débutant, intermédiaire, avancé)
- `image_couverture_url`: VARCHAR(255)
- `est_active`: BOOLEAN
- `date_publication`: DATETIME

#### Module (FormationModule)
- `id`: INT
- `formation_id`: INT * (FK → formations.id)
- `titre`: VARCHAR(255) *
- `description`: TEXT
- `ordre`: INT (ordre d'affichage)
- `type_contenu`: VARCHAR(50) (texte, video, image, mixte)
- `contenu_texte`: TEXT/LONGTEXT (corps du cours markdown/HTML)
- `image_url`: VARCHAR(255)
- `video_url`: VARCHAR(255)

#### Quiz
- `id`: INT
- `titre`: VARCHAR(255) *
- `description`: TEXT
- `date_publication`: DATETIME
- `date_expiration`: DATETIME
- `module_id`: INT (FK → modules.id, nullable)

### Associations
- `Formation.hasMany(Module)`
- `Module.hasMany(Quiz)`
- `Quiz.belongsTo(Module)`

## Fonctionnalités Frontend

### 1. Gestion des Formations (`/dashboard/formations`)

#### Liste des formations
- Affichage en grille (cards)
- Informations : titre, description, niveau, statut (active/inactive)
- Nombre de modules par formation
- Boutons : Modifier, Gérer modules

#### Création/Modification de formation
- Champs :
  - Titre *
  - Description
  - Niveau (dropdown : débutant, intermédiaire, avancé)
  - URL image de couverture
  - Est active (checkbox)

### 2. Gestion des Modules (`/dashboard/formations/[id]`)

#### Informations du module
- Titre *
- Description
- Ordre (numérotation)
- Type de contenu (texte, vidéo, image, mixte)

#### Contenu riche
- **Contenu texte** : Champ texte large supportant Markdown/HTML pour le corps du cours
- **Image URL** : Lien vers une image principale
- **Vidéo URL** : Lien vers une vidéo (YouTube, hébergée, etc.)

#### Actions sur les modules
- ✏️ **Modifier** : Éditer tous les champs du module
- 🔗 **Associer quiz** : Lier un quiz existant ou créer un nouveau quiz pour ce module

### 3. Association Quiz ↔ Module

#### Deux options disponibles :
1. **Associer un quiz existant**
   - Dropdown listant tous les quiz disponibles
   - Bouton "Associer"

2. **Créer un nouveau quiz pour ce module**
   - Bouton qui redirige vers `/dashboard/quiz/create?moduleId=X`
   - Le module_id est pré-rempli automatiquement

### 4. Création de Quiz (`/dashboard/quiz/create`)

#### Informations du quiz
- Titre *
- Description
- Date de publication
- Date d'expiration
- Module (dropdown optionnel)
  - Liste tous les modules de toutes les formations
  - Format : "Formation - Module"
  - Option "Aucun module" pour quiz standalone

#### Gestion des questions
- **Interface dynamique** : Ajouter/Supprimer des questions
- **Champs par question** :
  - Question (textarea) *
  - Option A, B, C, D (4 choix obligatoires) *
  - Bonne réponse (dropdown) *
  - Points (nombre)

#### Workflow
1. Remplir les informations du quiz
2. (Optionnel) Sélectionner un module
3. Ajouter des questions (minimum 1)
4. Soumettre → Création du quiz dans la base

### 5. Liste des Quiz (`/dashboard/quiz`)

- Affichage en grille
- Badge "Module" si le quiz est rattaché à un module
- Nombre de questions
- Date d'expiration
- Bouton "Nouveau quiz" en haut à droite

## Services API

### Endpoints Formations
- `GET /admin/formations` - Liste avec pagination
- `POST /admin/formations` - Créer
- `PUT /admin/formations/:id` - Modifier
- `POST /admin/formations/:id/modules` - Créer module
- `PUT /admin/modules/:id` - Modifier module

### Endpoints Quiz
- `GET /admin/quiz` - Liste avec pagination
- `POST /admin/quiz` - Créer
- `PUT /admin/quiz/:id` - Modifier
- `DELETE /admin/quiz/:id` - Supprimer
- `POST /admin/modules/attach-quiz` - Associer quiz à module

### Services TypeScript

```typescript
// lib/api/adminService.ts

// Formations
async getFormations(page, limit, est_active, token)
async createFormation(data, token)
async updateFormation(id, data, token)
async createModule(formationId, data, token)
async updateModule(moduleId, data, token)
async attachQuizToModule(quizId, moduleId, token)

// Quiz
async getQuiz(page, limit, actif, token)
async createQuiz(data, token)
async updateQuiz(id, data, token)
async deleteQuiz(id, token)
```

## Flux de travail typique

### Créer un cours complet

1. **Créer la formation**
   - `/dashboard/formations` → "Nouvelle formation"
   - Remplir titre, description, niveau
   - Activer la formation

2. **Ajouter des modules**
   - Cliquer sur "Gérer modules"
   - "Nouveau module" pour chaque chapitre
   - Remplir le contenu texte (markdown/HTML)
   - Ajouter images/vidéos si besoin
   - Définir l'ordre d'affichage

3. **Créer les quiz**
   - Pour chaque module : cliquer sur l'icône 🔗
   - "Créer un nouveau quiz pour ce module"
   - Ajouter questions avec options
   - Le quiz est automatiquement lié au module

### Associer un quiz existant

1. Dans la page du module → icône 🔗
2. Sélectionner le quiz dans le dropdown
3. "Associer"

## Types TypeScript

```typescript
// types/backend.ts

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

export interface FormationModule {
  id: number;
  formation_id: number;
  titre: string;
  description?: string;
  type_contenu?: string;
  contenu_texte?: string;
  image_url?: string;
  video_url?: string;
  ordre: number;
  quiz?: Quiz;
}

export interface Quiz {
  id: number;
  titre: string;
  description?: string;
  module_id?: number;
  date_publication?: string;
  date_expiration?: string;
  questions?: QuizQuestion[];
}
```

## Améliorations apportées

### ✅ Conformité backend
- Tous les champs du backend sont supportés
- Association Quiz ↔ Module bidirectionnelle
- Support des modules avec contenu riche

### ✅ Expérience utilisateur
- Création de quiz directement depuis un module
- Pré-remplissage automatique du module_id
- Interface intuitive pour gérer le contenu des modules
- Visualisation claire de la structure Formation → Modules → Quiz

### ✅ Fonctionnalités avancées
- Support Markdown/HTML dans le contenu des modules
- Types de contenu variés (texte, vidéo, image, mixte)
- Gestion de l'ordre des modules
- Quiz standalone ou rattachés à des modules

## Points techniques

### Suspense Boundary
La page de création de quiz utilise `useSearchParams`, nécessitant un Suspense boundary :
```typescript
export default function CreateQuizPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CreateQuizContent />
    </Suspense>
  );
}
```

### Gestion des états
- États de chargement pour toutes les opérations asynchrones
- Gestion des erreurs avec messages clairs
- Validation côté client avant soumission

### Sécurité
- Authentification JWT requise
- Token passé dans toutes les requêtes API
- Vérification du rôle admin au backend

## Tests

Pour tester la fonctionnalité complète :

1. Créer une formation "Introduction à NOU"
2. Ajouter 3 modules :
   - Module 1 : Histoire (type: texte)
   - Module 2 : Constitution (type: mixte avec image)
   - Module 3 : Engagement (type: vidéo)
3. Créer un quiz pour chaque module avec 5 questions
4. Vérifier que les quiz apparaissent dans la liste avec le badge "Module"

## Maintenance future

### TODO
- [ ] Endpoint backend pour créer les questions de quiz
- [ ] Upload d'images pour les modules (au lieu d'URLs)
- [ ] Prévisualisation du rendu Markdown
- [ ] Réorganisation drag & drop de l'ordre des modules
- [ ] Statistiques de complétion par formation
