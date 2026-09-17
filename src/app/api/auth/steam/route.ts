// GET /api/auth/steam — kick off the Steam OpenID 2.0 login flow.
// Redirects the browser to Steam's login page.

import { NextResponse } from 'next/server';
import { BASE_URL, buildSteamLoginUrl } from '@/lib/steam';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.redirect(buildSteamLoginUrl(BASE_URL));
}
