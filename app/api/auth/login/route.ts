import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    // Appeler l'API nou-backend pour l'authentification
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const backendResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    // Vérifier le type de contenu avant de parser
    const contentType = backendResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await backendResponse.text();
      console.error('Backend returned non-JSON response:', text.substring(0, 200));
      return NextResponse.json(
        { success: false, error: 'Erreur de communication avec le serveur backend' },
        { status: 502 }
      );
    }

    const backendData = await backendResponse.json();

    if (backendData.success && backendData.data) {
      const { membre, token: backendToken, refresh_token } = backendData.data;

      // Vérifier que l'utilisateur a le rôle admin
      // Le backend retourne soit 'role' soit 'role_utilisateur'
      const userRole = membre.role || membre.role_utilisateur;
      
      if (userRole !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Accès réservé aux administrateurs' },
          { status: 403 }
        );
      }

      const payload = {
        id: membre.id,
        email: membre.email || '',
        username: membre.username,
        code_adhesion: membre.code_adhesion,
        nom: membre.nom,
        prenom: membre.prenom,
        role: userRole,
      };

      // Générer notre propre token pour le frontend
      const token = await signToken(payload);

      const response = NextResponse.json({
        success: true,
        user: payload,
        backendToken, // Token du backend pour les requêtes API
      });

      // Définir le cookie JWT pour notre frontend
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 heures
      });

      // Stocker aussi le token backend pour les appels API
      response.cookies.set('backend-token', backendToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 heures
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: backendData.message || 'Identifiants incorrects' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
