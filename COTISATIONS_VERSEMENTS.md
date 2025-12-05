# Système de Cotisations avec Versements Multiples

## Vue d'ensemble

Le système de cotisation annuelle permet aux membres de payer leur cotisation de **1500 HTG** en plusieurs versements. Le **premier versement ne peut pas être inférieur à 150 HTG**.

## Règles de cotisation

### Montants
- **Cotisation annuelle totale** : 1500 HTG
- **Premier versement minimum** : 150 HTG
- **Versements suivants** : Montant libre (minimum 1 HTG jusqu'au solde)

### Exemple de scénarios

#### Scénario 1 : Paiement complet
```
Versement 1: 1500 HTG
Total payé: 1500 HTG
Solde: 0 HTG ✓ Complète
```

#### Scénario 2 : Trois versements
```
Versement 1: 500 HTG (✓ > 150 HTG)
Versement 2: 500 HTG
Versement 3: 500 HTG
Total payé: 1500 HTG
Solde: 0 HTG ✓ Complète
```

#### Scénario 3 : Versements progressifs
```
Versement 1: 150 HTG (✓ minimum)
Versement 2: 350 HTG
Versement 3: 1000 HTG
Total payé: 1500 HTG
Solde: 0 HTG ✓ Complète
```

#### Scénario 4 : Premier versement trop faible (❌ REJETÉ)
```
Versement 1: 100 HTG (❌ < 150 HTG)
→ L'admin doit REJETER avec motif: "Premier versement minimum = 150 HTG"
```

## Interface Admin

### 1. Page cotisations (`/dashboard/cotisations`)

#### En-tête informatif
Un bandeau bleu affiche les règles :
```
Info : Cotisation annuelle = 1500 HTG | Premier versement minimum = 150 HTG | Versements multiples autorisés
```

#### Liste des versements
- Colonne "Montant versement" (au lieu de juste "Montant")
- Chaque ligne = 1 versement individuel
- Un membre peut avoir plusieurs lignes (plusieurs versements)

#### Dialog détails
Affiche une section spéciale avec :
- **Cotisation annuelle** : 1500 HTG
- **Versement actuel** : {montant du versement affiché}
- **Minimum 1er versement** : 150 HTG

### 2. Composant CotisationStatus

Un nouveau composant réutilisable affiche le statut complet d'un membre :

#### Fonctionnalités
- ✅ **Barre de progression visuelle** (0-100%)
- ✅ **3 cartes récapitulatives** :
  - Cotisation annuelle (1500 HTG)
  - Total payé (somme de tous les versements validés)
  - Solde restant
- ✅ **Badge statut** : "Complète" (vert) ou "En cours" (gris)
- ✅ **Historique des versements** : Liste déroulante des versements validés
- ✅ **Indication prochain versement** : Montant minimum suggéré

#### Utilisation
```typescript
import { CotisationStatus } from '@/components/cotisation-status';

<CotisationStatus membreId={membre.id} token={token} />
```

#### Exemple d'affichage

```
┌────────────────────────────────────────┐
│ Statut de cotisation annuelle  [Complète] │
├────────────────────────────────────────┤
│ Progression          [████████] 100%   │
│                                        │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │  1500   │ │  1500   │ │    0    │ │
│ │ Annuelle│ │Payé ✓   │ │ Restant │ │
│ └─────────┘ └─────────┘ └─────────┘ │
│                                        │
│ Nombre de versements validés: 3       │
│                                        │
│ Historique des versements:            │
│ ┌────────────────────────────────┐   │
│ │ Versement #1    500 HTG  01/01 │   │
│ │ Versement #2    500 HTG  15/02 │   │
│ │ Versement #3    500 HTG  01/03 │   │
│ └────────────────────────────────┘   │
└────────────────────────────────────────┘
```

## Workflow Admin : Valider un versement

### Validation normale
1. Membre soumet un versement (ex: 500 HTG)
2. Admin voit le versement dans la liste
3. Admin clique "Voir" → Voit les infos du versement
4. Admin clique "Valider"
5. **Système notifie le membre** : "Votre versement de 500 HTG a été validé"
6. Le versement est comptabilisé dans le total

### Validation du premier versement
1. Vérifier que le montant ≥ 150 HTG
2. Si oui → Valider normalement
3. Si non → REJETER avec commentaire :
   ```
   "Premier versement insuffisant. Minimum requis : 150 HTG. 
   Vous avez versé {montant} HTG."
   ```

### Validation du dernier versement
1. Vérifier le solde restant du membre
2. Si versement ≥ solde → Cotisation COMPLÈTE ✓
3. Notification : "Félicitations ! Votre cotisation annuelle est maintenant complète."

## Calcul du statut

### Côté backend
Le backend retourne tous les versements d'un membre. Le frontend calcule :

```typescript
const versementsValides = cotisations.filter(c => c.statut_paiement === 'validé');
const totalPaye = versementsValides.reduce((sum, c) => sum + c.montant, 0);
const soldeRestant = Math.max(0, 1500 - totalPaye);
const estComplet = totalPaye >= 1500;
```

### États possibles
- **Non commencé** : totalPaye = 0, soldeRestant = 1500
- **En cours** : 0 < totalPaye < 1500, soldeRestant > 0
- **Complète** : totalPaye ≥ 1500, soldeRestant = 0
- **Surpayé** : totalPaye > 1500 (rare, mais géré)

## API Backend

### Endpoints utilisés

```typescript
// Récupérer tous les versements d'un membre
GET /admin/cotisations?membre_id={id}&statut=validé&limit=100

// Réponse
{
  success: true,
  data: {
    data: [
      { id: 1, membre_id: 5, montant: 500, statut_paiement: 'validé', date_paiement: '2025-01-15' },
      { id: 2, membre_id: 5, montant: 500, statut_paiement: 'validé', date_paiement: '2025-02-15' },
      { id: 3, membre_id: 5, montant: 500, statut_paiement: 'validé', date_paiement: '2025-03-15' }
    ],
    pagination: { ... }
  }
}
```

## Messages de notification

### Premier versement validé
```
Titre: "Premier versement validé"
Corps: "Votre premier versement de {montant} HTG a été validé. 
       Solde restant : {solde} HTG"
```

### Versement intermédiaire validé
```
Titre: "Versement validé"
Corps: "Votre versement de {montant} HTG a été validé. 
       Total payé : {total} HTG / 1500 HTG"
```

### Dernier versement (cotisation complète)
```
Titre: "Cotisation complète !"
Corps: "Félicitations ! Votre versement de {montant} HTG a été validé. 
       Votre cotisation annuelle de 1500 HTG est maintenant complète ✓"
```

### Versement rejeté (< 150 HTG pour le 1er)
```
Titre: "Versement rejeté"
Corps: "Votre versement de {montant} HTG a été rejeté. 
       Raison: Premier versement minimum = 150 HTG"
```

## Validation côté client

### Dans le formulaire membre (futur)
```typescript
const MINIMUM_PREMIER = 150;
const COTISATION_ANNUELLE = 1500;

function validateMontant(montant: number, isFirstVersement: boolean, soldeRestant: number) {
  if (isFirstVersement && montant < MINIMUM_PREMIER) {
    return `Premier versement minimum : ${MINIMUM_PREMIER} HTG`;
  }
  
  if (montant > soldeRestant) {
    return `Montant supérieur au solde restant (${soldeRestant} HTG)`;
  }
  
  if (montant <= 0) {
    return 'Montant invalide';
  }
  
  return null; // Valide
}
```

## Intégration future (mobile)

### Page "Ma cotisation" (à implémenter)
L'application mobile pourra afficher :
1. Barre de progression visuelle
2. Total payé / Solde restant
3. Historique des versements
4. Bouton "Faire un versement"
5. Indication du montant minimum

### Formulaire de versement
- Affiche le solde restant
- Affiche le minimum (150 HTG si 1er versement, sinon 1 HTG)
- Validation temps réel
- Upload de reçu
- Confirmation avant soumission

## Tests recommandés

### Test 1 : Premier versement valide
1. Membre soumet 500 HTG (1er versement)
2. Admin valide
3. Vérifier : notification envoyée, solde = 1000 HTG

### Test 2 : Premier versement invalide
1. Membre soumet 100 HTG (1er versement)
2. Admin REJETE avec motif "< 150 HTG"
3. Vérifier : notification avec motif envoyée

### Test 3 : Versements multiples
1. Membre fait 3 versements : 500 + 500 + 500
2. Admin valide les 3
3. Vérifier : cotisation marquée "Complète", badge vert

### Test 4 : Versements de montants variables
1. Membre fait : 150 + 350 + 1000
2. Admin valide tous
3. Vérifier : total = 1500, statut = complète

### Test 5 : Surpaiement
1. Membre a déjà 1400 HTG payés
2. Membre soumet 200 HTG
3. Admin valide → Total = 1600 HTG
4. Vérifier : solde = 0, cotisation complète (pas d'erreur)

## Améliorations futures

### Côté admin
- [ ] Alerte visuelle si versement < 150 HTG et c'est le 1er
- [ ] Calcul automatique du solde restant dans la liste
- [ ] Filtre "Cotisations complètes" / "En cours"
- [ ] Export avec détail des versements par membre

### Côté membre
- [ ] Dashboard avec barre de progression
- [ ] Historique complet des versements
- [ ] Estimation date de fin (si paiements réguliers)
- [ ] Rappels automatiques pour solde restant

### Notifications
- [ ] Notification différenciée pour dernier versement
- [ ] Rappel automatique si aucun versement depuis 60 jours
- [ ] Félicitations spéciales quand cotisation complète

## Fichiers créés/modifiés

**Créés** :
- `/components/cotisation-status.tsx` - Composant de statut
- `/components/ui/progress.tsx` - Barre de progression (shadcn/ui)
- `COTISATIONS_VERSEMENTS.md` - Cette documentation

**Modifiés** :
- `/app/dashboard/cotisations/page.tsx` - Bandeau info + dialog détails amélioré
- `/lib/api/adminService.ts` - Méthode `rejeterCotisation()`
- `/types/backend.ts` - Types Cotisation

## Support technique

### Configuration
Les constantes sont définies dans le composant :
```typescript
const COTISATION_ANNUELLE = 1500; // HTG
const MINIMUM_PREMIER_VERSEMENT = 150; // HTG
```

Pour modifier ces valeurs, éditer :
- `/components/cotisation-status.tsx`
- `/app/dashboard/cotisations/page.tsx` (bandeau info)

### Backend
S'assurer que le backend supporte :
- Endpoint `GET /admin/cotisations` avec filtre `membre_id`
- Retour de tous les versements (pas de limite artificielle)
- Champ `statut_paiement` = 'validé'
