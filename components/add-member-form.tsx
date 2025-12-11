'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { adminService } from '@/lib/api';

interface AddMemberFormProps {
  token: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function AddMemberForm({
  token,
  onSuccess,
  onClose,
}: AddMemberFormProps) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    surnom: '',
    sexe: '',
    date_de_naissance: '',
    lieu_de_naissance: '',
    nom_pere: '',
    nom_mere: '',
    situation_matrimoniale: '',
    nb_enfants: '0',
    nb_personnes_a_charge: '0',
    nin: '',
    nif: '',
    telephone_principal: '',
    telephone_etranger: '',
    email: '',
    adresse_complete: '',
    profession: '',
    occupation: '',
    departement: '',
    commune: '',
    section_communale: '',
    facebook: '',
    instagram: '',
    a_ete_membre_politique: false,
    nom_parti_precedent: '',
    role_politique_precedent: '',
    a_ete_membre_organisation: false,
    nom_organisation_precedente: '',
    role_organisation_precedent: '',
    referent_nom: '',
    referent_prenom: '',
    referent_adresse: '',
    referent_telephone: '',
    relation_avec_referent: '',
    a_ete_condamne: false,
    a_viole_loi_drogue: false,
    a_participe_activite_terroriste: false,
    code_parrain: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      // Ajouter le mot de passe par défaut
      const dataToSend = {
        ...formData,
        password: 'Nou491094', // Mot de passe par défaut
        // Générer le username si nécessaire
        username: formData.prenom && formData.nom 
          ? `${formData.prenom.toLowerCase()}.${formData.nom.toLowerCase()}`.replace(/[^a-z0-9._]/g, '')
          : '',
      };

      const result = await adminService.createMembre(dataToSend, token);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message || 'Échec de la création du membre');
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue.');
      console.error('Échec de la création du membre', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau membre</DialogTitle>
          <p className="text-sm text-muted-foreground">Le mot de passe par défaut sera: Nou491094</p>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom">Nom *</Label>
                <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="prenom">Prénom *</Label>
                <Input id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="surnom">Surnom</Label>
                <Input id="surnom" name="surnom" value={formData.surnom} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="sexe">Sexe *</Label>
                <Select value={formData.sexe} onValueChange={(value) => handleSelectChange('sexe', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Homme">Homme</SelectItem>
                    <SelectItem value="Femme">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date_de_naissance">Date de naissance *</Label>
                <Input id="date_de_naissance" name="date_de_naissance" type="date" value={formData.date_de_naissance} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="lieu_de_naissance">Lieu de naissance *</Label>
                <Input id="lieu_de_naissance" name="lieu_de_naissance" value={formData.lieu_de_naissance} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="nom_pere">Nom du père</Label>
                <Input id="nom_pere" name="nom_pere" value={formData.nom_pere} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="nom_mere">Nom de la mère</Label>
                <Input id="nom_mere" name="nom_mere" value={formData.nom_mere} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="situation_matrimoniale">Situation matrimoniale</Label>
                <Select value={formData.situation_matrimoniale} onValueChange={(value) => handleSelectChange('situation_matrimoniale', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Célibataire">Célibataire</SelectItem>
                    <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                    <SelectItem value="Divorcé(e)">Divorcé(e)</SelectItem>
                    <SelectItem value="Veuf(ve)">Veuf(ve)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nb_enfants">Nombre d&apos;enfants</Label>
                <Input id="nb_enfants" name="nb_enfants" type="number" value={formData.nb_enfants} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="nb_personnes_a_charge">Personnes à charge</Label>
                <Input id="nb_personnes_a_charge" name="nb_personnes_a_charge" type="number" value={formData.nb_personnes_a_charge} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Documents d'identité */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Documents d&apos;identité</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nin">NIN (Numéro d&apos;Identification Nationale) *</Label>
                <Input id="nin" name="nin" value={formData.nin} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="nif">NIF (Numéro d&apos;Identification Fiscale)</Label>
                <Input id="nif" name="nif" value={formData.nif} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telephone_principal">Téléphone principal *</Label>
                <Input id="telephone_principal" name="telephone_principal" value={formData.telephone_principal} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="telephone_etranger">Téléphone étranger</Label>
                <Input id="telephone_etranger" name="telephone_etranger" value={formData.telephone_etranger} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" name="facebook" value={formData.facebook} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Localisation</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="adresse_complete">Adresse complète *</Label>
                <Input id="adresse_complete" name="adresse_complete" value={formData.adresse_complete} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="departement">Département *</Label>
                <Input id="departement" name="departement" value={formData.departement} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="commune">Commune *</Label>
                <Input id="commune" name="commune" value={formData.commune} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="section_communale">Section communale</Label>
                <Input id="section_communale" name="section_communale" value={formData.section_communale} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Professionnel */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Professionnel</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profession">Profession</Label>
                <Input id="profession" name="profession" value={formData.profession} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Historique politique/organisation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Historique politique et organisation</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="a_ete_membre_politique" 
                  checked={formData.a_ete_membre_politique}
                  onCheckedChange={(checked) => handleCheckboxChange('a_ete_membre_politique', checked as boolean)}
                />
                <Label htmlFor="a_ete_membre_politique">A été membre d&apos;un parti politique</Label>
              </div>
              {formData.a_ete_membre_politique && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="nom_parti_precedent">Nom du parti</Label>
                    <Input id="nom_parti_precedent" name="nom_parti_precedent" value={formData.nom_parti_precedent} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="role_politique_precedent">Rôle</Label>
                    <Input id="role_politique_precedent" name="role_politique_precedent" value={formData.role_politique_precedent} onChange={handleChange} />
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="a_ete_membre_organisation" 
                  checked={formData.a_ete_membre_organisation}
                  onCheckedChange={(checked) => handleCheckboxChange('a_ete_membre_organisation', checked as boolean)}
                />
                <Label htmlFor="a_ete_membre_organisation">A été membre d&apos;une organisation</Label>
              </div>
              {formData.a_ete_membre_organisation && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="nom_organisation_precedente">Nom de l&apos;organisation</Label>
                    <Input id="nom_organisation_precedente" name="nom_organisation_precedente" value={formData.nom_organisation_precedente} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="role_organisation_precedent">Rôle</Label>
                    <Input id="role_organisation_precedent" name="role_organisation_precedent" value={formData.role_organisation_precedent} onChange={handleChange} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Référent */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Référent</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referent_nom">Nom du référent</Label>
                <Input id="referent_nom" name="referent_nom" value={formData.referent_nom} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="referent_prenom">Prénom du référent</Label>
                <Input id="referent_prenom" name="referent_prenom" value={formData.referent_prenom} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="referent_telephone">Téléphone du référent</Label>
                <Input id="referent_telephone" name="referent_telephone" value={formData.referent_telephone} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="relation_avec_referent">Relation avec le référent</Label>
                <Input id="relation_avec_referent" name="relation_avec_referent" value={formData.relation_avec_referent} onChange={handleChange} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="referent_adresse">Adresse du référent</Label>
                <Input id="referent_adresse" name="referent_adresse" value={formData.referent_adresse} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Vérifications légales */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Vérifications légales</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="a_ete_condamne" 
                  checked={formData.a_ete_condamne}
                  onCheckedChange={(checked) => handleCheckboxChange('a_ete_condamne', checked as boolean)}
                />
                <Label htmlFor="a_ete_condamne">A été condamné</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="a_viole_loi_drogue" 
                  checked={formData.a_viole_loi_drogue}
                  onCheckedChange={(checked) => handleCheckboxChange('a_viole_loi_drogue', checked as boolean)}
                />
                <Label htmlFor="a_viole_loi_drogue">A violé la loi sur les drogues</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="a_participe_activite_terroriste" 
                  checked={formData.a_participe_activite_terroriste}
                  onCheckedChange={(checked) => handleCheckboxChange('a_participe_activite_terroriste', checked as boolean)}
                />
                <Label htmlFor="a_participe_activite_terroriste">A participé à une activité terroriste</Label>
              </div>
            </div>
          </div>

          {/* Parrainage */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Parrainage</h3>
            <div>
              <Label htmlFor="code_parrain">Code de parrainage *</Label>
              <Input id="code_parrain" name="code_parrain" value={formData.code_parrain} onChange={handleChange} placeholder="Ex: AJD1234" required />
              <p className="text-xs text-muted-foreground mt-1">Le code d&apos;adhésion d&apos;un membre existant</p>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Création...' : 'Créer le membre'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
