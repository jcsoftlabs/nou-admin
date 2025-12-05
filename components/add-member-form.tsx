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
    username: '',
    nom: '',
    prenom: '',
    email: '',
    telephone_principal: '',
    password: '',
    code_parrain: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const result = await adminService.createMembre(formData, token);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message || 'Failed to create member');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Failed to create member', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau membre</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" value={formData.username} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="nom">Nom</Label>
            <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="prenom">Prénom</Label>
            <Input id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="telephone_principal">Téléphone</Label>
            <Input id="telephone_principal" name="telephone_principal" value={formData.telephone_principal} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="code_parrain">Code de parrainage</Label>
            <Input id="code_parrain" name="code_parrain" value={formData.code_parrain} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Création...' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
