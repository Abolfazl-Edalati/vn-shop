'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Sparkles, Eye } from 'lucide-react';
import { getRareSpecials, primaryPrice, secondaryPrice } from '@/data/skins';
import { wearLabel } from '@/components/skins/SkinCard';

export default function RareSpecials() {
  const t = useTranslations('rare');
  const locale = useLocale();
  const [main, ...rest] = getRareSpecials();

  return (
    <section className="border-y border-border bg-card/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t('kicker')}</p>
            <h2 className="mt-2 max-w-lg text-2xl font-black leading-tight sm:text-3xl">{t('title')}</h2>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-muted">{t('subtitle')}</p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          {/* main card */}
          <article className="group relative overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid gap-0 sm:grid-cols-2">
              {/* image */}
              <div className="relative aspect-square overflow-hidden bg-tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={main.image}
                  alt={main.market_hash_name}
                  className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-bold text-foreground backdrop-blur">
                  <Sparkles className="size-3 text-accent" /> {t('rareSpecial')}
                </span>
              </div>
              {/* info */}
              <div className="flex flex-col p-6">
                <h3 className="text-lg font-black" style={{ color: main.rarity_color }}>
                  {main.market_hash_name}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {main.case} · {main.seller} · {new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(main.seller_trades)} {locale === 'fa' ? 'ترید' : 'trades'}
                </p>

                {/* wear + float */}
                <div className="mt-4 flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <span className="size-1.5 rounded-full bg-accent" />
                    {wearLabel(main.wear, locale)}
                  </span>
                  <span className="text-muted">
                    float {new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 4 }).format(main.float)}
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(main.float * 100, 4)}%` }} />
                </div>

                <p className="mt-4 text-xs leading-relaxed text-muted">
                  {t('patternNote', { index: main.pattern_index, total: 1000 })}
                </p>

                {/* price */}
                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-2xl font-black text-foreground">
                      {primaryPrice(main.price_usd, locale)}
                      {locale === 'fa' && <span className="ms-1 text-xs font-medium text-muted">تومان</span>}
                    </p>
                    <p className="text-xs text-muted">{secondaryPrice(main.price_usd, locale)}</p>
                  </div>
                  {main.discount_pct > 0 && (
                    <p className="mt-1 text-xs font-bold text-emerald-400">
                      {new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(main.discount_pct)}٪ {locale === 'fa' ? 'ارزان‌تر از استیم' : 'under Steam'}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/item/${main.id}`}
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-accent text-xs font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
                    >
                      {t('buyNow')}
                    </Link>
                    <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-bold text-foreground transition-colors hover:border-accent/40 cursor-pointer">
                      <Eye className="size-3.5" />
                      {t('inspect')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* side cards */}
          <div className="grid gap-4">
            {rest.map((s) => (
              <Link
                key={s.id}
                href={`/item/${s.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-accent/40 hover:bg-card-hover"
              >
                <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-tile">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.market_hash_name} className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold" style={{ color: s.rarity_color }}>
                    {s.market_hash_name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-muted">{s.case}</p>
                  <p className="mt-1 text-xs text-muted">
                    {wearLabel(s.wear, locale)} · float {new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 4 }).format(s.float)}
                  </p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <p className="text-sm font-bold">
                      {primaryPrice(s.price_usd, locale)}
                      {locale === 'fa' && <span className="text-[10px] font-medium text-muted"> تومان</span>}
                    </p>
                    <p className="text-[10px] text-muted">{secondaryPrice(s.price_usd, locale)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
