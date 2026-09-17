// PUT /api/account/trade-url — save the user's Steam trade URL.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionCookie, verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const TRADE_URL_RE = /^https?:\/\/steamcommunity\.com\/tradeoffer\/new\/?\?partner=\d+/;

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(sessionCookie)?.value;
  const payload = await verifySession(token);
  if (!payload) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { tradeUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const tradeUrl = (body.tradeUrl ?? '').trim();
  if (!TRADE_URL_RE.test(tradeUrl)) {
    return NextResponse.json({ error: 'invalid_trade_url' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: payload.sub },
    data: { tradeUrl },
  });

  return NextResponse.json({ tradeUrl });
}
