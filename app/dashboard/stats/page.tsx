'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, DollarSign, Trophy, TrendingUp } from 'lucide-react';
import { adminService } from '@/lib/api';
import { GlobalStats, DepartmentStats } from '@/types/backend';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function StatsPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentStats>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDepartment, setLoadingDepartment] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const { token } = await response.json();
      
      // Charger les statistiques globales
      setLoading(true);
      setError(null);
      const statsResult = await adminService.getStats(token);
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      } else {
        setError(statsResult.message || 'Échec du chargement des statistiques');
      }
      setLoading(false);

      // Charger les statistiques par département
      setLoadingDepartment(true);
      setDepartmentError(null);
      const deptResult = await adminService.getDepartmentStats(token);
      if (deptResult.success && deptResult.data) {
        setDepartmentData(deptResult.data);
      } else {
        setDepartmentError(deptResult.message || 'Échec du chargement des statistiques par département');
      }
      setLoadingDepartment(false);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setError('Erreur lors du chargement des statistiques');
      setLoading(false);
      setLoadingDepartment(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Palette de couleurs pour les départements
  const departmentColors = [
    '#3b82f6', // Bleu
    '#10b981', // Vert
    '#f59e0b', // Orange
    '#8b5cf6', // Violet
    '#ef4444', // Rouge
    '#06b6d4', // Cyan
    '#ec4899', // Rose
    '#84cc16', // Vert citron
    '#f97316', // Orange foncé
    '#6366f1', // Indigo
  ];

  // Données pour les graphiques
  const statusData = [
    { name: 'Validé', value: stats?.total_cotisations || 0, color: '#10b981' },
    { name: 'En attente', value: stats?.cotisations_en_attente || 0, color: '#f59e0b' },
  ];

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadStats} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Statistiques</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble des données importantes
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Membres</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.total_membres.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              {stats?.nouveaux_membres_ce_mois || 0} nouveaux ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cotisations validées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.total_cotisations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stats?.cotisations_en_attente || 0} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total collecté</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.total_revenus.toLocaleString()} HTG
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              Revenus total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux de validation</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.total_filleuls || 0}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              Total filleuls parrains
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Membres par département</CardTitle>
            <CardDescription>Répartition géographique</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDepartment ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : departmentError ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-red-600 text-sm">{departmentError}</p>
              </div>
            ) : departmentData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Aucune donnée disponible</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="membres" name="Membres">
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={departmentColors[index % departmentColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut des cotisations</CardTitle>
            <CardDescription>Répartition par statut de paiement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques additionnelles */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Podcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats?.total_podcasts || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total publiés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats?.total_quiz || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total créés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Formations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats?.total_formations || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total disponibles</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
