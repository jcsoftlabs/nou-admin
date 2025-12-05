# Mise à Jour de l'Authentification

## Changements Effectués

### 1. Intégration avec nou-backend

L'authentification de `nou-admin` est maintenant connectée au backend `nou-backend` au lieu d'utiliser des credentials en dur.

### 2. Support Multi-Identifiant

Le système accepte maintenant **3 types d'identifiants** pour la connexion :
- **Username** (ex: `admin`)
- **Email** (ex: `admin@nou.ht`)
- **Téléphone** (ex: `+50937111111`)

### 3. Fichiers Modifiés

#### Frontend
- **`/app/login/page.tsx`**
  - Changement du champ `email` en `identifier`
  - Label mis à jour : "Username, Email ou Téléphone"
  - Placeholder adapté

#### API Route
- **`/app/api/auth/login/route.ts`**
  - Appel à l'API nou-backend (`/auth/login`)
  - Vérification du rôle `admin`
  - Stockage de deux tokens :
    - `admin-token` : pour le frontend Next.js
    - `backend-token` : pour les appels API au backend

#### Documentation
- **`README.md`** et **`QUICK_START.md`**
  - Credentials mis à jour
  - Note sur le support multi-identifiant

### 4. Workflow d'Authentification

```
1. Utilisateur entre : identifier (username/email/phone) + password
   ↓
2. Frontend envoie à : /api/auth/login (Next.js API route)
   ↓
3. API route appelle : http://localhost/nou-backend/api/auth/login
   ↓
4. Backend valide et retourne : membre + token
   ↓
5. Vérification du rôle : membre.role === 'admin'
   ↓
6. Si admin → Création de 2 cookies :
   - admin-token (JWT Next.js)
   - backend-token (JWT du backend)
   ↓
7. Redirection vers : /dashboard
```

### 5. Credentials de Test

Après avoir exécuté `npm run db:seed` dans `nou-backend` :

```
Username: admin
Email:    admin@nou.ht
Password: password123
```

Vous pouvez vous connecter avec n'importe lequel des trois formats :
- `admin` + `password123`
- `admin@nou.ht` + `password123`

### 6. Sécurité

- Seuls les utilisateurs avec `role = 'admin'` peuvent accéder à l'interface
- Les tokens sont stockés dans des cookies `httpOnly`
- Le token backend est utilisé pour les appels API futurs
- Les cookies expirent après 24 heures

### 7. Configuration Requise

Dans `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost/nou-backend/api
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
```

### 8. Tests

Pour tester la connexion :
1. Assurez-vous que `nou-backend` est démarré
2. Exécutez `npm run db:seed` dans `nou-backend`
3. Lancez `npm run dev` dans `nou-admin`
4. Allez sur `http://localhost:3000/login`
5. Entrez `admin` / `password123`

### 9. Prochaines Étapes

- [ ] Utiliser le `backend-token` dans tous les appels API
- [ ] Implémenter le refresh token
- [ ] Ajouter la récupération de mot de passe
- [ ] Logger les tentatives de connexion
- [ ] Ajouter 2FA (optionnel)

## Notes Importantes

⚠️ **Backend Requis**: L'application ne fonctionnera pas sans que `nou-backend` soit accessible.

⚠️ **Seeding**: Assurez-vous d'avoir exécuté le seeding du backend pour créer le compte admin.

⚠️ **Rôle Admin**: Seuls les comptes avec `role_utilisateur = 'admin'` peuvent se connecter.
