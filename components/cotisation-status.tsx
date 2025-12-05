'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { adminService } from '@/lib/api';

interface CotisationStatusProps {
  membreId: number;
  token: string;
}

interface CotisationSummary {
  total_paye: number;
  solde_restant: number;
  est_complet: boolean;
  nombre_versements: number;
  versements: Array<{
    id: number;
    montant: number;
    date_paiement: string;
    statut_paiement: string;
  }>;
}

export function CotisationStatus({ membreId, token }: CotisationStatusProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CotisationSummary | null>(null);
  const COTISATION_ANNUELLE = 1500;
  const MINIMUM_PREMIER_VERSEMENT = 150;

  useEffect(() => {
    loadSummary();
  }, [membreId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      // Charger toutes les cotisations validées du membre
      const result = await adminService.getCotisations(
        { membre_id: membreId, statut: 'validé', limit: 100 },
        token
      );

      if (result.success && result.data) {
        const versements = result.data.data;
        const totalPaye = versements.reduce((sum, v) => sum + v.montant, 0);
        const soldeRestant = Math.max(0, COTISATION_ANNUELLE - totalPaye);
        const estComplet = totalPaye >= COTISATION_ANNUELLE;

        setSummary({
          total_paye: totalPaye,
          solde_restant: soldeRestant,
          est_complet: estComplet,
          nombre_versements: versements.length,
          versements: versements.map(v => ({
            id: v.id,
            montant: v.montant,
            date_paiement: v.date_paiement || '',
            statut_paiement: v.statut_paiement,
          })),
        });
      }
    } catch (error) {
      console.error('Erreur chargement statut cotisation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const pourcentage = Math.min(100, (summary.total_paye / COTISATION_ANNUELLE) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Statut de cotisation annuelle</span>
          {summary.est_complet ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Complète
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              En cours
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de progression */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-semibold">{pourcentage.toFixed(0)}%</span>
          </div>
          <Progress value={pourcentage} className="h-3" />
        </div>

        {/* Résumé financier */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Cotisation annuelle</p>
            <p className="text-lg font-bold">{COTISATION_ANNUELLE} HTG</p>
          </div>
          <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700 mb-1">Total payé</p>
            <p className="text-lg font-bold text-green-900">{summary.total_paye} HTG</p>
          </div>
          <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-700 mb-1">Solde restant</p>
            <p className="text-lg font-bold text-orange-900">{summary.solde_restant} HTG</p>
          </div>
        </div>

        {/* Informations versements */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Nombre de versements validés</span>
            <Badge variant="outline">{summary.nombre_versements}</Badge>
          </div>
          {summary.nombre_versements === 0 && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Premier versement minimum : {MINIMUM_PREMIER_VERSEMENT} HTG
            </p>
          )}
        </div>

        {/* Liste des versements */}
        {summary.versements.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Historique des versements</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {summary.versements.map((v, index) => (
                <div
                  key={v.id}
                  className="flex justify-between items-center text-sm p-2 bg-muted rounded"
                >
                  <span className="text-muted-foreground">
                    Versement #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{v.montant} HTG</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.date_paiement).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message si solde restant */}
        {!summary.est_complet && summary.solde_restant > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Prochain versement :</strong> Minimum {Math.min(summary.solde_restant, MINIMUM_PREMIER_VERSEMENT)} HTG
              {summary.solde_restant < MINIMUM_PREMIER_VERSEMENT && ' (solde final)'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
