// GET /api/auth/me — who is logged in? Called by the Header and /account page.
// Returns { user: {...} } or { user: null }.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionCookie, verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(sessionCookie)?.value;
  const payload = await verifySession(token);

  if (!payload) {
    return NextResponse.json({ user: null });
  }

  // pull the fresh record from the db — the JWT only carries identity,
  // wallet balance and trade url can change server-side
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      steamId: true,
      name: true,
      avatar: true,
      tradeUrl: true,
      email: true,
      wallet: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    // session points at a deleted user — drop the cookie
    const res = NextResponse.json({ user: null });
    res.cookies.delete(sessionCookie);
    return res;
  }

  return NextResponse.json({ user });
}

// POST /api/auth/me — logout: clear the session cookie.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(sessionCookie);
  return res;
}
