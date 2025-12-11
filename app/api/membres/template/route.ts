import { NextResponse } from 'next/server';

export async function GET() {
  // Définir tous les champs du CSV template basés sur la structure de la table membres
  const headers = [
    'nom',
    'prenom',
    'surnom',
    'sexe',
    'date_de_naissance',
    'lieu_de_naissance',
    'nom_pere',
    'nom_mere',
    'situation_matrimoniale',
    'nb_enfants',
    'nb_personnes_a_charge',
    'nin',
    'nif',
    'telephone_principal',
    'telephone_etranger',
    'email',
    'adresse_complete',
    'profession',
    'occupation',
    'departement',
    'commune',
    'section_communale',
    'facebook',
    'instagram',
    'a_ete_membre_politique',
    'nom_parti_precedent',
    'role_politique_precedent',
    'a_ete_membre_organisation',
    'nom_organisation_precedente',
    'role_organisation_precedent',
    'referent_nom',
    'referent_prenom',
    'referent_adresse',
    'referent_telephone',
    'relation_avec_referent',
    'a_ete_condamne',
    'a_violé_loi_drogue',
    'a_participe_activite_terroriste',
    'code_parrain',
  ];

  // Exemple de ligne pour guider l'utilisateur
  const exampleRow = [
    'Dupont',
    'Jean',
    'JD',
    'Homme',
    '1990-01-15',
    'Port-au-Prince',
    'Pierre Dupont',
    'Marie Dupont',
    'Célibataire',
    '0',
    '2',
    '123-456-7890',
    '987-654-3210',
    '50912345678',
    '+33612345678',
    'jean.dupont@example.com',
    '123 Rue Example, Port-au-Prince',
    'Ingénieur',
    'Développeur',
    'Ouest',
    'Port-au-Prince',
    'Section 1',
    'jean.dupont',
    '@jeandupont',
    '0',
    '',
    '',
    '0',
    '',
    '',
    'Paul Martin',
    'Sophie Martin',
    '456 Rue Référent',
    '50987654321',
    'Ami',
    '0',
    '0',
    '0',
    'AJD5678',
  ];

  // Générer le contenu CSV avec BOM UTF-8 pour Excel
  const csvContent = [
    headers.join(','),
    exampleRow.join(','),
  ].join('\n');

  // Ajouter le BOM UTF-8 pour que Excel reconnaisse l'encodage
  const utf8BOM = '\uFEFF';
  const csvWithBOM = utf8BOM + csvContent;

  // Retourner le fichier CSV
  return new NextResponse(csvWithBOM, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="template_import_membres.csv"',
    },
  });
}
