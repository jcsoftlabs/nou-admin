'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, HelpCircle } from 'lucide-react';
import { adminService } from '@/lib/api';
import { Formation, QuizQuestion } from '@/types/backend';

interface QuestionForm {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  points: number;
}

function CreateQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId');

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [formations, setFormations] = useState<Formation[]>([]);

  const [quizForm, setQuizForm] = useState({
    titre: '',
    description: '',
    date_publication: '',
    date_expiration: '',
    module_id: moduleId ? parseInt(moduleId) : undefined as number | undefined,
  });

  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      points: 1,
    },
  ]);

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const { token: userToken } = await response.json();
      setToken(userToken);

      const result = await adminService.getFormations(1, 100, true, userToken);
      if (result.success && result.data) {
        setFormations(result.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement formations:', error);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: string | number) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Créer le quiz
      const quizResult = await adminService.createQuiz(quizForm, token);
      
      if (quizResult.success && quizResult.data) {
        // TODO: Créer les questions via l'API
        // Pour l'instant, on redirige directement
        router.push('/dashboard/quiz');
      } else {
        alert(quizResult.message || 'Erreur lors de la création du quiz');
      }
    } catch (error) {
      console.error('Erreur création quiz:', error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getModules = () => {
    const allModules: Array<{ id: number; titre: string; formationTitre: string }> = [];
    formations.forEach((formation) => {
      if (formation.modules) {
        formation.modules.forEach((module) => {
          allModules.push({
            id: module.id,
            titre: module.titre,
            formationTitre: formation.titre,
          });
        });
      }
    });
    return allModules;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-8 w-8" />
            Créer un quiz
          </h1>
          <p className="text-muted-foreground">Créer un nouveau quiz avec des questions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={quizForm.titre}
                onChange={(e) => setQuizForm({ ...quizForm, titre: e.target.value })}
                placeholder="Titre du quiz"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                placeholder="Description du quiz..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_publication">Date de publication</Label>
                <Input
                  id="date_publication"
                  type="datetime-local"
                  value={quizForm.date_publication}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, date_publication: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="date_expiration">Date d&apos;expiration</Label>
                <Input
                  id="date_expiration"
                  type="datetime-local"
                  value={quizForm.date_expiration}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, date_expiration: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="module">Module (optionnel)</Label>
              <Select
                value={quizForm.module_id?.toString()}
                onValueChange={(value) =>
                  setQuizForm({ ...quizForm, module_id: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Aucun module</SelectItem>
                  {getModules().map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      {module.formationTitre} - {module.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Associer ce quiz à un module de formation spécifique
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Questions ({questions.length})</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Question *</Label>
                    <Textarea
                      value={question.question_text}
                      onChange={(e) =>
                        updateQuestion(index, 'question_text', e.target.value)
                      }
                      placeholder="Posez votre question..."
                      rows={2}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Option A *</Label>
                      <Input
                        value={question.option_a}
                        onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                        placeholder="Réponse A"
                        required
                      />
                    </div>
                    <div>
                      <Label>Option B *</Label>
                      <Input
                        value={question.option_b}
                        onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                        placeholder="Réponse B"
                        required
                      />
                    </div>
                    <div>
                      <Label>Option C *</Label>
                      <Input
                        value={question.option_c}
                        onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                        placeholder="Réponse C"
                        required
                      />
                    </div>
                    <div>
                      <Label>Option D *</Label>
                      <Input
                        value={question.option_d}
                        onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                        placeholder="Réponse D"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bonne réponse *</Label>
                      <Select
                        value={question.correct_answer}
                        onValueChange={(value) =>
                          updateQuestion(index, 'correct_answer', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Option A</SelectItem>
                          <SelectItem value="B">Option B</SelectItem>
                          <SelectItem value="C">Option C</SelectItem>
                          <SelectItem value="D">Option D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) =>
                          updateQuestion(index, 'points', parseInt(e.target.value))
                        }
                        min={1}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Création en cours...' : 'Créer le quiz'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateQuizPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><p className="text-muted-foreground">Chargement...</p></div>}>
      <CreateQuizContent />
    </Suspense>
  );
}
