// Signed JWT session cookie — the app's source of truth for "who is logged in".
// Issued after Steam OpenID verification, verified on every /api/auth/me request.

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const COOKIE_NAME = 'vn-session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload extends JWTPayload {
  /** database user id (cuid) */
  sub: string;
  steamId: string;
  name: string;
  avatar: string;
  role: string;
}

export const sessionCookie = COOKIE_NAME;
export const sessionMaxAge = MAX_AGE;

export async function signSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret);
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return payload as SessionPayload;
  } catch {
    // expired, tampered, or malformed — treat as logged out
    return null;
  }
}

/** SameSite/Secure flags — Secure must be off for plain http://localhost. */
export function cookieOptions(isTls: boolean) {
  return {
    httpOnly: true,
    secure: isTls,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE,
  };
}
