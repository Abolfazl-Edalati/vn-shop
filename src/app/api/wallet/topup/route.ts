// POST /api/wallet/topup — demo: add 1,000,000 Toman to the signed-in user's wallet.
// Real payment integration comes later.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionCookie, verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const TOPUP_TOMAN = 1_000_000;

export async function POST(request: NextRequest) {
  const token = request.cookies.get(sessionCookie)?.value;
  const payload = await verifySession(token);
  if (!payload) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const updated = await prisma.user.update({
    where: { id: payload.sub },
    data: { wallet: { increment: TOPUP_TOMAN } },
    select: { wallet: true },
  });

  return NextResponse.json({ wallet: updated.wallet.toString() });
}
