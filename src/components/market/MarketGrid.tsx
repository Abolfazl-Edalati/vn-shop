'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';
import SkinCard from '@/components/skins/SkinCard';
import { skins, TOTAL_LISTINGS } from '@/data/skins';
import MarketFilters, {
  applyFilters,
  defaultFilters,
  type CatFilter,
  type MarketFilterState,
} from './MarketFilters';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'float-asc' | 'discount';

const SORTS: { key: SortKey; fa: string; en: string }[] = [
  { key: 'newest', fa: 'جدیدترین', en: 'Newest' },
  { key: 'price-asc', fa: 'ارزان‌ترین', en: 'Price ↑' },
  { key: 'price-desc', fa: 'گران‌ترین', en: 'Price ↓' },
  { key: 'float-asc', fa: 'کمترین float', en: 'Lowest float' },
  { key: 'discount', fa: 'بیشترین تخفیف', en: 'Best discount' },
];

export default function MarketGrid() {
  const t = useTranslations('floor');
  const tf = useTranslations('marketFilters');
  const locale = useLocale();
  const [filters, setFilters] = useState<MarketFilterState>(defaultFilters);
  const [sort, setSort] = useState<SortKey>('newest');
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // category counts respect everything EXCEPT the category itself
  const counts = useMemo(() => {
    const base = applyFilters(skins, { ...filters, cat: 'all' });
    const q = query.trim().toLowerCase();
    const pool = q ? base.filter((s) => s.market_hash_name.toLowerCase().includes(q)) : base;
    const out = { all: pool.length } as Record<CatFilter, number>;
    for (const s of pool) out[s.category] = (out[s.category] ?? 0) + 1;
    return out;
  }, [filters, query]);

  const filtered = useMemo(() => {
    let list = applyFilters(skins, filters);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((s) => s.market_hash_name.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'price-asc': list = [...list].sort((a, b) => a.price_usd - b.price_usd); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price_usd - a.price_usd); break;
      case 'float-asc': list = [...list].sort((a, b) => a.float - b.float); break;
      case 'discount': list = [...list].sort((a, b) => b.discount_pct - a.discount_pct); break;
      case 'newest':
      default: list = [...list].sort((a, b) => a.listed_hours_ago - b.listed_hours_ago);
    }
    return list;
  }, [filters, sort, query]);

  const nf = (n: number) => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(n);
  const filterSignature = JSON.stringify(filters) + sort + query;

  const filterPanel = <MarketFilters value={filters} onChange={setFilters} counts={counts} />;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* top bar: search + sort + mobile filter button */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === 'fa' ? 'جستجوی اسکین…' : 'Search skins…'}
          className="h-10 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none sm:w-72"
        />
        <div className="relative ms-auto">
          <ArrowUpDown className="pointer-events-none absolute inset-y-0 start-3 my-auto size-3.5 text-muted" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 cursor-pointer appearance-none rounded-xl border border-border bg-card ps-9 pe-4 text-xs font-bold text-foreground focus:border-accent/50 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{locale === 'fa' ? s.fa : s.en}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground lg:hidden"
        >
          <SlidersHorizontal className="size-3.5" />
          {tf('title')}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* sidebar (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pe-1">{filterPanel}</div>
        </div>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 start-0 w-[300px] max-w-[88vw] overflow-y-auto bg-background p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-sm font-bold">
                  <SlidersHorizontal className="size-4 text-accent" />
                  {tf('title')}
                </h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-muted hover:bg-card-hover hover:text-foreground cursor-pointer"
                  aria-label={locale === 'fa' ? 'بستن' : 'Close'}
                >
                  <X className="size-4" />
                </button>
              </div>
              {filterPanel}
              <button
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-accent text-xs font-bold text-accent-foreground cursor-pointer"
              >
                {locale === 'fa' ? `نمایش ${nf(filtered.length)} نتیجه` : `Show ${nf(filtered.length)} results`}
              </button>
            </div>
          </div>
        )}

        {/* results */}
        <div>
          {/* count */}
          <p className="mb-4 text-xs text-muted">
            {nf(filtered.length)} / {nf(TOTAL_LISTINGS)} {t('listings')}
          </p>

          {/* grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((skin, i) => (
              <div
                key={`${filterSignature}-${skin.id}`}
                className="card-in"
                style={{ animationDelay: `${Math.min(i, 16) * 30}ms` }}
              >
                <SkinCard skin={skin} />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-20 text-center text-sm text-muted">
              {locale === 'fa' ? 'چیزی پیدا نشد — فیلترها را عوض کن.' : 'Nothing found — try different filters.'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
