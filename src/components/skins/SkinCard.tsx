'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShoppingCart, TrendingDown } from 'lucide-react';
import type { MockSkin } from '@/data/skins';
import { primaryPrice, secondaryPrice } from '@/data/skins';

const wearLabels: Record<string, { fa: string; en: string }> = {
  'Factory New': { fa: 'نو', en: 'Factory New' },
  'Minimal Wear': { fa: 'کمی مصرف', en: 'Minimal Wear' },
  'Field-Tested': { fa: 'مصرف‌شده', en: 'Field-Tested' },
  'Well-Worn': { fa: 'خسته', en: 'Well-Worn' },
  'Battle-Scarred': { fa: 'فرسوده', en: 'Battle-Scarred' },
};

// Wear names are shown in English in BOTH locales (CS2 community standard)
export function wearLabel(wear: string, _locale?: string): string {
  const entry = wearLabels[wear];
  if (!entry) return wear;
  return entry.en;
}

export default function SkinCard({ skin }: { skin: MockSkin }) {
  const locale = useLocale();
  const t = useTranslations('skinCard');

  return (
    <Link
      href={`/item/${skin.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-card-hover"
    >
      {/* discount badge */}
      {skin.discount_pct > 0 && (
        <span className="absolute end-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
          <TrendingDown className="size-3" />
          {locale === 'fa'
            ? `${new Intl.NumberFormat('fa-IR').format(skin.discount_pct)}٪ ${t('underSteam')}`
            : `${skin.discount_pct}% ${t('underSteam')}`}
        </span>
      )}

      {/* image with rarity glow */}
      <div
        className="relative aspect-square overflow-hidden p-4"
        style={{
          background: `radial-gradient(65% 65% at 50% 42%, ${skin.rarity_color}1f 0%, transparent 75%), #101010`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={skin.image}
          alt={skin.market_hash_name}
          loading="lazy"
          className="h-full w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
        />
        {skin.stattrak && (
          <span className="absolute start-2 top-2 rounded bg-orange-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
            ST™
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold" style={{ color: skin.rarity_color }}>
            {skin.weapon}
          </h3>
          <span className="shrink-0 text-[10px] text-muted">{wearLabel(skin.wear, locale)}</span>
        </div>
        <p className="text-xs text-muted">{skin.pattern}</p>

        {/* float */}
        <div className="mt-auto pt-1.5">
          <div className="flex items-center justify-between text-[10px] text-muted">
            <span>float {new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 4 }).format(skin.float)}</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(skin.float * 100, 100)}%`,
                background: `hsl(${Math.max(120 - skin.float * 120, 0)} 70% 45%)`,
              }}
            />
          </div>
        </div>

        {/* price + action */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              {primaryPrice(skin.price_usd, locale)}
              {locale === 'fa' && <span className="text-[10px] font-medium text-muted"> تومان</span>}
            </p>
            <p className="text-[10px] text-muted">{secondaryPrice(skin.price_usd, locale)}</p>
          </div>
          <button
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground opacity-0 transition-all hover:bg-accent-strong group-hover:opacity-100 cursor-pointer"
            aria-label={t('addToCart')}
            onClick={(e) => e.preventDefault()}
          >
            <ShoppingCart className="size-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
