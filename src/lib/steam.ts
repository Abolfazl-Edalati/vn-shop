// Steam OpenID 2.0 helpers — Steam does NOT support OAuth2 / modern OIDC.
// We implement the OpenID 2.0 "directed identity" flow manually:
//   1. redirect user to Steam's OpenID endpoint with a return_to URL
//   2. Steam redirects back with signed params in the query string
//   3. we verify the signature by replaying the params to Steam
//
// Docs: https://steamcommunity.com/dev
// Spec:  https://openid.net/specs/openid-authentication-2_0.html

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

/** Canonical URL we tell Steam to send the user back to (must be exact on verify). */
export function returnUrl(baseUrl: string): string {
  return `${baseUrl}/api/auth/steam/callback`;
}

/** Where the user goes when they cancel the Steam login. */
export function cancelUrl(baseUrl: string): string {
  return `${baseUrl}/account?login=cancelled`;
}

/**
 * Build the Steam OpenID login URL.
 * Steam uses "directed identity": the claimed id is always its own endpoint
 * with the 64-bit SteamID appended, so we don't ask the user for anything.
 */
export function buildSteamLoginUrl(baseUrl: string): string {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnUrl(baseUrl),
    'openid.realm': baseUrl,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return `${STEAM_OPENID_URL}?${params.toString()}`;
}

const STEAMID_RE = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

/**
 * Extract the 64-bit SteamID from the callback params.
 * Returns null if the shape is wrong (before any network verification).
 */
export function extractSteamId(query: URLSearchParams | Record<string, string>): string | null {
  const claimed =
    query instanceof URLSearchParams ? query.get('openid.claimed_id') : query['openid.claimed_id'];
  if (typeof claimed !== 'string') return null;
  const m = claimed.match(STEAMID_RE);
  return m ? m[1] : null;
}

/**
 * Verify the Steam OpenID assertion by replaying the exact params back to Steam
 * with mode=check_authentication. Steam replies "true"/"false" in the body.
 * This is the security-critical step — never skip it.
 */
export async function verifySteamAssertion(
  query: Record<string, string>,
): Promise<boolean> {
  // build the verification payload: same params, mode flipped to check_authentication
  const params = new URLSearchParams({ ...query, 'openid.mode': 'check_authentication' });

  const res = await fetch(STEAM_OPENID_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) return false;

  const body = await res.text();
  // Steam returns "is_valid:true" on success
  return /^is_valid\s*:\s*true/i.test(body);
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export { BASE_URL };
