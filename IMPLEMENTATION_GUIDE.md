# Guide d'implémentation - Pages restantes

## ✅ Sections complétées (6/12)

1. ✅ Types TypeScript backend (`types/backend.ts`)
2. ✅ Services API (`lib/api/`)
3. ✅ Authentification adaptée (`app/api/auth/login/route.ts`)
4. ✅ Page statistiques (`app/dashboard/stats/page.tsx`)
5. ✅ Page formations (`app/dashboard/formations/page.tsx`)
6. ✅ Page audit logs (`app/dashboard/audit/page.tsx`)

## 📋 Pages restantes à implémenter (6)

### 1. Page Parrainage (`app/dashboard/parrainage/page.tsx`)

Créer une page qui affiche l'arbre de parrainage avec statistiques.

```typescript
'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { Membre } from '@/types/backend';

export default function ParrainagePage() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const response = await fetch('/api/auth/me');
    const { token: userToken } = await response.json();
    setToken(userToken);

    // Charger tous les membres avec code_parrain
    const result = await adminService.getMembres(
      { page: 1, limit: 1000 },
      userToken
    );
    if (result.success && result.data) {
      setMembres(result.data.data);
    }
  };

  // Afficher arbre de parrainage
  // Calculer statistiques: nombre de filleuls par parrain, points totaux
  // Utiliser parrainageService.getStats() pour les détails

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Système de Parrainage</h1>
      {/* Afficher arbre, stats, top parrains */}
    </div>
  );
}
```

**Endpoints à utiliser:**
- `adminService.getMembres()` - Filtrer par code_parrain
- `parrainageService.getStats(parrainId, token)` - Stats d'un parrain
- `parrainageService.getFilleuls(token)` - Liste filleuls

### 2. Page Membres (`app/dashboard/membres/page.tsx`)

Mettre à jour la page existante pour utiliser `adminService.getMembres()`.

**Changements clés:**
```typescript
// Remplacer l'ancien appel API par:
const result = await adminService.getMembres(
  {
    page: currentPage,
    limit: 20,
    search: searchTerm,
    role: selectedRole,
    departement: selectedDept
  },
  token
);

// Afficher les nouveaux champs:
// - username
// - code_adhesion
// - code_parrain
```

**Nouveaux champs à afficher dans le tableau:**
- Username
- Code d'adhésion
- Code parrain (si existe)
- NIN/NIF
- Département

### 3. Page Cotisations (`app/dashboard/cotisations/page.tsx`)

Mettre à jour pour utiliser `adminService.getCotisations()` et `validerCotisation()`.

**Changements clés:**
```typescript
// Charger cotisations
const result = await adminService.getCotisations(
  {
    page: 1,
    limit: 50,
    statut: 'en_attente', // ou 'validé', 'rejeté'
    date_debut: startDate,
    date_fin: endDate
  },
  token
);

// Valider une cotisation
const handleValidate = async (id: number) => {
  const result = await adminService.validerCotisation(
    id,
    'Validé par admin',
    token
  );
  if (result.success) {
    loadCotisations(); // Recharger
  }
};
```

**Afficher:**
- Statut de paiement (badge coloré)
- Moyen de paiement
- Reçu/URL reçu (bouton télécharger)
- Bouton "Valider" pour cotisations en attente

### 4. Page Podcasts (`app/dashboard/podcasts/page.tsx`)

Mettre à jour pour upload multipart.

**Changements clés:**
```typescript
// Charger podcasts
const result = await adminService.getPodcasts(1, 20, undefined, token);

// Upload avec audio + cover
const handleUpload = async (data: FormData) => {
  const audioFile = data.get('audio') as File;
  const coverFile = data.get('cover') as File;
  
  const result = await adminService.uploadPodcast(
    {
      titre: data.get('titre') as string,
      description: data.get('description') as string,
      categorie: data.get('categorie') as string,
      duree: parseInt(data.get('duree') as string),
      est_en_direct: data.get('est_en_direct') === 'true'
    },
    audioFile,
    coverFile,
    token
  );
};
```

**Formulaire upload:**
- Input file pour audio (mp3, wav)
- Input file pour cover (jpg, png)
- Champs: titre, description, catégorie, durée, est_en_direct

### 5. Page Quiz (`app/dashboard/quiz/page.tsx`)

Mettre à jour pour supporter `module_id`.

**Changements clés:**
```typescript
// Charger quiz
const result = await adminService.getQuiz(1, 20, true, token);

// Afficher module_id si existe
// Permettre d'associer quiz à un module
const handleAttachToModule = async (quizId: number, moduleId: number) => {
  const result = await adminService.attachQuizToModule(
    quizId,
    moduleId,
    token
  );
};
```

**Nouveau champ:**
- Module associé (afficher nom du module si module_id existe)
- Bouton "Associer à un module" pour quiz standalone

### 6. Page Notifications (`app/dashboard/notifications/page.tsx`)

Améliorer avec ciblage personnalisé.

**Changements clés:**
```typescript
const handleSend = async (data: NotificationRequest) => {
  const result = await adminService.sendNotification(
    {
      title: data.title,
      body: data.body,
      target_type: data.target_type, // 'all', 'specific', 'role'
      target_ids: data.target_ids, // Si specific
      target_role: data.target_role, // Si role
      data: data.data // Données additionnelles
    },
    token
  );
};
```

**Formulaire notification:**
- Titre et corps du message
- Type de cible:
  - Tous les membres
  - Membres spécifiques (sélection multiple)
  - Par rôle (admin, membre, partner)
- Données additionnelles (JSON optionnel)

## 🔧 Pattern commun pour toutes les pages

Toutes les pages suivent ce pattern:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { TypeFromBackend } from '@/types/backend';

export default function PageName() {
  const [data, setData] = useState<TypeFromBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      const { token: userToken } = await response.json();
      setToken(userToken);

      const result = await adminService.methodName(params, userToken);
      if (result.success && result.data) {
        setData(result.data.data || result.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reste du composant...
}
```

## 🚀 Étapes pour compléter l'implémentation

1. Créer/modifier chaque page une par une
2. Importer les services depuis `@/lib/api`
3. Importer les types depuis `@/types/backend`
4. Utiliser `/api/auth/me` pour obtenir le token
5. Appeler la méthode du service approprié
6. Afficher les données avec les composants UI existants

## 📝 Composants UI disponibles

Tous les composants shadcn/ui sont déjà installés:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`, `Input`, `Label`, `Textarea`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Badge`

## ✅ Vérification finale

Une fois toutes les pages implémentées:

1. Démarrer le backend: `cd /Users/christopherjerome/nou-backend && npm run dev`
2. Démarrer le frontend: `cd /Users/christopherjerome/nou-admin && npm run dev`
3. Tester chaque page:
   - Login avec un admin
   - Vérifier que les données se chargent
   - Tester les actions (créer, modifier, valider, etc.)
4. Vérifier les logs d'audit pour voir les actions enregistrées

## 🎯 Résultat attendu

Après implémentation complète, l'admin aura:
- Dashboard complet avec statistiques temps réel
- Gestion CRUD de toutes les entités
- Système de parrainage visualisé
- Audit logs de toutes les actions
- Upload de fichiers (podcasts avec audio/cover)
- Notifications ciblées
- Formations avec modules et quiz associés

Tout est connecté au backend nou-backend via les services API créés!
