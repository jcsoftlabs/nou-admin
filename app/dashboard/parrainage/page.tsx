'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/lib/api';
import { Membre } from '@/types/backend';
import { Users, TrendingUp, Award, Search } from 'lucide-react';

export default function ParrainagePage() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [filteredMembres, setFilteredMembres] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalParrains: 0,
    totalFilleuls: 0,
    avgFilleulsParParrain: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMembres();
  }, [searchTerm, membres]);

  const loadData = async () => {
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

      const result = await adminService.getMembres(
        { page: 1, limit: 1000 },
        userToken
      );
      
      if (result.success && result.data) {
        const allMembres = result.data.data;
        setMembres(allMembres);
        calculateStats(allMembres);
      } else {
        setError(result.message || "Impossible de charger les données de parrainage.");
        setMembres([]);
      }
    } catch (err) {
      console.error('Erreur chargement parrainage:', err);
      setError("Une erreur critique est survenue.");
      setMembres([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allMembres: Membre[]) => {
    const parrains = new Set(
      allMembres
        .filter((m) => m.code_parrain)
        .map((m) => m.code_parrain)
    );
    const totalParrains = parrains.size;
    const totalFilleuls = allMembres.filter((m) => m.code_parrain).length;
    const avgFilleuls = totalParrains > 0 ? totalFilleuls / totalParrains : 0;

    setStats({
      totalParrains,
      totalFilleuls,
      avgFilleulsParParrain: Math.round(avgFilleuls * 10) / 10,
    });
  };

  const filterMembres = () => {
    if (!searchTerm) {
      setFilteredMembres(membres);
      return;
    }

    const filtered = membres.filter(
      (m) =>
        m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code_adhesion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembres(filtered);
  };

  const getFilleuls = (codeAdhesion: string) => {
    return membres.filter((m) => m.code_parrain === codeAdhesion);
  };

  const getTopParrains = () => {
    const parrainMap = new Map<string, { membre: Membre; count: number }>();

    membres.forEach((membre) => {
      if (membre.code_parrain) {
        const parrain = membres.find((m) => m.code_adhesion === membre.code_parrain);
        if (parrain) {
          const existing = parrainMap.get(parrain.code_adhesion);
          if (existing) {
            existing.count++;
          } else {
            parrainMap.set(parrain.code_adhesion, { membre: parrain, count: 1 });
          }
        }
      }
    });

    return Array.from(parrainMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des données de parrainage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadData} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  const topParrains = getTopParrains();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Système de Parrainage
        </h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble du réseau de parrainage
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Parrains</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalParrains}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Membres avec au moins 1 filleul
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Filleuls</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalFilleuls}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Membres parrainés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Moyenne Filleuls</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.avgFilleulsParParrain}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Par parrain
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Parrains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Top 10 Parrains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topParrains.map((item, index) => {
              const filleuls = getFilleuls(item.membre.code_adhesion);
              return (
                <div
                  key={item.membre.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant={index < 3 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-semibold">
                        {item.membre.prenom} {item.membre.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{item.membre.username} • {item.membre.code_adhesion}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{item.count}</p>
                    <p className="text-xs text-muted-foreground">
                      filleul{item.count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Tree View */}
      <Card>
        <CardHeader>
          <CardTitle>Arbre de Parrainage</CardTitle>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre (nom, username, code)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMembres
              .filter((m) => getFilleuls(m.code_adhesion).length > 0)
              .slice(0, 20)
              .map((parrain) => {
                const filleuls = getFilleuls(parrain.code_adhesion);
                return (
                  <div key={parrain.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-lg">
                          {parrain.prenom} {parrain.nom}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{parrain.username} • {parrain.code_adhesion}
                        </p>
                      </div>
                      <Badge>{filleuls.length} filleul(s)</Badge>
                    </div>
                    <div className="ml-6 space-y-2 border-l-2 border-muted pl-4">
                      {filleuls.map((filleul) => (
                        <div
                          key={filleul.id}
                          className="flex items-center justify-between p-2 bg-accent/30 rounded"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {filleul.prenom} {filleul.nom}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{filleul.username}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {filleul.code_adhesion}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
