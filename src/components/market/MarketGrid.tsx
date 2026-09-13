'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import SkinCard from '@/components/skins/SkinCard';
import { skins, TOTAL_LISTINGS } from '@/data/skins';

type CatFilter = 'all' | 'Rifles' | 'Pistols' | 'Knives' | 'Gloves';
type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'float-asc' | 'discount';

const CATEGORIES: { key: CatFilter; fa: string; en: string }[] = [
  { key: 'all', fa: 'همه', en: 'All' },
  { key: 'Rifles', fa: 'رایفل‌ها', en: 'Rifles' },
  { key: 'Pistols', fa: 'پیستول‌ها', en: 'Pistols' },
  { key: 'Knives', fa: 'ناچ‌ها', en: 'Knives' },
  { key: 'Gloves', fa: 'دستکش‌ها', en: 'Gloves' },
];

const SORTS: { key: SortKey; fa: string; en: string }[] = [
  { key: 'newest', fa: 'جدیدترین', en: 'Newest' },
  { key: 'price-asc', fa: 'ارزان‌ترین', en: 'Price ↑' },
  { key: 'price-desc', fa: 'گران‌ترین', en: 'Price ↓' },
  { key: 'float-asc', fa: 'کمترین float', en: 'Lowest float' },
  { key: 'discount', fa: 'بیشترین تخفیف', en: 'Best discount' },
];

export default function MarketGrid() {
  const t = useTranslations('floor');
  const locale = useLocale();
  const [cat, setCat] = useState<CatFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [stattrakOnly, setStattrakOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = skins.filter((s) => {
      if (cat !== 'all' && s.category !== cat) return false;
      if (stattrakOnly && !s.stattrak) return false;
      if (s.price_usd > maxPrice) return false;
      if (query && !s.market_hash_name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    switch (sort) {
      case 'price-asc': list = [...list].sort((a, b) => a.price_usd - b.price_usd); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price_usd - a.price_usd); break;
      case 'float-asc': list = [...list].sort((a, b) => a.float - b.float); break;
      case 'discount': list = [...list].sort((a, b) => b.discount_pct - a.discount_pct); break;
      case 'newest':
      default: list = [...list].sort((a, b) => a.listed_hours_ago - b.listed_hours_ago);
    }
    return list;
  }, [cat, sort, stattrakOnly, maxPrice, query]);

  const nf = (n: number) => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(n);
  const L = (fa: string, en: string) => (locale === 'fa' ? fa : en);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* search + category tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`h-9 rounded-full px-4 text-xs font-bold transition-colors cursor-pointer ${
              cat === c.key
                ? 'bg-accent text-accent-foreground'
                : 'border border-border bg-card text-muted hover:border-accent/40 hover:text-foreground'
            }`}
          >
            {L(c.fa, c.en)}
          </button>
        ))}
        <div className="relative ms-auto">
          <ArrowUpDown className="pointer-events-none absolute inset-y-0 start-3 my-auto size-3.5 text-muted" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 cursor-pointer appearance-none rounded-full border border-border bg-card ps-9 pe-4 text-xs font-bold text-foreground focus:border-accent/50 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{L(s.fa, s.en)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* filter row */}
      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-3.5">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-muted">
          <SlidersHorizontal className="size-3.5" />
          {t('filters')}
        </span>

        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={stattrakOnly}
            onChange={(e) => setStattrakOnly(e.target.checked)}
            className="size-4 accent-[#e8a65a] cursor-pointer"
          />
          StatTrak™
        </label>

        <label className="flex flex-1 items-center gap-2 text-xs text-muted sm:max-w-xs">
          <span className="whitespace-nowrap">{L('حداکثر قیمت', 'Max price')} ({nf(maxPrice)}$)</span>
          <input
            type="range"
            min={10}
            max={15000}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-[#e8a65a]"
          />
        </label>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === 'fa' ? 'جستجو…' : 'Search…'}
          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none sm:max-w-[220px]"
        />
      </div>

      {/* count */}
      <p className="mt-4 text-xs text-muted">
        {nf(filtered.length)} / {nf(TOTAL_LISTINGS)} {t('listings')}
      </p>

      {/* grid */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((skin) => (
          <SkinCard key={skin.id} skin={skin} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-muted">
          {locale === 'fa' ? 'چیزی پیدا نشد — فیلترها را عوض کن.' : 'Nothing found — try different filters.'}
        </p>
      )}
    </section>
  );
}
