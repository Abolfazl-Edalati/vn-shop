'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, ShieldCheck, Lock, BadgeCheck, Send, Banknote } from 'lucide-react';
import SteamIcon from '@/components/icons/SteamIcon';
import { formatToman, formatUsd, type MockSkin } from '@/data/skins';
import { wearLabel } from '@/components/skins/SkinCard';

export default function ItemDetail({ skin }: { skin: MockSkin }) {
  const t = useTranslations('skinCard');
  const tc = useTranslations('custody');
  const locale = useLocale();
  const L = (fa: string, en: string) => (locale === 'fa' ? fa : en);
  const nf = (n: number, frac = 0) =>
    new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: frac }).format(n);

  // mock 30-day price history (deterministic from float/price)
  const history = useMemo(() => {
    const base = skin.price_usd;
    return Array.from({ length: 30 }, (_, i) => {
      const wave = Math.sin(i / 4 + skin.float * 10) * 0.04;
      const drift = ((i - 15) / 30) * 0.08;
      return Math.max(base * (1 - drift - wave * base ** 0), base * (1 - wave + drift * 0.4));
    });
  }, [skin]);

  const min = Math.min(...history);
  const max = Math.max(...history);
  const points = history
    .map((v, i) => `${(i / 29) * 100},${28 - ((v - min) / (max - min || 1)) * 26}`)
    .join(' ');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted" aria-label="breadcrumb">
        <span>VN Shop</span>
        <span>/</span>
        <span>{L('بازار', 'Market')}</span>
        <span>/</span>
        <span className="truncate text-foreground/80">{skin.market_hash_name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* LEFT: image + info */}
        <div>
          {/* image card */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
            {skin.stattrak && (
              <span className="absolute start-4 top-4 rounded bg-orange-600/90 px-2 py-0.5 text-[10px] font-bold text-white">ST™</span>
            )}
            <div className="mx-auto aspect-[16/9] max-w-[440px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={skin.image} alt={skin.market_hash_name} className="h-full w-full object-contain drop-shadow-[0_15px_40px_rgba(232,166,90,0.2)]" />
            </div>
          </div>

          {/* float bar */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-bold text-muted">{L('فلوت (float)', 'Float (wear value)')}</p>
              <p className="text-sm font-black">{nf(skin.float, 4)}</p>
            </div>
            {/* CS2 wear gradient bar */}
            <div className="relative mt-3 h-2.5 overflow-hidden rounded-full">
              <div className="absolute inset-0 flex">
                <div className="h-full bg-[#5ecb71]" style={{ width: '7%' }} title="FN" />
                <div className="h-full bg-[#b9d54d]" style={{ width: '8%' }} title="MW" />
                <div className="h-full bg-[#eac04b]" style={{ width: '23%' }} title="FT" />
                <div className="h-full bg-[#e39a3d]" style={{ width: '7%' }} title="WW" />
                <div className="h-full bg-[#d84b3f]" style={{ width: '55%' }} title="BS" />
              </div>
              {/* marker */}
              <div
                className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow"
                style={{ insetInlineStart: `${skin.float * 100}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted">
              <span>{wearLabel('Factory New', locale)}</span>
              <span>{wearLabel('Field-Tested', locale)}</span>
              <span>{wearLabel('Battle-Scarred', locale)}</span>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              {wearLabel(skin.wear, locale)}
              {skin.min_float != null && skin.max_float != null && (
                <> · {L('محدوده', 'range')} {nf(skin.min_float, 2)}–{nf(skin.max_float, 2)}</>
              )}
            </p>
          </div>

          {/* price history */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-bold text-muted">{L('تاریخچه قیمت ۳۰ روزه', '30-day price history')}</p>
              <p className="text-[11px] font-bold text-emerald-400">
                {skin.discount_pct > 0 ? `-${nf(skin.discount_pct)}% ${L('نسبت به استیم', 'vs Steam')}` : L('مطابق استیم', 'at Steam price')}
              </p>
            </div>
            <svg viewBox="0 0 100 30" className="mt-3 h-24 w-full" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8a65a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#e8a65a" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,30 ${points} 100,30`} fill="url(#area)" />
              <polyline points={points} fill="none" stroke="#e8a65a" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="flex justify-between text-[10px] text-muted">
              <span>{L('۳۰ روز پیش', '30 days ago')}</span>
              <span>{L('امروز', 'today')}</span>
            </div>
          </div>

          {/* specs */}
          <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
            <Spec label={L('دسته', 'Category')} value={skin.category} />
            <Spec label={L('کیفیت', 'Rarity')} value={skin.rarity_name ?? '—'} color={skin.rarity_color} />
            <Spec label={L('کیس', 'Case')} value={skin.case} />
            <Spec label={L('ایندکس پترن', 'Pattern index')} value={nf(skin.pattern_index)} />
            <Spec label={L('پینت ایندکس', 'Paint index')} value={skin.paint_index != null ? String(skin.paint_index) : '—'} />
            <Spec label={L('فروشنده', 'Seller')} value={`${skin.seller} · ${nf(skin.seller_trades)} ${L('ترید', 'trades')}`} />
          </div>
        </div>

        {/* RIGHT: buy card */}
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h1 className="text-lg font-black leading-snug" style={{ color: skin.rarity_color }}>
              {skin.market_hash_name}
            </h1>
            <p className="mt-1 text-xs text-muted">
              {wearLabel(skin.wear, locale)} · float {nf(skin.float, 4)}
            </p>

            <div className="mt-4 rounded-xl border border-border bg-background/60 p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted">{L('قیمت', 'Price')}</p>
              <p className="mt-1 text-3xl font-black">
                {formatToman(skin.price_usd, locale)}
                <span className="ms-1 text-sm font-medium text-muted">تومان</span>
              </p>
              <p className="text-xs text-muted">{formatUsd(skin.price_usd, locale)}</p>
              {skin.discount_pct > 0 && (
                <p className="mt-1 text-[11px] text-muted">
                  <span className="line-through">{formatUsd(skin.steam_price_usd, locale)}</span>{' '}
                  <span className="font-bold text-emerald-400">-{nf(skin.discount_pct)}%</span>
                </p>
              )}
            </div>

            <button className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-black text-accent-foreground transition-colors hover:bg-accent-strong cursor-pointer">
              <SteamIcon className="size-4" />
              {L('همین حالا بخر', 'Buy now')}
            </button>
            <button className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground transition-colors hover:border-accent/40 cursor-pointer">
              <Eye className="size-3.5" />
              {L('ببین در بازی', 'Inspect in game')}
            </button>

            {/* custody mini */}
            <ol className="mt-5 space-y-2 border-t border-border pt-4 text-[10px] text-muted">
              {[
                { icon: Lock, label: tc('steps.one.title') },
                { icon: BadgeCheck, label: tc('steps.two.title') },
                { icon: Send, label: tc('steps.three.title') },
                { icon: Banknote, label: tc('steps.four.title') },
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <s.icon className="size-3 text-accent" />
                  {s.label}
                </li>
              ))}
            </ol>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-muted">
              <ShieldCheck className="size-3 text-accent" />
              {L('پرداخت اسکرو — پس از تأیید تحویل آزاد می‌شود', 'Escrowed — released after delivery is confirmed')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Spec({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
      <span className="text-[11px] text-muted">{label}</span>
      <span className="text-xs font-bold" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}
