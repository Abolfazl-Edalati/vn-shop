'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck } from 'lucide-react';
import SteamIcon from '@/components/icons/SteamIcon';

export default function FinalCta() {
  const t = useTranslations('finalCta');

  return (
    <section className="relative overflow-hidden py-20">
      {/* glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(50% 60% at 50% 40%, rgba(232,166,90,0.14) 0%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center sm:px-6">
        <h2 className="text-3xl font-black leading-tight sm:text-4xl">{t('title')}</h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">{t('subtitle')}</p>

        <button className="mt-8 inline-flex h-12 items-center gap-3 rounded-xl border border-accent/50 bg-card px-7 text-sm font-bold text-foreground transition-colors hover:border-accent hover:bg-card-hover cursor-pointer">
          <SteamIcon className="size-5 text-accent" />
          {t('login')}
        </button>

        <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-muted">
          <ShieldCheck className="size-3.5 text-accent" />
          {t('note')}
        </p>
      </div>
    </section>
  );
}
