'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Search, Zap, Download } from 'lucide-react';
import { getDemoInventory, formatToman, formatUsd, USD_TO_TOMAN } from '@/data/skins';
import { wearLabel } from '@/components/skins/SkinCard';

const PAYOUT_RATE = 0.925; // mock: after ~7.5% total haircut

export default function SellPanel() {
  const t = useTranslations('sell');
  const locale = useLocale();
  const items = getDemoInventory();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(items.slice(0, 2).map((i) => i.id))
  );

  const nf = (n: number, frac = 0) =>
    new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: frac }).format(n);

  const inventoryValue = items.reduce((sum, i) => sum + i.price_usd, 0);
  const selectedValue = items
    .filter((i) => selected.has(i.id))
    .reduce((sum, i) => sum + i.price_usd, 0);
  const payout = selectedValue * PAYOUT_RATE;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" id="sell-demo">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t('kicker')}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{t('title')}</h2>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* item list */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* search/select row */}
          <div className="flex items-center gap-3 border-b border-border p-3.5">
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 start-3 my-auto size-4 text-muted" />
              <input
                type="search"
                placeholder={t('filterPlaceholder')}
                className="h-9 w-full rounded-lg border border-border bg-background ps-10 pe-3 text-xs text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setSelected(selected.size === items.length ? new Set() : new Set(items.map((i) => i.id)))}
              className="h-9 shrink-0 rounded-lg border border-border bg-background px-3.5 text-xs font-bold text-foreground transition-colors hover:border-accent/40 cursor-pointer"
            >
              {t('selectAll')}
            </button>
          </div>

          {/* rows */}
          <ul className="divide-y divide-border">
            {items.map((s) => {
              const isSel = selected.has(s.id);
              return (
                <li key={s.id}>
                  <button
                    onClick={() => toggle(s.id)}
                    className={`flex w-full items-center gap-3 p-3.5 text-start transition-colors cursor-pointer ${
                      isSel ? 'bg-accent/5' : 'hover:bg-card-hover'
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isSel ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-background'
                      }`}
                    >
                      {isSel && <Check className="size-3.5" />}
                    </span>
                    <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-[#101010]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.image} alt={s.market_hash_name} className="h-full w-full object-contain p-1" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        {s.stattrak && (
                          <span className="rounded bg-orange-600/90 px-1 text-[9px] font-bold text-white">ST™</span>
                        )}
                        <span className="truncate text-xs font-bold" style={{ color: s.rarity_color }}>
                          {s.market_hash_name}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[10px] text-muted">
                        {wearLabel(s.wear, locale)} · float {nf(s.float, 4)}
                      </span>
                    </span>
                    <span className="shrink-0 text-end">
                      <span className="block text-xs font-bold">{formatToman(s.price_usd, locale)}</span>
                      {s.discount_pct > 0 && (
                        <span className="mt-0.5 block text-[10px] text-muted line-through">
                          {formatToman(s.steam_price_usd, locale)}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* summary card */}
        <aside className="flex flex-col gap-4 self-start rounded-2xl border border-border bg-card p-5">
          <div className="space-y-2.5 text-xs">
            <p className="flex justify-between text-muted">
              {t('inventoryValue')}
              <b className="text-foreground">{formatToman(inventoryValue, locale)} <span className="font-medium text-muted">تومان</span></b>
            </p>
            <p className="flex justify-between text-muted">
              {t('selected')} ({nf(selected.size)}):
              <b className="text-foreground">{formatToman(selectedValue, locale)} <span className="font-medium text-muted">تومان</span></b>
            </p>
            <p className="flex items-baseline justify-between border-t border-border pt-2.5 text-muted">
              {t('estimatedPayout')}
              <b className="text-base font-black text-accent">
                {formatToman(payout, locale)} <span className="text-xs font-medium">تومان</span>
              </b>
            </p>
            <p className="text-[10px] text-muted">{formatUsd(payout, locale)}</p>
          </div>

          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed" disabled={selected.size === 0}>
            <Zap className="size-4" />
            {t('quickSell', { count: nf(selected.size) })}
          </button>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-bold text-foreground transition-colors hover:border-accent/40 cursor-pointer">
            <Download className="size-4" />
            {t('loadMyItems')}
          </button>

          <p className="text-[10px] leading-relaxed text-muted">{t('demoNote')}</p>
        </aside>
      </div>
    </section>
  );
}
