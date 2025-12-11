'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

interface ImportResult {
  success: number;
  errors: ValidationError[];
  skipped: number;
  details: {
    created: Array<{ nom: string; prenom: string; code_adhesion: string }>;
    duplicates: Array<{ nom: string; prenom: string; reason: string }>;
  };
}

export default function ImportMembresPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Veuillez sélectionner un fichier CSV');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/api/membres/template';
  };

  const handleImport = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier CSV');
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/membres/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Une erreur est survenue lors de l\'import');
      }
    } catch (err) {
      console.error('Erreur import:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/membres">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Upload className="h-8 w-8" />
            Import de membres (CSV)
          </h1>
          <p className="text-muted-foreground">Importez plusieurs membres depuis un fichier CSV</p>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>Suivez ces étapes pour importer vos membres</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Téléchargez le template CSV
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Le template contient tous les champs nécessaires avec un exemple de ligne.
            </p>
            <Button onClick={handleDownloadTemplate} variant="outline" className="ml-8">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le template
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Remplissez le fichier CSV
            </h3>
            <ul className="text-sm text-muted-foreground ml-8 space-y-1 list-disc list-inside">
              <li>Tous les champs sont importants pour collecter un maximum d&apos;informations</li>
              <li>Le <strong>code_parrain</strong> doit exister dans la base de données (si fourni)</li>
              <li>Le <strong>code_adhesion</strong> sera généré automatiquement (format: A + initiale prénom + initiale nom + 4 derniers chiffres du téléphone)</li>
              <li>Le <strong>username</strong> sera généré automatiquement (prenom.nom)</li>
              <li>Le mot de passe par défaut sera <strong>Nou491094</strong> pour tous les membres importés</li>
              <li>Les champs obligatoires: nom, prénom, sexe, date_de_naissance, lieu_de_naissance, nin, téléphone_principal, adresse_complete, département, commune</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">3</span>
              Uploadez et importez
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Sélectionnez votre fichier CSV rempli et lancez l&apos;import.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload du fichier CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="csv-file" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-2">
                    {file ? file.name : 'Cliquez pour sélectionner un fichier CSV'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Format accepté: .csv
                  </p>
                </div>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {file && (
            <Button onClick={handleImport} disabled={importing} className="w-full">
              {importing ? (
                <>Importation en cours...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Lancer l&apos;import
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Result */}
      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Résumé de l&apos;import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{result.success}</p>
                  <p className="text-sm text-muted-foreground">Membres créés</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{result.skipped}</p>
                  <p className="text-sm text-muted-foreground">Lignes ignorées</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{result.errors.length}</p>
                  <p className="text-sm text-muted-foreground">Erreurs détectées</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Created Members */}
          {result.details.created.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Membres créés ({result.details.created.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.details.created.map((member, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="font-medium">{member.prenom} {member.nom}</span>
                      <span className="text-sm text-muted-foreground">Code: {member.code_adhesion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Errors and Duplicates */}
          {(result.errors.length > 0 || result.details.duplicates.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Erreurs et doublons ({result.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.details.duplicates.map((dup, index) => (
                    <div key={index} className="p-3 bg-orange-50 rounded">
                      <p className="font-medium">{dup.prenom} {dup.nom}</p>
                      <p className="text-sm text-orange-700">{dup.reason}</p>
                    </div>
                  ))}
                  {result.errors.filter(e => !result.details.duplicates.find(d => 
                    e.message.includes(d.reason)
                  )).map((err, index) => (
                    <div key={`err-${index}`} className="p-3 bg-red-50 rounded">
                      <p className="font-medium text-red-700">Ligne {err.row}</p>
                      <p className="text-sm text-red-600">{err.field}: {err.message}</p>
                      {err.value && <p className="text-xs text-muted-foreground">Valeur: {err.value}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              N&apos;oubliez pas d&apos;informer les nouveaux membres que leur mot de passe par défaut est <strong>Nou491094</strong>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
