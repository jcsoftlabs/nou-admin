import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    const backendToken = request.cookies.get('backend-token')?.value;

    if (!token || !backendToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: payload,
      token: backendToken,
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
