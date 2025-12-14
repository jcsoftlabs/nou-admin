import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Configuration de la connexion à la base de données
const dbConfig = {
  host: 'mainline.proxy.rlwy.net',
  port: 18580,
  user: 'root',
  password: 'VWFBfLFIbLyuDfShvwscmlAUEtmmQEhz',
  database: 'railway',
};

interface CSVRow {
  nom: string;
  prenom: string;
  surnom?: string;
  sexe: string;
  date_de_naissance: string;
  lieu_de_naissance: string;
  nom_pere?: string;
  nom_mere?: string;
  situation_matrimoniale?: string;
  nb_enfants?: string;
  nb_personnes_a_charge?: string;
  nin: string;
  nif?: string;
  telephone_principal: string;
  telephone_etranger?: string;
  email?: string;
  adresse_complete: string;
  profession?: string;
  occupation?: string;
  departement: string;
  commune: string;
  section_communale?: string;
  facebook?: string;
  instagram?: string;
  a_ete_membre_politique?: string;
  nom_parti_precedent?: string;
  role_politique_precedent?: string;
  a_ete_membre_organisation?: string;
  nom_organisation_precedente?: string;
  role_organisation_precedent?: string;
  referent_nom?: string;
  referent_prenom?: string;
  referent_adresse?: string;
  referent_telephone?: string;
  relation_avec_referent?: string;
  a_ete_condamne?: string;
  a_violé_loi_drogue?: string;
  a_participe_activite_terroriste?: string;
  code_parrain?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

interface ImportResult {
  success: number;
  errors: ValidationError[];
  skipped: number;
  details: {
    created: Array<{ nom: string; prenom: string; code_adhesion: string }>;
    duplicates: Array<{ nom: string; prenom: string; reason: string }>;
  };
}

// Fonction pour générer le code d'adhésion selon l'algorithme du backend
async function generateCodeAdhesion(
  prenom: string,
  nom: string,
  telephone: string,
  connection: mysql.Connection
): Promise<string> {
  const digits = telephone.replace(/\D/g, '');
  
  if (!prenom || !nom || digits.length < 4) {
    throw new Error("Impossible de générer le code d'adhésion : prénom, nom ou téléphone invalide");
  }

  const firstLetterPrenom = prenom[0].toUpperCase();
  const firstLetterNom = nom[0].toUpperCase();
  const last4Phone = digits.slice(-4);

  const baseCode = `A${firstLetterPrenom}${firstLetterNom}${last4Phone}`;

  // Vérifier l'unicité et ajouter un suffixe si nécessaire
  let code = baseCode;
  let suffix = 0;

  while (true) {
    const [existing] = await connection.execute(
      'SELECT id FROM membres WHERE code_adhesion = ?',
      [code]
    );
    
    if ((existing as unknown[]).length === 0) {
      break;
    }
    
    suffix += 1;
    code = `${baseCode}${suffix}`;
  }

  return code;
}

// Fonction pour générer un username unique
async function generateUsername(
  prenom: string,
  nom: string,
  connection: mysql.Connection
): Promise<string> {
  const baseUsername = `${prenom.toLowerCase()}.${nom.toLowerCase()}`.replace(/[^a-z0-9._]/g, '');
  let username = baseUsername;
  let suffix = 1;

  while (true) {
    const [existing] = await connection.execute(
      'SELECT id FROM membres WHERE username = ?',
      [username]
    );
    
    if ((existing as unknown[]).length === 0) {
      break;
    }
    
    suffix += 1;
    username = `${baseUsername}${suffix}`;
  }

  return username;
}

// Parser CSV simple
function parseCSV(content: string): CSVRow[] {
  // Supprimer le BOM UTF-8 si présent
  let cleanContent = content;
  if (cleanContent.charCodeAt(0) === 0xFEFF) {
    cleanContent = cleanContent.slice(1);
  }

  const lines = cleanContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row as unknown as CSVRow);
  }

  return rows;
}

// Valider une ligne du CSV
async function validateRow(
  row: CSVRow,
  rowIndex: number,
  connection: mysql.Connection
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // Champs obligatoires
  if (!row.nom) errors.push({ row: rowIndex, field: 'nom', message: 'Le nom est obligatoire' });
  if (!row.prenom) errors.push({ row: rowIndex, field: 'prenom', message: 'Le prénom est obligatoire' });
  if (!row.sexe) errors.push({ row: rowIndex, field: 'sexe', message: 'Le sexe est obligatoire' });
  if (!row.date_de_naissance) errors.push({ row: rowIndex, field: 'date_de_naissance', message: 'La date de naissance est obligatoire' });
  if (!row.lieu_de_naissance) errors.push({ row: rowIndex, field: 'lieu_de_naissance', message: 'Le lieu de naissance est obligatoire' });
  if (!row.nin) errors.push({ row: rowIndex, field: 'nin', message: 'Le NIN est obligatoire' });
  if (!row.telephone_principal) errors.push({ row: rowIndex, field: 'telephone_principal', message: 'Le téléphone principal est obligatoire' });
  if (!row.adresse_complete) errors.push({ row: rowIndex, field: 'adresse_complete', message: 'L\'adresse complète est obligatoire' });
  if (!row.departement) errors.push({ row: rowIndex, field: 'departement', message: 'Le département est obligatoire' });
  if (!row.commune) errors.push({ row: rowIndex, field: 'commune', message: 'La commune est obligatoire' });

  // Vérifier les doublons
  if (row.email) {
    const [existingEmail] = await connection.execute(
      'SELECT id FROM membres WHERE email = ?',
      [row.email]
    );
    if ((existingEmail as unknown[]).length > 0) {
      errors.push({ row: rowIndex, field: 'email', message: 'Cet email existe déjà', value: row.email });
    }
  }

  if (row.telephone_principal) {
    const [existingPhone] = await connection.execute(
      'SELECT id FROM membres WHERE telephone_principal = ?',
      [row.telephone_principal]
    );
    if ((existingPhone as unknown[]).length > 0) {
      errors.push({ row: rowIndex, field: 'telephone_principal', message: 'Ce téléphone existe déjà', value: row.telephone_principal });
    }
  }

  if (row.nin) {
    const [existingNin] = await connection.execute(
      'SELECT id FROM membres WHERE nin = ?',
      [row.nin]
    );
    if ((existingNin as unknown[]).length > 0) {
      errors.push({ row: rowIndex, field: 'nin', message: 'Ce NIN existe déjà', value: row.nin });
    }
  }

  if (row.nif) {
    const [existingNif] = await connection.execute(
      'SELECT id FROM membres WHERE nif = ?',
      [row.nif]
    );
    if ((existingNif as unknown[]).length > 0) {
      errors.push({ row: rowIndex, field: 'nif', message: 'Ce NIF existe déjà', value: row.nif });
    }
  }

  // Vérifier le code parrain s'il est fourni
  if (row.code_parrain && row.code_parrain.trim()) {
    const [parrain] = await connection.execute(
      'SELECT id FROM membres WHERE code_adhesion = ?',
      [row.code_parrain]
    );
    if ((parrain as unknown[]).length === 0) {
      errors.push({ row: rowIndex, field: 'code_parrain', message: 'Code de parrainage invalide', value: row.code_parrain });
    }
  }

  return errors;
}

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;

  try {
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer le fichier CSV
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    const content = await file.text();
    const rows = parseCSV(content);

    // Connexion à la base de données
    connection = await mysql.createConnection(dbConfig);

    const result: ImportResult = {
      success: 0,
      errors: [],
      skipped: 0,
      details: {
        created: [],
        duplicates: [],
      },
    };

    // Mot de passe par défaut
    const defaultPassword = 'Nou491094';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Traiter chaque ligne
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 2; // +2 car ligne 1 = header, on commence à 2

      // Valider la ligne
      const validationErrors = await validateRow(row, rowIndex, connection);

      if (validationErrors.length > 0) {
        result.errors.push(...validationErrors);
        result.skipped++;
        result.details.duplicates.push({
          nom: row.nom || 'N/A',
          prenom: row.prenom || 'N/A',
          reason: validationErrors.map(e => e.message).join(', '),
        });
        continue;
      }

      try {
        // Générer le code d'adhésion et le username
        const codeAdhesion = await generateCodeAdhesion(
          row.prenom,
          row.nom,
          row.telephone_principal,
          connection
        );
        const username = await generateUsername(row.prenom, row.nom, connection);

        // Préparer les données pour l'insertion
        const insertData = {
          username,
          code_adhesion: codeAdhesion,
          code_parrain: row.code_parrain || null,
          nom: row.nom,
          prenom: row.prenom,
          surnom: row.surnom || null,
          sexe: row.sexe,
          lieu_de_naissance: row.lieu_de_naissance,
          date_de_naissance: row.date_de_naissance,
          nom_pere: row.nom_pere || null,
          nom_mere: row.nom_mere || null,
          situation_matrimoniale: row.situation_matrimoniale || null,
          nb_enfants: row.nb_enfants ? parseInt(row.nb_enfants) : 0,
          nb_personnes_a_charge: row.nb_personnes_a_charge ? parseInt(row.nb_personnes_a_charge) : 0,
          nin: row.nin,
          nif: row.nif || null,
          telephone_principal: row.telephone_principal,
          telephone_etranger: row.telephone_etranger || null,
          email: row.email || null,
          adresse_complete: row.adresse_complete,
          profession: row.profession || null,
          occupation: row.occupation || null,
          departement: row.departement,
          commune: row.commune,
          section_communale: row.section_communale || null,
          facebook: row.facebook || null,
          instagram: row.instagram || null,
          a_ete_membre_politique: row.a_ete_membre_politique === '1' ? 1 : 0,
          role_politique_precedent: row.role_politique_precedent || null,
          nom_parti_precedent: row.nom_parti_precedent || null,
          a_ete_membre_organisation: row.a_ete_membre_organisation === '1' ? 1 : 0,
          role_organisation_precedent: row.role_organisation_precedent || null,
          nom_organisation_precedente: row.nom_organisation_precedente || null,
          referent_nom: row.referent_nom || null,
          referent_prenom: row.referent_prenom || null,
          referent_adresse: row.referent_adresse || null,
          referent_telephone: row.referent_telephone || null,
          relation_avec_referent: row.relation_avec_referent || null,
          a_ete_condamne: row.a_ete_condamne === '1' ? 1 : 0,
          a_violé_loi_drogue: row.a_violé_loi_drogue === '1' ? 1 : 0,
          a_participe_activite_terroriste: row.a_participe_activite_terroriste === '1' ? 1 : 0,
          password_hash: passwordHash,
          role_utilisateur: 'membre',
          Statuts: 'Membre pré-adhérent',
        };

        // Insérer dans la base de données
        const fields = Object.keys(insertData);
        const placeholders = fields.map(() => '?').join(', ');
        const values = Object.values(insertData);

        await connection.execute(
          `INSERT INTO membres (${fields.join(', ')}) VALUES (${placeholders})`,
          values
        );

        result.success++;
        result.details.created.push({
          nom: row.nom,
          prenom: row.prenom,
          code_adhesion: codeAdhesion,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        result.errors.push({
          row: rowIndex,
          field: 'general',
          message: `Erreur lors de l'insertion: ${errorMessage}`,
        });
        result.skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import terminé: ${result.success} membre(s) créé(s), ${result.skipped} ligne(s) ignorée(s)`,
      data: result,
    });
  } catch (error) {
    console.error('Erreur import CSV:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { success: false, message: `Erreur: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
