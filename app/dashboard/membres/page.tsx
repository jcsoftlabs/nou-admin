'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Search, UserCircle, Eye, Edit } from 'lucide-react';
import { adminService } from '@/lib/api';
import { Membre } from '@/types/backend';
import { EditMemberStatus } from '@/components/edit-member-status';
import { AddMemberForm } from '@/components/add-member-form';

export default function MembresPage() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departementFilter, setDepartementFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingMembre, setEditingMembre] = useState<Membre | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    loadMembres();
  }, [page]);

  const loadMembres = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/me');
      const { token: userToken } = await response.json();
      setToken(userToken);

      if (!userToken) {
        setError("Token d&apos;authentification introuvable. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      const result = await adminService.getMembres(
        { page, limit: 20, search: searchTerm, role: roleFilter === 'all' ? undefined : roleFilter, departement: departementFilter },
        userToken
      );

      if (result.success && result.data) {
        setMembres(result.data.data);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError(result.message || "Impossible de charger les membres.");
        setMembres([]);
      }
    } catch (err) {
      console.error('Erreur chargement membres:', err);
      setError("Une erreur critique est survenue lors du chargement des membres.");
      setMembres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadMembres();
  };

  const getRoleBadge = (membre: Membre) => {
    const role = membre.role || membre.role_utilisateur;
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary" | null | undefined> = {
      admin: 'destructive',
      partner: 'secondary',
      membre: 'default',
    };
    return <Badge variant={variants[role || 'membre']}>{role || 'membre'}</Badge>;
  };

  const getStatutBadge = (statut?: string) => {
    if (!statut) return <span className="text-muted-foreground">-</span>;
    return <Badge variant="outline">{statut}</Badge>;
  };

  if (loading && membres.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des membres...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadMembres} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
<div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCircle className="h-8 w-8" />
            Membres
          </h1>
          <p className="text-muted-foreground">Gérez tous les membres de l&apos;organisation</p>
        </div>
        <Button onClick={() => setIsAddingMember(true)}>Ajouter un membre</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nom, username, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Rôle</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="membre">Membre</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Département</label>
              <Input
                placeholder="Filtrer par département"
                value={departementFilter}
                onChange={(e) => setDepartementFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                Rechercher
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom complet</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Code adhésion</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membres.length > 0 ? (
                membres.map((membre) => (
                  <TableRow key={membre.id}>
                    <TableCell>{membre.prenom} {membre.nom}</TableCell>
                    <TableCell>{membre.email || '-'}</TableCell>
                    <TableCell>{membre.telephone_principal}</TableCell>
                    <TableCell><Badge variant="outline">{membre.code_adhesion}</Badge></TableCell>
                    <TableCell>{membre.departement || '-'}</TableCell>
                    <TableCell>{getRoleBadge(membre)}</TableCell>
                    <TableCell>{getStatutBadge(membre.statut)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" asChild className="mr-2">
                        <Link href={`/dashboard/membres/${membre.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingMembre(membre)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    Aucun membre trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
          Précédent
        </Button>
        <span className="flex items-center px-4">Page {page} sur {totalPages}</span>
        <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
          Suivant
        </Button>
      </div>


      {editingMembre && (
        <EditMemberStatus
          membre={editingMembre}
          token={token}
          onClose={() => setEditingMembre(null)}
          onSuccess={() => {
            setEditingMembre(null);
            loadMembres();
          }}
        />
      )}

      {isAddingMember && (
        <AddMemberForm
          token={token}
          onClose={() => setIsAddingMember(false)}
          onSuccess={() => {
            setIsAddingMember(false);
            loadMembres();
          }}
        />
      )}
    </div>
  );
}
