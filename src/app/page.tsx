import { redirect } from 'next/navigation';

// The root layout is now src/app/[locale]/layout.tsx; this file only
// ensures stray hits at / are handled by the middleware redirect.
export default function RootPage() {
  redirect('/fa');
}
