'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminService } from '@/lib/api';
import { Membre } from '@/types/backend';

interface EditMemberStatusProps {
  membre: Membre;
  token: string;
  onSuccess: () => void;
  onClose: () => void;
}

// Statuts par défaut (fallback)
const defaultStatuts = [
  'Membre pré-adhérent',
  'Membre adhérent',
  'Membre spécial',
  'Chef d\'\u00e9quipe',
  'Dirigeant',
  'Leader',
  'Dirigeant national',
  'Dirigeant départemental',
  'Dirigeant communal',
  'Dirigeant section communale',
];

export function EditMemberStatus({
  membre,
  token,
  onSuccess,
  onClose,
}: EditMemberStatusProps) {
  const [newStatus, setNewStatus] = useState(membre.statut || '');
  const [statuts, setStatuts] = useState<string[]>(defaultStatuts);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingStatuts, setIsLoadingStatuts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les statuts depuis le backend
  useEffect(() => {
    const loadStatuts = async () => {
      try {
        const result = await adminService.getStatuts(token);
        if (result.success && result.data && result.data.length > 0) {
          setStatuts(result.data);
        }
      } catch (err) {
        console.error('Erreur chargement statuts, utilisation des valeurs par défaut:', err);
      } finally {
        setIsLoadingStatuts(false);
      }
    };
    loadStatuts();
  }, [token]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      const result = await adminService.updateMembreStatus(
        membre.id,
        newStatus,
        token
      );
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message || 'Failed to update status');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Failed to update status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le statut de {membre.username}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoadingStatuts ? (
            <p className="text-muted-foreground text-sm">Chargement des statuts...</p>
          ) : (
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {statuts.map((statut) => (
                  <SelectItem key={statut} value={statut}>
                    {statut}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Annuler
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? 'Mise a jour...' : 'Mettre a jour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
