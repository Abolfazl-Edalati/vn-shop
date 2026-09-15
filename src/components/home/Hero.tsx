'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldCheck, Lock, Zap, CreditCard, Landmark } from 'lucide-react';
import { skins, primaryPrice, secondaryPrice } from '@/data/skins';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  // Live quote cards: two highest-value items
  const byValue = [...skins].sort((a, b) => b.price_usd - a.price_usd);
  const heroItem = byValue[0];
  const secondItem = byValue[1];

  const nf = (n: number, frac = 0) =>
    new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: frac }).format(n);

  // Split title: last two words highlighted (matches "a guess." style)
  const titleWords = t('title').split(' ');
  const head = titleWords.slice(0, -2).join(' ');
  const highlight = titleWords.slice(-2).join(' ');

  return (
    <section className="relative overflow-hidden">
      {/* subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 70% 10%, rgba(232,166,90,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pt-20">
        {/* Left: copy */}
        <div className="flex flex-col items-start">
          {/* badges */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
              <Zap className="size-3.5 text-accent" />
              <b className="font-bold text-foreground">{nf(1284)}</b> {t('badgeTrades')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
              <ShieldCheck className="size-3.5 text-accent" />
              {t('badgePayout')} <b className="font-bold text-foreground">{locale === 'fa' ? '۴۱ ثانیه' : '41s'}</b>
            </span>
          </div>

          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            {head}{' '}
            <span className="text-accent">{highlight}</span>
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/sell"
              className="inline-flex h-11 items-center rounded-xl bg-accent px-6 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
            >
              {t('sellCta')}
            </Link>
            <Link
              href="/market"
              className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-6 text-sm font-bold text-foreground transition-colors hover:border-accent/40 hover:bg-card-hover"
            >
              {t('buyCta')}
            </Link>
            <Link
              href="/trade"
              className="inline-flex h-11 items-center rounded-xl px-4 text-sm font-bold text-muted transition-colors hover:text-accent"
            >
              {t('tradeCta')} →
            </Link>
          </div>

          {/* trust */}
          <div className="mt-8 flex flex-col gap-2 text-xs text-muted sm:flex-row sm:gap-6">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-accent" />
              {t('trustSteam')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5 text-accent" />
              {t('trustEscrow')}
            </span>
          </div>
        </div>

        {/* Right: live quote — two stacked floating cards */}
        <div className="relative lg:mt-4">
          <div className="absolute -inset-3 rounded-3xl bg-accent/10 blur-2xl" />

          {/* back card (smaller, offset top-start, behind) */}
          <div
            className="float-gentle relative ms-0 w-[62%] lg:absolute lg:top-[-26px] lg:start-[4%] lg:w-[58%] lg:rotate-[-3deg]"
            style={{ animationDelay: '-1.75s' }}
          >
            <QuoteCard
              item={secondItem}
              locale={locale}
              compact
              t={t}
            />
          </div>

          {/* front card (main, overlaps) */}
          <div className="float-gentle relative ms-auto w-[88%] lg:w-[80%] lg:rotate-[1.5deg]">
            <QuoteCard
              item={heroItem}
              locale={locale}
              t={t}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteCard({
  item,
  locale,
  compact = false,
  t,
}: {
  item: (typeof skins)[number];
  locale: string;
  compact?: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {t('liveQuote')}
        </span>
        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted">
          {item.wear === 'Factory New' ? 'FN' : item.wear}
        </span>
      </div>

      {/* item image */}
      <div className={`mx-auto mt-4 aspect-[16/10] w-full ${compact ? 'max-w-[180px]' : 'max-w-[320px]'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.market_hash_name}
          className="h-full w-full object-contain drop-shadow-[0_10px_30px_rgba(232,166,90,0.25)]"
        />
      </div>

      <h3 className={`mt-2 text-center font-bold ${compact ? 'text-[11px]' : 'text-sm'}`} style={{ color: item.rarity_color }}>
        {item.market_hash_name}
      </h3>

      {/* payout */}
      <div className={`mt-4 rounded-xl border border-border bg-background/60 text-center ${compact ? 'p-3' : 'p-4'}`}>
        <p className="text-[10px] uppercase tracking-widest text-muted">
          {locale === 'fa' ? 'پرداخت' : 'Payout'}
        </p>
        <p className={`mt-1 font-black text-foreground ${compact ? 'text-lg' : 'text-3xl'}`}>
          {primaryPrice(item.price_usd, locale)}
          {locale === 'fa' && <span className={`font-medium text-muted ${compact ? 'text-[10px]' : 'ms-1 text-sm'}`}>تومان</span>}
        </p>
        <p className="text-xs text-muted">{secondaryPrice(item.price_usd, locale)}</p>

        {/* payment methods */}
        {!compact && (
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted">
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
              <Zap className="size-3 text-accent" /> {t('instant')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
              <CreditCard className="size-3 text-accent" /> {t('card')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
              <Landmark className="size-3 text-accent" /> {t('bank')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
