'use client';

import { useEffect, useState, use } from 'react';
import { adminService } from '@/lib/api';
import { Membre } from '@/types/backend';
import { CotisationStatus } from '@/components/cotisation-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function MembreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [membre, setMembre] = useState<Membre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const fetchMembre = async () => {
      if (!id) {
        setError("ID du membre manquant.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Récupérer le token
        const authResponse = await fetch('/api/auth/me');
        const { token: userToken } = await authResponse.json();
        
        if (!userToken) {
          setError("Token d'authentification introuvable.");
          setLoading(false);
          return;
        }
        
        setToken(userToken);
        
        // Récupérer les détails du membre
        const response = await adminService.getMembreById(id, userToken);
        if (response.success) {
          setMembre(response.data || null);
        } else {
          setError(response.message || "Erreur lors de la récupération du membre.");
        }
      } catch (err) {
        setError("Une erreur inattendue est survenue.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembre();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!membre) {
    return <div className="text-center">Membre non trouvé.</div>;
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Détails du Membre</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
           <Card>
             <CardHeader className="flex flex-row items-center space-x-4">
               <Avatar className="h-16 w-16">
                 <AvatarImage src={membre.photo_profil_url} alt={membre.prenom} />
                 <AvatarFallback>{getInitials(`${membre.prenom} ${membre.nom}`)}</AvatarFallback>
               </Avatar>
               <div>
                  <CardTitle className="text-2xl">{membre.prenom} {membre.nom}</CardTitle>
                  <p className="text-sm text-muted-foreground">{membre.email}</p>
               </div>
             </CardHeader>
             <CardContent>
                <p><strong>Téléphone :</strong> {membre.telephone}</p>
                <p><strong>Ville :</strong> {membre.ville}</p>
                <p><strong>Membre depuis le :</strong> {membre.date_creation ? new Date(membre.date_creation).toLocaleDateString() : 'N/A'}</p>
                <div className="mt-2">
                  <p className="mb-1"><strong>Note :</strong></p>
                  {token && (function() {
                    const { MemberRating } = require("@/components/member-rating");
                    return <MemberRating membre={membre} token={token} onUpdated={(r: number) => setMembre({ ...membre, rating: r })} />;
                  })()}
                </div>
             </CardContent>
           </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Statut de Cotisation Annuelle</CardTitle>
                </CardHeader>
                <CardContent>
                    {token && <CotisationStatus membreId={Number(id)} token={token} />}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
