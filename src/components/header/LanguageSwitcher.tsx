'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale() {
    const next = locale === 'fa' ? 'en' : 'fa';
    router.replace(pathname, { locale: next });
  }

  return (
    <button
      onClick={switchLocale}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted hover:bg-card-hover hover:text-foreground transition-colors cursor-pointer"
      aria-label="Switch language"
    >
      <Globe className="size-3.5" />
      {locale === 'fa' ? 'EN' : 'فا'}
    </button>
  );
}
