# Import de membres via CSV

Cette fonctionnalité permet aux administrateurs d'importer plusieurs membres en une seule fois depuis un fichier CSV.

## Accès

Accessible depuis `/dashboard/membres/import` ou via le bouton "Importer CSV" sur la page des membres.

## Fonctionnement

### 1. Template CSV

Un template CSV est disponible au téléchargement contenant :
- Tous les champs de la table `membres`
- Une ligne d'exemple pour guider l'utilisateur

**Télécharger le template** : `/api/membres/template`

### 2. Champs du CSV

#### Champs obligatoires
- `nom` : Nom de famille
- `prenom` : Prénom
- `sexe` : Homme/Femme
- `date_de_naissance` : Format YYYY-MM-DD
- `lieu_de_naissance` : Ville de naissance
- `nin` : Numéro d'Identification Nationale
- `telephone_principal` : Numéro de téléphone principal
- `adresse_complete` : Adresse complète
- `departement` : Département
- `commune` : Commune

#### Champs optionnels
- `surnom`, `nom_pere`, `nom_mere`, `situation_matrimoniale`
- `nb_enfants`, `nb_personnes_a_charge`
- `nif`, `telephone_etranger`, `email`
- `profession`, `occupation`, `section_communale`
- `facebook`, `instagram`
- `a_ete_membre_politique` (0 ou 1), `nom_parti_precedent`, `role_politique_precedent`
- `a_ete_membre_organisation` (0 ou 1), `nom_organisation_precedente`, `role_organisation_precedent`
- `referent_nom`, `referent_prenom`, `referent_adresse`, `referent_telephone`, `relation_avec_referent`
- `a_ete_condamne` (0 ou 1), `a_violé_loi_drogue` (0 ou 1), `a_participe_activite_terroriste` (0 ou 1)
- `code_parrain` : Code d'adhésion d'un membre existant (sera validé)

### 3. Génération automatique

Le système génère automatiquement :

#### Code d'adhésion
- **Format** : A + 1ère lettre du prénom + 1ère lettre du nom + 4 derniers chiffres du téléphone
- **Exemple** : Jean Dupont avec téléphone ...1234 → `AJD1234`
- **Unicité** : Si le code existe déjà, un suffixe numérique est ajouté (`AJD1234`, `AJD12341`, etc.)
- **Algorithme** : Identique à celui du backend (`nou-backend/src/services/authService.js`)

#### Username
- **Format** : prenom.nom (en minuscules, caractères spéciaux supprimés)
- **Exemple** : Jean Dupont → `jean.dupont`
- **Unicité** : Si le username existe, un suffixe numérique est ajouté (`jean.dupont1`, `jean.dupont2`, etc.)

#### Mot de passe
- **Mot de passe par défaut** : `Nou491094`
- Appliqué à tous les membres importés
- Haché avec bcrypt avant insertion
- Les membres doivent être informés de ce mot de passe

#### Autres champs système
- `role_utilisateur` : `membre`
- `Statuts` : `Membre pré-adhérent`
- `date_creation` : Timestamp actuel (géré par MySQL)
- `dernier_update` : Timestamp actuel (géré par MySQL)

### 4. Validation

Avant l'insertion, chaque ligne est validée :

#### Validation des champs
- Vérification de la présence des champs obligatoires
- Validation du format de la date de naissance
- Vérification que le téléphone contient au moins 4 chiffres

#### Détection des doublons
Vérification que les champs suivants n'existent pas déjà :
- `email` (si fourni)
- `telephone_principal`
- `nin`
- `nif` (si fourni)

#### Validation du code parrain
Si `code_parrain` est fourni :
- Vérification qu'il existe dans la base de données
- Si invalide, la ligne est ignorée avec un message d'erreur

### 5. Rapport d'import

Après l'import, un rapport détaillé affiche :

#### Résumé
- Nombre de membres créés (succès)
- Nombre de lignes ignorées (erreurs)
- Nombre total d'erreurs détectées

#### Détails des membres créés
Liste des membres importés avec succès :
- Nom complet
- Code d'adhésion généré

#### Détails des erreurs
Pour chaque ligne en erreur :
- Numéro de ligne dans le CSV
- Champ concerné
- Message d'erreur
- Valeur en cause (si applicable)

## API Endpoints

### GET `/api/membres/template`
Télécharge le template CSV.

**Réponse** : Fichier CSV avec headers et exemple

### POST `/api/membres/import`
Importe les membres depuis un fichier CSV.

**Body** : FormData avec le fichier CSV

**Réponse** :
```json
{
  "success": true,
  "message": "Import terminé: X membre(s) créé(s), Y ligne(s) ignorée(s)",
  "data": {
    "success": 10,
    "errors": [...],
    "skipped": 2,
    "details": {
      "created": [...],
      "duplicates": [...]
    }
  }
}
```

## Sécurité

- Authentification requise (vérification du token JWT)
- Connexion directe à la base de données MySQL
- Validation stricte des données
- Mots de passe hachés avec bcrypt
- Détection des doublons pour éviter les conflits

## Limitations

- Format CSV uniquement
- Séparateur : virgule (`,`)
- Encodage : UTF-8
- Parser CSV simple (ne gère pas les virgules dans les valeurs)
- Pas de limite de taille de fichier (à considérer pour la production)

## Recommandations

1. **Tester avec un petit fichier** avant d'importer un grand volume
2. **Vérifier les codes de parrainage** avant l'import
3. **Nettoyer les données** dans Excel/Calc avant l'export CSV
4. **Informer les membres** de leur mot de passe par défaut (`Nou491094`)
5. **Vérifier le rapport d'import** pour identifier les erreurs
6. **Traiter les lignes en erreur** séparément si nécessaire

## Améliorations futures

- Support des virgules dans les valeurs (CSV avec guillemets)
- Prévisualisation avant import
- Import asynchrone pour gros fichiers
- Export du rapport en CSV/PDF
- Envoi automatique des mots de passe par email/SMS
- Mise à jour des membres existants (option)
- Import incrémental (reprendre après erreur)
