'use client';

import { useTranslations } from 'next-intl';
import { Construction } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

export default function ComingSoonPage() {
  const t = useTranslations('nav');
  const home = useTranslations('app');

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-32 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
          <Construction className="size-8 text-accent" />
        </span>
        <h1 className="text-2xl font-black">{t('soon')} — {home('title')}</h1>
        <p className="max-w-sm text-sm text-muted">
          {/* simple, self-contained copy */}
          {t('soon')}
        </p>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-xl bg-accent px-6 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
        >
          ← {t('buy')}
        </Link>
      </main>
      <Footer />
    </>
  );
}
