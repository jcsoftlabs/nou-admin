'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/lib/api';
import { AuditLog } from '@/types/backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Calendar, User, Activity } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    action_type: '',
    user_id: undefined as number | undefined,
    date_debut: '',
    date_fin: '',
  });
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/me');
      const { token: userToken } = await response.json();
      setToken(userToken);

      if (!userToken) {
        setError("Token d'authentification introuvable.");
        setLoading(false);
        return;
      }

      const result = await adminService.getAuditLogs(filters, userToken);
      if (result.success && result.data) {
        setLogs(result.data.data);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError(result.message || "Impossible de charger les logs.");
        setLogs([]);
      }
    } catch (err) {
      console.error('Erreur chargement audit logs:', err);
      setError("Une erreur critique est survenue.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'default';
    if (action.includes('UPDATE')) return 'secondary';
    if (action.includes('DELETE')) return 'destructive';
    return 'outline';
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    loadLogs();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des logs d&apos;audit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadLogs} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground">
          Historique de toutes les actions administratives
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Type d&apos;action</label>
              <Input
                placeholder="CREATE_MEMBRE, UPDATE_..."
                value={filters.action_type}
                onChange={(e) =>
                  setFilters({ ...filters, action_type: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input
                type="number"
                placeholder="ID de l&apos;admin"
                value={filters.user_id || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    user_id: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date début</label>
              <Input
                type="date"
                value={filters.date_debut}
                onChange={(e) =>
                  setFilters({ ...filters, date_debut: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date fin</label>
              <Input
                type="date"
                value={filters.date_fin}
                onChange={(e) =>
                  setFilters({ ...filters, date_fin: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Heure</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(log.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          {log.user ? (
                            <>
                              <p className="font-medium">
                                {log.user.prenom} {log.user.nom}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                @{log.user.username}
                              </p>
                            </>
                          ) : (
                            <span className="text-muted-foreground">
                              Utilisateur #{log.user_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionColor(log.action_type) as "default" | "destructive" | "outline" | "secondary" | null | undefined}>
                        {log.action_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.target_type && (
                        <div className="text-sm">
                          <p className="font-medium">{log.target_type}</p>
                          {log.target_id && (
                            <p className="text-muted-foreground">ID: {log.target_id}</p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.ip_address || '-'}
                    </TableCell>
                    <TableCell>
                      {(log.data_before || log.data_after) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            alert(
                              `Avant:\\n${JSON.stringify(log.data_before, null, 2)}\\n\\nAprès:\\n${JSON.stringify(log.data_after, null, 2)}`
                            );
                          }}
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    Aucun log trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          disabled={filters.page === 1}
        >
          Précédent
        </Button>
        <span className="flex items-center px-4">
          Page {filters.page} sur {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          disabled={filters.page >= totalPages}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
