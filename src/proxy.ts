import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import type {NextRequest} from 'next/server';
import type {NextResponse} from 'next/server';

const handle = createMiddleware(routing);

// Next.js 16: `middleware.ts` is deprecated in favor of `proxy.ts`.
// next-intl's middleware factory takes a NextRequest and returns a NextResponse,
// which matches the proxy signature directly.
export default function proxy(request: NextRequest): NextResponse {
  return handle(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
