'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Zap, Sticker, Tag, RotateCcw } from 'lucide-react';
import { USD_TO_TOMAN, type MockSkin } from '@/data/skins';

export type CatFilter =
  | 'all'
  | 'Rifles'
  | 'Pistols'
  | 'SMGs'
  | 'Shotguns'
  | 'Machineguns'
  | 'Snipers'
  | 'Knives'
  | 'Gloves'
  | 'Accessory';

export type WearFilter = 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';

export interface MarketFilterState {
  cat: CatFilter;
  fastTrade: boolean;
  stattrak: boolean;
  sticker: boolean;
  nametag: boolean;
  wears: WearFilter[];
  minToman: number;
  maxToman: number;
}

export const ALL_WEAR: WearFilter[] = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];

// dot color per wear (best -> worst)
const WEAR_DOT: Record<WearFilter, string> = {
  'Factory New': '#4b9eff',
  'Minimal Wear': '#4ade80',
  'Field-Tested': '#eac04b',
  'Well-Worn': '#e39a3d',
  'Battle-Scarred': '#ef4444',
};

export const PRICE_CEILING_TOMAN = 200_000_000;

export function defaultFilters(): MarketFilterState {
  return {
    cat: 'all',
    fastTrade: false,
    stattrak: false,
    sticker: false,
    nametag: false,
    wears: [...ALL_WEAR],
    minToman: 0,
    maxToman: PRICE_CEILING_TOMAN,
  };
}

export function applyFilters(list: MockSkin[], f: MarketFilterState): MockSkin[] {
  return list.filter((s) => {
    if (f.cat !== 'all' && s.category !== f.cat) return false;
    if (f.fastTrade && !s.fast_trade) return false;
    if (f.stattrak && !s.stattrak) return false;
    if (f.sticker && !s.has_sticker) return false;
    if (f.nametag && !s.has_nametag) return false;
    if (!f.wears.includes(s.wear as WearFilter)) return false;
    const toman = s.price_usd * USD_TO_TOMAN;
    if (toman < f.minToman || toman > f.maxToman) return false;
    return true;
  });
}

export function isDefault(f: MarketFilterState): boolean {
  const d = defaultFilters();
  return (
    f.cat === d.cat &&
    !f.fastTrade && !f.stattrak && !f.sticker && !f.nametag &&
    f.wears.length === d.wears.length &&
    f.minToman === d.minToman &&
    f.maxToman === d.maxToman
  );
}

const CATS: { key: CatFilter; fa: string; en: string; icon: string }[] = [
  { key: 'all', fa: 'همه', en: 'All', icon: '⚡' },
  { key: 'Accessory', fa: 'اکسسوری', en: 'Accessory', icon: '◆' },
  { key: 'Knives', fa: 'چاقو', en: 'Knife', icon: '🗡' },
  { key: 'Pistols', fa: 'پیستول', en: 'Pistol', icon: '🔫' },
  { key: 'Machineguns', fa: 'موشین‌گان', en: 'Machinegun', icon: '⛓' },
  { key: 'Shotguns', fa: 'شاتگان', en: 'Shotgun', icon: '✦' },
  { key: 'SMGs', fa: 'SMG', en: 'SMG', icon: '≡' },
  { key: 'Rifles', fa: 'رایفل', en: 'Rifle', icon: '⌖' },
  { key: 'Snipers', fa: 'اسنایپر', en: 'Sniper', icon: '◎' },
  { key: 'Gloves', fa: 'دستکش', en: 'Gloves', icon: '✋' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-5 first:pt-0 last:border-b-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
        on ? 'bg-accent' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
          on ? 'start-[calc(100%-22px)]' : 'start-0.5'
        }`}
      />
    </button>
  );
}

export default function MarketFilters({
  value,
  onChange,
  counts,
}: {
  value: MarketFilterState;
  onChange: (next: MarketFilterState) => void;
  counts: Record<CatFilter, number>;
}) {
  const locale = useLocale();
  const t = useTranslations('marketFilters');
  const L = (fa: string, en: string) => (locale === 'fa' ? fa : en);
  const set = <K extends keyof MarketFilterState>(k: K, v: MarketFilterState[K]) =>
    onChange({ ...value, [k]: v });

  const nf = (n: number) => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(n);
  const tomanLabel = L('تومان', 'Toman');

  // slider helpers: snap to 1M steps
  const STEP = 1_000_000;
  const pct = (v: number) => (v / PRICE_CEILING_TOMAN) * 100;

  function toggleWear(w: WearFilter) {
    const has = value.wears.includes(w);
    const next = has ? value.wears.filter((x) => x !== w) : [...value.wears, w];
    if (next.length === 0) return; // keep at least one
    set('wears', next);
  }

  return (
    <aside className="rounded-2xl border border-border bg-card px-4">
      {/* Category */}
      <Section title={t('category')}>
        <div className="grid grid-cols-2 gap-2" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
          {CATS.map((c) => {
            const active = value.cat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => set('cat', c.key)}
                className={`flex h-10 items-center justify-between rounded-xl border px-2.5 text-xs font-bold transition-colors cursor-pointer ${
                  active
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-background/60 text-muted hover:border-accent/40 hover:text-foreground'
                }`}
              >
                <span className="truncate">{L(c.fa, c.en)}</span>
                <span className={`ms-1 shrink-0 text-[11px] tabular-nums ${active ? 'text-accent' : 'text-muted/60'}`}>
                  {nf(counts[c.key] ?? 0)}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Toggles */}
      <Section title={t('quick')}>
        <div className="flex flex-col gap-1">
          <ToggleRow icon={<Zap className={`size-4 ${value.fastTrade ? 'text-accent' : 'text-muted'}`} />} label={t('fastTrade')} on={value.fastTrade} onChange={(v) => set('fastTrade', v)} />
          <ToggleRow icon={<span className={`text-[13px] font-black ${value.stattrak ? 'text-accent' : 'text-muted'}`}>ST™</span>} label="StatTrak™" on={value.stattrak} onChange={(v) => set('stattrak', v)} />
          <ToggleRow icon={<Sticker className={`size-4 ${value.sticker ? 'text-accent' : 'text-muted'}`} />} label={t('haveSticker')} on={value.sticker} onChange={(v) => set('sticker', v)} />
          <ToggleRow icon={<Tag className={`size-4 ${value.nametag ? 'text-accent' : 'text-muted'}`} />} label={t('nameTag')} on={value.nametag} onChange={(v) => set('nametag', v)} />
        </div>
      </Section>

      {/* Wear */}
      <Section title={t('wear')}>
        <div className="flex flex-col gap-1">
          {ALL_WEAR.map((w) => {
            const checked = value.wears.includes(w);
            return (
              <label key={w} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-xs text-foreground/90 hover:bg-card-hover cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleWear(w)}
                  className="size-4 shrink-0 accent-[var(--accent)] cursor-pointer"
                />
                <span className="flex-1" dir="ltr">{w}</span>
                <span className="size-2 shrink-0 rounded-full" style={{ background: WEAR_DOT[w] }} />
              </label>
            );
          })}
        </div>
      </Section>

      {/* Price range */}
      <Section title={t('priceRange')}>
        <div className="flex items-center gap-2" dir="ltr">
          <div className="flex flex-1 items-center gap-1 rounded-lg border border-border bg-background/60 px-2 py-1.5">
            <span className="text-[10px] text-muted">{L('از', 'From')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={PRICE_CEILING_TOMAN}
              step={STEP}
              value={value.minToman}
              onChange={(e) => {
                const v = Math.max(0, Math.min(Number(e.target.value) || 0, value.maxToman - STEP));
                set('minToman', Math.round(v / STEP) * STEP);
              }}
              className="w-full min-w-0 bg-transparent text-end text-xs font-bold text-foreground outline-none"
            />
          </div>
          <div className="flex flex-1 items-center gap-1 rounded-lg border border-border bg-background/60 px-2 py-1.5">
            <span className="text-[10px] text-muted">{L('تا', 'To')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={PRICE_CEILING_TOMAN}
              step={STEP}
              value={value.maxToman}
              onChange={(e) => {
                const v = Math.min(PRICE_CEILING_TOMAN, Math.max(Number(e.target.value) || 0, value.minToman + STEP));
                set('maxToman', Math.round(v / STEP) * STEP);
              }}
              className="w-full min-w-0 bg-transparent text-end text-xs font-bold text-foreground outline-none"
            />
          </div>
        </div>

        {/* dual slider */}
        <div className="relative mt-4 h-5" dir="ltr">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
            style={{ insetInlineStart: `${pct(value.minToman)}%`, width: `${pct(value.maxToman - value.minToman)}%` }}
          />
          <input
            type="range"
            min={0}
            max={PRICE_CEILING_TOMAN}
            step={STEP}
            value={value.minToman}
            onChange={(e) => set('minToman', Math.min(Number(e.target.value), value.maxToman - STEP))}
            aria-label={L('حداقل قیمت', 'Min price')}
            className="market-range pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent"
          />
          <input
            type="range"
            min={0}
            max={PRICE_CEILING_TOMAN}
            step={STEP}
            value={value.maxToman}
            onChange={(e) => set('maxToman', Math.max(Number(e.target.value), value.minToman + STEP))}
            aria-label={L('حداکثر قیمت', 'Max price')}
            className="market-range pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent"
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-muted" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
          <span>{nf(0)} {tomanLabel}</span>
          <span>{nf(PRICE_CEILING_TOMAN / 2 / 1_000_000)}M {tomanLabel}</span>
          <span>{nf(PRICE_CEILING_TOMAN / 1_000_000)}M {tomanLabel}</span>
        </div>
      </Section>

      {/* Reset */}
      {!isDefault(value) && (
        <div className="py-4">
          <button
            onClick={() => onChange(defaultFilters())}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-muted transition-colors hover:border-accent/40 hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            {t('reset')}
          </button>
        </div>
      )}
    </aside>
  );
}

function ToggleRow({ icon, label, on, onChange }: { icon: React.ReactNode; label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-card-hover transition-colors">
      <span className="grid size-5 shrink-0 place-items-center">{icon}</span>
      <span className="flex-1 text-xs text-foreground/90">{label}</span>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}
