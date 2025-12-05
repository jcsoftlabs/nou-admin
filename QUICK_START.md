# Quick Start - Nou Admin

## 🚀 Lancement immédiat

```bash
npm run dev
```

Ouvrez: http://localhost:3000

## 🔑 Connexion (Credentials de test)

```
Username: admin (ou Email: admin@nou.ht)
Password: password123
```

**Note**: Le champ identifiant accepte username, email ou téléphone.

## 📍 Routes disponibles

- `http://localhost:3000/login` - Page de connexion
- `http://localhost:3000/dashboard` - Tableau de bord principal
- `http://localhost:3000/dashboard/membres` - Gestion des membres
- `http://localhost:3000/dashboard/cotisations` - Validation des cotisations
- `http://localhost:3000/dashboard/podcasts` - Gestion des podcasts
- `http://localhost:3000/dashboard/quiz` - Gestion des quiz
- `http://localhost:3000/dashboard/notifications` - Notifications push
- `http://localhost:3000/dashboard/stats` - Statistiques

## 🎨 Thème

Le thème blanc & rouge est configuré dans `app/globals.css`
- Primaire: Rouge (oklch(0.55 0.22 25))
- Background: Blanc
- Sidebar: Blanc avec accents rouges

## ⚙️ Configuration

Fichier `.env.local`:
```env
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🔗 Prochaines étapes

1. **Connecter au backend nou-backend**
   - Modifier `NEXT_PUBLIC_API_URL` dans `.env.local` (déjà configuré par défaut)
   - Vérifier que le backend est accessible

2. **Remplacer l'authentification en dur**
   - Éditer `/app/api/auth/login/route.ts`
   - Connecter à l'API d'authentification nou-backend

3. **Configuration Firebase (Notifications)**
   - Configurer Firebase pour les notifications push
   - Ajouter les tokens FCM dans le backend
