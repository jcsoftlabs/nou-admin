# Nou Admin

Dashboard d'administration Next.js avec authentification JWT, thème blanc & rouge.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Configuration

1. Modifiez le fichier `.env.local` :
```env
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

2. Lancez le serveur de développement :
```bash
npm run dev
```

3. Ouvrez [http://localhost:3000](http://localhost:3000)

## 🔐 Authentification

### Credentials de test (nou-backend seeded)
- Username: `admin` (ou email: `admin@nou.ht`)
- Mot de passe: `password123`

**Note**: Le champ identifiant accepte username, email ou téléphone

### Configuration JWT
L'authentification utilise JWT avec `jose`. Le token est stocké dans un cookie `httpOnly` pour la sécurité.

Pour connecter à votre backend :
1. Modifiez `/app/api/auth/login/route.ts`
2. Remplacez les credentials en dur par un appel API vers votre backend

## 🎨 Thème

Le projet utilise un thème blanc & rouge :
- Couleur primaire : Rouge
- Background : Blanc
- Les variables CSS sont dans `app/globals.css`

## 📦 Technologies

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Composants UI
- **Recharts** - Graphiques et visualisations
- **jose** - JWT pour authentification
- **Lucide React** - Icônes

## 📁 Structure

```
nou-admin/
├── app/
│   ├── api/auth/          # Routes API authentification
│   ├── dashboard/         # Pages du dashboard
│   ├── login/             # Page de connexion
│   └── globals.css        # Styles globaux & thème
├── components/
│   ├── ui/                # Composants shadcn/ui
│   └── admin-sidebar.tsx  # Sidebar de navigation
├── lib/
│   ├── jwt.ts            # Utilitaires JWT
│   └── utils.ts          # Utilitaires généraux
└── middleware.ts         # Protection des routes
```

## 🔧 Intégration backend

Pour connecter votre API `nou-backend` :

1. Configurez l'URL dans `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost/nou-backend/api
```

2. Les fonctions API sont dans `/lib/api.ts` pour appeler votre backend

3. Exemple de requête :
```typescript
import { membresApi } from '@/lib/api';
const membres = await membresApi.getAll(token);
```

## 📄 Pages disponibles

- `/login` - Connexion admin
- `/dashboard` - Tableau de bord avec graphiques
- `/dashboard/membres` - Gestion des membres
- `/dashboard/cotisations` - Validation des cotisations
- `/dashboard/podcasts` - Gestion des podcasts
- `/dashboard/quiz` - Gestion des quiz
- `/dashboard/notifications` - Notifications push
- `/dashboard/stats` - Statistiques détaillées

## 🛠️ Développement

### Ajouter un nouveau composant shadcn/ui

```bash
npx shadcn@latest add [composant]
```

### Build production

```bash
npm run build
npm start
```

## 📝 TODO

- [ ] Connecter à l'API nou-backend
- [ ] Implémenter l'authentification réelle avec le backend
- [ ] Intégrer Firebase pour les notifications push
- [ ] Ajouter l'upload d'images pour les reçus de cotisation
- [ ] Ajouter les tests

## 🔒 Sécurité

- JWT tokens stockés dans cookies httpOnly
- Middleware de protection des routes
- Variables d'environnement pour secrets
- CORS à configurer selon votre backend

---

**Développé avec Next.js 16 et shadcn/ui**
