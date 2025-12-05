'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, CreditCard, UserPlus, DollarSign } from 'lucide-react';
import { adminService } from '@/lib/api';
import { GlobalStats, MonthlyStats } from '@/types/backend';

export default function DashboardPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyStats>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) throw new Error('Non authentifié');
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

        // Charger les statistiques mensuelles
        setLoadingMonthly(true);
        setMonthlyError(null);
        const monthlyResult = await adminService.getMonthlyStats(token);
        if (monthlyResult.success && monthlyResult.data) {
          setMonthlyData(monthlyResult.data);
        } else {
          setMonthlyError(monthlyResult.message || 'Échec du chargement des statistiques mensuelles');
        }
        setLoadingMonthly(false);
      } catch (err: unknown) {
        const error = err as Error;
        console.error('Erreur chargement données:', error);
        setError(error.message || 'Erreur de connexion au serveur');
        setLoading(false);
        setLoadingMonthly(false);
      }
    };

    loadData();
  }, []);

  const statsCards = stats ? [
    {
      title: 'Total Membres',
      value: stats.total_membres.toLocaleString(),
      icon: Users,
      description: `+${stats.nouveaux_membres_ce_mois} ce mois-ci`,
    },
    {
      title: 'Cotisations validées',
      value: stats.total_cotisations.toLocaleString(),
      icon: CreditCard,
      description: `${stats.cotisations_en_attente} en attente`,
    },
    {
      title: 'Total Filleuls',
      value: stats.total_filleuls.toLocaleString(),
      icon: UserPlus,
      description: `${stats.total_points_parrainage} points générés`,
    },
    {
      title: 'Revenus Totals',
      value: `${stats.total_revenus.toLocaleString()} HTG`,
      icon: DollarSign,
      description: 'Total collecté',
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue dans votre espace d&apos;administration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Croissance mensuelle</CardTitle>
            <CardDescription>Nombre de membres et cotisations par mois</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMonthly ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : monthlyError ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-red-600 text-sm">{monthlyError}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="membres" fill="#3b82f6" name="Nouveaux membres" />
                  <Bar dataKey="cotisations" fill="#10b981" name="Cotisations" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendances</CardTitle>
            <CardDescription>Évolution au fil du temps</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMonthly ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : monthlyError ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-red-600 text-sm">{monthlyError}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="membres" stroke="#3b82f6" strokeWidth={2} name="Nouveaux membres" />
                  <Line type="monotone" dataKey="cotisations" stroke="#10b981" strokeWidth={2} name="Cotisations" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
