import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

export interface AdminPayload {
  id: number;
  email: string;
  role: string;
}

export async function signToken(payload: AdminPayload): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
