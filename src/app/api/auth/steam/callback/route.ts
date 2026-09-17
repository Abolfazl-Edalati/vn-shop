// GET /api/auth/steam/callback — Steam sends the user back here after login.
// We verify the assertion, upsert the user, and set the session cookie.

import { NextResponse } from 'next/server';
import { BASE_URL, cancelUrl, extractSteamId, verifySteamAssertion } from '@/lib/steam';
import { prisma } from '@/lib/prisma';
import { cookieOptions, sessionCookie, signSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());

  // user clicked "Cancel" on the Steam login page
  if (query['openid.mode'] === 'cancel') {
    return NextResponse.redirect(cancelUrl(BASE_URL));
  }

  // 1) signature check — replay the params to Steam
  const valid = await verifySteamAssertion(query);
  if (!valid) {
    return NextResponse.redirect(`${BASE_URL}/account?login=failed`);
  }

  // 2) pull the 64-bit steamid out of the signed claimed_id
  const steamId = extractSteamId(query);
  if (!steamId) {
    return NextResponse.redirect(`${BASE_URL}/account?login=failed`);
  }

  // 3) upsert: create on first sign-in, refresh name/avatar afterwards
  const profile = await fetchSteamSummary(steamId);
  const user = await prisma.user.upsert({
    where: { steamId },
    update: { name: profile.name, avatar: profile.avatar },
    create: { steamId, name: profile.name, avatar: profile.avatar },
  });

  // 4) issue the session cookie
  const token = await signSession({
    sub: user.id,
    steamId: user.steamId,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
  });

  const isTls = BASE_URL.startsWith('https://');
  const res = NextResponse.redirect(`${BASE_URL}/account?login=success`);
  res.cookies.set(sessionCookie, token, cookieOptions(isTls));
  return res;
}

interface SteamSummary {
  name: string;
  avatar: string;
}

/** Fetch display name + avatar via the Steam Web API GetPlayerSummaries. */
async function fetchSteamSummary(steamId: string): Promise<SteamSummary> {
  const key = process.env.STEAM_API_KEY;
  if (!key) return { name: `Player ${steamId.slice(-6)}`, avatar: '' };

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId}`,
      { next: { revalidate: 0 } },
    );
    if (!res.ok) throw new Error(`steam api ${res.status}`);

    const json: any = await res.json();
    const p = json?.response?.players?.[0];
    if (!p) throw new Error('no player in response');

    return {
      name: p.personaname ?? `Player ${steamId.slice(-6)}`,
      avatar: p.avatarfull ?? p.avatarmedium ?? p.avatar ?? '',
    };
  } catch {
    // never block login on a profile fetch failure
    return { name: `Player ${steamId.slice(-6)}`, avatar: '' };
  }
}
