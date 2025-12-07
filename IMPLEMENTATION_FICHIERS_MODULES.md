# Guide d'implémentation : Upload de fichiers pour modules de formation

## ✅ Déjà fait
1. **Backend** : Middleware Multer, service, routes, migration SQL - TERMINÉ
2. **Types TypeScript** : `FormationModule` interface mise à jour avec nouveaux champs

## 🔧 À faire dans nou-admin

### 1. Mettre à jour `adminService.ts`

Modifier les fonctions `createModule` et `updateModule` pour supporter FormData :

```typescript
// Dans /lib/api/adminService.ts

/**
 * Créer un module pour une formation avec fichiers
 */
async createModuleWithFiles(
  formationId: number,
  data: {
    titre: string;
    description?: string;
    ordre: number;
    type_contenu?: string;
    contenu_texte?: string;
  },
  files: {
    pdf?: File;
    ppt?: File;
    video?: File;
    image?: File;
    fichiers?: File[];
  },
  token: string
): Promise<ApiResponse<FormationModule>> {
  const formData = new FormData();
  
  // Ajouter les données texte
  formData.append('titre', data.titre);
  if (data.description) formData.append('description', data.description);
  formData.append('ordre', data.ordre.toString());
  if (data.type_contenu) formData.append('type_contenu', data.type_contenu);
  if (data.contenu_texte) formData.append('contenu_texte', data.contenu_texte);
  
  // Ajouter les fichiers
  if (files.pdf) formData.append('pdf', files.pdf);
  if (files.ppt) formData.append('ppt', files.ppt);
  if (files.video) formData.append('video', files.video);
  if (files.image) formData.append('image', files.image);
  if (files.fichiers) {
    files.fichiers.forEach(f => formData.append('fichiers', f));
  }
  
  return apiClient.uploadFile<FormationModule>(
    `/admin/formations/${formationId}/modules`,
    formData,
    token,
    'POST'
  );
}

/**
 * Mettre à jour un module avec fichiers
 */
async updateModuleWithFiles(
  moduleId: number,
  data: {
    titre?: string;
    description?: string;
    ordre?: number;
    type_contenu?: string;
    contenu_texte?: string;
  },
  files: {
    pdf?: File;
    ppt?: File;
    video?: File;
    image?: File;
    fichiers?: File[];
  },
  token: string
): Promise<ApiResponse<FormationModule>> {
  const formData = new FormData();
  
  // Ajouter les données texte
  if (data.titre) formData.append('titre', data.titre);
  if (data.description) formData.append('description', data.description);
  if (data.ordre !== undefined) formData.append('ordre', data.ordre.toString());
  if (data.type_contenu) formData.append('type_contenu', data.type_contenu);
  if (data.contenu_texte) formData.append('contenu_texte', data.contenu_texte);
  
  // Ajouter les fichiers
  if (files.pdf) formData.append('pdf', files.pdf);
  if (files.ppt) formData.append('ppt', files.ppt);
  if (files.video) formData.append('video', files.video);
  if (files.image) formData.append('image', files.image);
  if (files.fichiers) {
    files.fichiers.forEach(f => formData.append('fichiers', f));
  }
  
  return apiClient.uploadFile<FormationModule>(
    `/admin/modules/${moduleId}`,
    formData,
    token,
    'PUT'
  );
}
```

### 2. Mettre à jour le formulaire dans `/app/dashboard/formations/[id]/page.tsx`

#### A. Ajouter l'état pour les fichiers :

```typescript
const [moduleFiles, setModuleFiles] = useState<{
  pdf?: File;
  ppt?: File;
  video?: File;
  image?: File;
  fichiers?: File[];
}>({});
```

#### B. Ajouter les inputs file dans le Dialog de création :

```tsx
{/* Après les champs existants, ajouter : */}

<div className="space-y-4 border-t pt-4">
  <h4 className="font-semibold">Fichiers (optionnels)</h4>
  
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
      Ou laissez vide pour utiliser une URL YouTube dans "URL Vidéo"
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
```

#### C. Modifier `handleCreateModule` :

```typescript
const handleCreateModule = async () => {
  try {
    const result = await adminService.createModuleWithFiles(
      formationId,
      moduleForm,
      moduleFiles,
      token
    );
    if (result.success) {
      setIsCreateModuleOpen(false);
      resetModuleForm();
      setModuleFiles({}); // Reset files
      loadData();
    }
  } catch (error) {
    console.error('Erreur création module:', error);
  }
};
```

#### D. Modifier `handleUpdateModule` de la même façon

### 3. Afficher les fichiers dans la liste des modules

Dans la Card d'affichage d'un module, ajouter :

```tsx
<CardContent>
  <div className="space-y-2 text-sm">
    {/* Contenu texte existant */}
    {module.contenu_texte && (
      <div className="flex items-start gap-2">
        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <p className="line-clamp-3 text-muted-foreground">
          {module.contenu_texte.substring(0, 150)}...
        </p>
      </div>
    )}
    
    {/* NOUVEAUX : Fichiers */}
    {module.fichier_pdf_url && (
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileText className="h-4 w-4" />
        <a href={module.fichier_pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
          📄 Fichier PDF
        </a>
      </div>
    )}
    
    {module.fichier_ppt_url && (
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileText className="h-4 w-4" />
        <a href={module.fichier_ppt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
          📊 Présentation PowerPoint
        </a>
      </div>
    )}
    
    {module.fichiers_supplementaires && module.fichiers_supplementaires.length > 0 && (
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileText className="h-4 w-4" />
        <div className="flex flex-wrap gap-1">
          {module.fichiers_supplementaires.map((fichier, idx) => (
            <a
              key={idx}
              href={fichier.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80"
            >
              {fichier.nom}
            </a>
          ))}
        </div>
      </div>
    )}
    
    {/* URLs existants (image, video) */}
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
  </div>
</CardContent>
```

### 4. Ajouter les imports nécessaires

En haut du fichier `page.tsx` :

```typescript
import { FileText } from 'lucide-react';
```

## 📝 Résumé

1. ✅ Types mis à jour
2. ⏳ Ajouter `createModuleWithFiles` et `updateModuleWithFiles` dans adminService
3. ⏳ Ajouter les champs file input dans le formulaire
4. ⏳ Afficher les fichiers dans la liste des modules
5. ⏳ Tester l'upload et vérifier que les fichiers apparaissent sur Cloudinary

## 🧪 Test

1. Créer un nouveau module avec un PDF
2. Vérifier que l'URL Cloudinary est retournée
3. Cliquer sur le lien PDF dans la liste des modules
4. Le PDF doit s'ouvrir depuis Cloudinary

## 📱 Pour l'app mobile (nou_app)

L'app n'a besoin que d'afficher les nouveaux champs. Les URLs Cloudinary sont déjà retournées par l'API.

Ajouter simplement des boutons/liens pour télécharger/visualiser :
- PDF : ouvrir dans un viewer PDF natif
- PPT : proposer le téléchargement
- Vidéos/Images : afficher dans un player/viewer natif
