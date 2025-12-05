'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Link as LinkIcon, Plus } from 'lucide-react';
import { adminService } from '@/lib/api';
import { Quiz } from '@/types/backend';

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, [page]);

  const loadQuizzes = async () => {
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

      const result = await adminService.getQuiz(page, 20, undefined, userToken);
      if (result.success && result.data) {
        setQuizzes(result.data.data);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError(result.message || "Impossible de charger les quiz.");
        setQuizzes([]);
      }
    } catch (err) {
      console.error('Erreur chargement quiz:', err);
      setError("Une erreur critique est survenue.");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold">Une erreur est survenue</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={loadQuizzes} className="mt-4">
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
            <HelpCircle className="h-8 w-8" />
            Quiz
          </h1>
          <p className="text-muted-foreground">Gérez les quiz et questionnaires</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/quiz/create'}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau quiz
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    {quiz.titre}
                  </CardTitle>
                  {quiz.module_id && (
                    <Badge variant="secondary">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      Module
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {quiz.description || 'Pas de description'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {quiz.questions?.length || 0} question(s)
                  </span>
                  {quiz.date_expiration && (
                    <span className="text-xs text-muted-foreground">
                      Expire: {new Date(quiz.date_expiration).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun quiz trouvé.
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
          Précédent
        </Button>
        <span className="flex items-center px-4">Page {page} sur {totalPages}</span>
        <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
