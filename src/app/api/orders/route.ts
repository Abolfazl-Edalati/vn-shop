// GET /api/orders — the signed-in user's purchase + sell history.
// Requires a valid session cookie.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionCookie, verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(sessionCookie)?.value;
  const payload = await verifySession(token);
  if (!payload) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const [orders, sellOrders] = await Promise.all([
    prisma.order.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
      include: { lines: true },
    }),
    prisma.sellOrder.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
      include: { lines: true },
    }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.number,
      createdAt: o.createdAt.toISOString(),
      status: o.status,
      escrowStep: o.escrowStep,
      paymentMethod: o.paymentMethod,
      totalUsd: o.totalUsd.toString(),
      totalToman: o.totalToman.toString(),
      itemCount: o.lines.reduce((sum, l) => sum + l.quantity, 0),
      firstItem: o.lines[0]?.name ?? null,
    })),
    sellOrders: sellOrders.map((o) => ({
      id: o.number,
      createdAt: o.createdAt.toISOString(),
      step: o.step,
      payoutMethod: o.payoutMethod,
      payoutUsd: o.payoutUsd.toString(),
      payoutToman: o.payoutToman.toString(),
      itemCount: o.lines.length,
      firstItem: o.lines[0]?.name ?? null,
    })),
  });
}
