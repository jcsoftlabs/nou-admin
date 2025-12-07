'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  ArrowLeft,
  BookOpen,
  List,
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';
import { adminService } from '@/lib/api';
import { Formation, FormationModule, Quiz } from '@/types/backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const formationId = parseInt(params.id as string);

  const [formation, setFormation] = useState<Formation | null>(null);
  const [modules, setModules] = useState<FormationModule[]>([]);
  const [availableQuiz, setAvailableQuiz] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>('');

  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<FormationModule | null>(null);
  const [isAttachQuizOpen, setIsAttachQuizOpen] = useState(false);
  const [selectedModuleForQuiz, setSelectedModuleForQuiz] = useState<FormationModule | null>(null);

  const [moduleForm, setModuleForm] = useState({
    titre: '',
    description: '',
    type_contenu: 'texte',
    contenu_texte: '',
    image_url: '',
    video_url: '',
    ordre: 0,
  });

  const [moduleFiles, setModuleFiles] = useState<{
    pdf?: File;
    ppt?: File;
    video?: File;
    image?: File;
    fichiers?: File[];
  }>({});

  const [quizForm, setQuizForm] = useState({
    quizId: 0,
  });

  useEffect(() => {
    loadData();
  }, [formationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      const { token: userToken } = await response.json();
      setToken(userToken);

      // Charger les formations avec modules
      const formationsResult = await adminService.getFormations(1, 100, undefined, userToken);
      if (formationsResult.success && formationsResult.data) {
        const currentFormation = formationsResult.data.data.find(
          (f: Formation) => f.id === formationId
        );
        if (currentFormation) {
          setFormation(currentFormation);
          setModules(currentFormation.modules || []);
        }
      }

      // Charger les quiz disponibles
      const quizResult = await adminService.getQuiz(1, 100, undefined, userToken);
      if (quizResult.success && quizResult.data) {
        setAvailableQuiz(quizResult.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async () => {
    try {
      // Utiliser createModuleWithFiles si des fichiers sont présents
      const hasFiles = moduleFiles.pdf || moduleFiles.ppt || moduleFiles.video || 
                       moduleFiles.image || (moduleFiles.fichiers && moduleFiles.fichiers.length > 0);
      
      const result = hasFiles
        ? await adminService.createModuleWithFiles(formationId, moduleForm, moduleFiles, token)
        : await adminService.createModule(formationId, moduleForm, token);
      
      if (result.success) {
        setIsCreateModuleOpen(false);
        resetModuleForm();
        setModuleFiles({});
        loadData();
      }
    } catch (error) {
      console.error('Erreur création module:', error);
    }
  };

  const handleUpdateModule = async () => {
    if (!selectedModule) return;
    try {
      // Utiliser updateModuleWithFiles si des fichiers sont présents
      const hasFiles = moduleFiles.pdf || moduleFiles.ppt || moduleFiles.video || 
                       moduleFiles.image || (moduleFiles.fichiers && moduleFiles.fichiers.length > 0);
      
      const result = hasFiles
        ? await adminService.updateModuleWithFiles(selectedModule.id, moduleForm, moduleFiles, token)
        : await adminService.updateModule(selectedModule.id, moduleForm, token);
      
      if (result.success) {
        setSelectedModule(null);
        resetModuleForm();
        setModuleFiles({});
        loadData();
      }
    } catch (error) {
      console.error('Erreur mise à jour module:', error);
    }
  };

  const handleAttachQuiz = async () => {
    if (!selectedModuleForQuiz || !quizForm.quizId) return;
    try {
      const result = await adminService.attachQuizToModule(
        quizForm.quizId,
        selectedModuleForQuiz.id,
        token
      );
      if (result.success) {
        setIsAttachQuizOpen(false);
        setSelectedModuleForQuiz(null);
        setQuizForm({ quizId: 0 });
        loadData();
      }
    } catch (error) {
      console.error('Erreur association quiz:', error);
    }
  };

  const resetModuleForm = () => {
    setModuleForm({
      titre: '',
      description: '',
      type_contenu: 'texte',
      contenu_texte: '',
      image_url: '',
      video_url: '',
      ordre: 0,
    });
  };

  const openEditModule = (module: FormationModule) => {
    setSelectedModule(module);
    setModuleForm({
      titre: module.titre,
      description: module.description || '',
      type_contenu: module.type_contenu || 'texte',
      contenu_texte: module.contenu_texte || '',
      image_url: module.image_url || '',
      video_url: module.video_url || '',
      ordre: module.ordre,
    });
  };

  const openAttachQuiz = (module: FormationModule) => {
    setSelectedModuleForQuiz(module);
    setIsAttachQuizOpen(true);
  };

  const getTypeContentIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'mixte':
        return <List className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <p className="text-muted-foreground">Formation non trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              {formation.titre}
            </h1>
            <p className="text-muted-foreground">{formation.description}</p>
          </div>
        </div>
        <Dialog open={isCreateModuleOpen} onOpenChange={setIsCreateModuleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un module</DialogTitle>
              <DialogDescription>
                Ajouter un nouveau chapitre/module à cette formation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titre">Titre *</Label>
                  <Input
                    id="titre"
                    value={moduleForm.titre}
                    onChange={(e) => setModuleForm({ ...moduleForm, titre: e.target.value })}
                    placeholder="Introduction à la constitution"
                  />
                </div>
                <div>
                  <Label htmlFor="ordre">Ordre</Label>
                  <Input
                    id="ordre"
                    type="number"
                    value={moduleForm.ordre}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, ordre: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type_contenu">Type de contenu</Label>
                <Select
                  value={moduleForm.type_contenu}
                  onValueChange={(value) => setModuleForm({ ...moduleForm, type_contenu: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="texte">Texte</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={2}
                  placeholder="Courte description du module..."
                />
              </div>

              <div>
                <Label htmlFor="contenu_texte">Contenu texte (Markdown/HTML)</Label>
                <Textarea
                  id="contenu_texte"
                  value={moduleForm.contenu_texte}
                  onChange={(e) => setModuleForm({ ...moduleForm, contenu_texte: e.target.value })}
                  rows={8}
                  placeholder="Le corps du cours... Vous pouvez utiliser du Markdown ou HTML."
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image_url">URL Image</Label>
                  <Input
                    id="image_url"
                    value={moduleForm.image_url}
                    onChange={(e) => setModuleForm({ ...moduleForm, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="video_url">URL Vidéo</Label>
                  <Input
                    id="video_url"
                    value={moduleForm.video_url}
                    onChange={(e) => setModuleForm({ ...moduleForm, video_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              {/* Fichiers (optionnels) */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-sm">Fichiers (optionnels)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pdf_file">Fichier PDF</Label>
                    <Input
                      id="pdf_file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setModuleFiles({ ...moduleFiles, pdf: file });
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ppt_file">Présentation PowerPoint</Label>
                    <Input
                      id="ppt_file"
                      type="file"
                      accept=".ppt,.pptx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setModuleFiles({ ...moduleFiles, ppt: file });
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="video_file">Fichier vidéo</Label>
                  <Input
                    id="video_file"
                    type="file"
                    accept=".mp4,.mov,.avi"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setModuleFiles({ ...moduleFiles, video: file });
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ou utilisez le champ "URL Vidéo" pour une vidéo YouTube
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="image_file">Image du module</Label>
                  <Input
                    id="image_file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setModuleFiles({ ...moduleFiles, image: file });
                    }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="extra_files">Fichiers supplémentaires (max 10)</Label>
                  <Input
                    id="extra_files"
                    type="file"
                    multiple
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setModuleFiles({ ...moduleFiles, fichiers: files });
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Documents, images ou présentations additionnels
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateModuleOpen(false);
                    resetModuleForm();
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreateModule}>Créer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Modules ({modules.length})</h2>
        {modules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun module créé. Commencez par ajouter un module.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {modules
              .sort((a, b) => a.ordre - b.ordre)
              .map((module) => (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{module.ordre}
                          </Badge>
                          {getTypeContentIcon(module.type_contenu)}
                          {module.titre}
                        </CardTitle>
                        {module.type_contenu && (
                          <Badge variant="secondary" className="text-xs">
                            {module.type_contenu}
                          </Badge>
                        )}
                        {module.description && (
                          <CardDescription className="line-clamp-2">
                            {module.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModule(module)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAttachQuiz(module)}
                          title="Associer un quiz"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {module.contenu_texte && (
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <p className="line-clamp-3 text-muted-foreground">
                            {module.contenu_texte.substring(0, 150)}...
                          </p>
                        </div>
                      )}
                      
                      {/* Fichiers PDF */}
                      {module.fichier_pdf_url && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <a href={module.fichier_pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                            📄 Fichier PDF
                          </a>
                        </div>
                      )}
                      
                      {/* Fichiers PowerPoint */}
                      {module.fichier_ppt_url && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <a href={module.fichier_ppt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                            📊 Présentation PowerPoint
                          </a>
                        </div>
                      )}
                      
                      {/* Fichiers supplémentaires */}
                      {module.fichiers_supplementaires && module.fichiers_supplementaires.length > 0 && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4 mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {module.fichiers_supplementaires.map((fichier, idx) => (
                              <a
                                key={idx}
                                href={fichier.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80"
                                title={fichier.nom}
                              >
                                {fichier.nom.length > 20 ? fichier.nom.substring(0, 20) + '...' : fichier.nom}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {module.image_url && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                          <span className="truncate">{module.image_url}</span>
                        </div>
                      )}
                      {module.video_url && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Video className="h-4 w-4" />
                          <span className="truncate">{module.video_url}</span>
                        </div>
                      )}
                      {module.quiz && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default" className="text-xs">
                            Quiz: {module.quiz.titre}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Edit Module Dialog */}
      {selectedModule && (
        <Dialog
          open={!!selectedModule}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedModule(null);
              resetModuleForm();
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-titre">Titre *</Label>
                  <Input
                    id="edit-titre"
                    value={moduleForm.titre}
                    onChange={(e) => setModuleForm({ ...moduleForm, titre: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ordre">Ordre</Label>
                  <Input
                    id="edit-ordre"
                    type="number"
                    value={moduleForm.ordre}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, ordre: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-type_contenu">Type de contenu</Label>
                <Select
                  value={moduleForm.type_contenu}
                  onValueChange={(value) => setModuleForm({ ...moduleForm, type_contenu: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="texte">Texte</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="edit-contenu_texte">Contenu texte</Label>
                <Textarea
                  id="edit-contenu_texte"
                  value={moduleForm.contenu_texte}
                  onChange={(e) => setModuleForm({ ...moduleForm, contenu_texte: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-image_url">URL Image</Label>
                  <Input
                    id="edit-image_url"
                    value={moduleForm.image_url}
                    onChange={(e) => setModuleForm({ ...moduleForm, image_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-video_url">URL Vidéo</Label>
                  <Input
                    id="edit-video_url"
                    value={moduleForm.video_url}
                    onChange={(e) => setModuleForm({ ...moduleForm, video_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedModule(null);
                    resetModuleForm();
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleUpdateModule}>Mettre à jour</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Attach Quiz Dialog */}
      {isAttachQuizOpen && selectedModuleForQuiz && (
        <Dialog open={isAttachQuizOpen} onOpenChange={setIsAttachQuizOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Associer un quiz au module</DialogTitle>
              <DialogDescription>Module: {selectedModuleForQuiz.titre}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="quiz-select">Sélectionner un quiz existant</Label>
                <Select
                  value={quizForm.quizId.toString()}
                  onValueChange={(value) => setQuizForm({ quizId: parseInt(value) })}
                >
                  <SelectTrigger id="quiz-select">
                    <SelectValue placeholder="Choisir un quiz..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableQuiz.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id.toString()}>
                        {quiz.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                ou
              </div>

              <div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    router.push(`/dashboard/quiz/create?moduleId=${selectedModuleForQuiz.id}`);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un nouveau quiz pour ce module
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAttachQuizOpen(false);
                    setSelectedModuleForQuiz(null);
                    setQuizForm({ quizId: 0 });
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleAttachQuiz} disabled={!quizForm.quizId}>
                  Associer le quiz sélectionné
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
