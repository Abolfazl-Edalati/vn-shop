'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';
import SkinCard from '@/components/skins/SkinCard';
import {
  skins,
  getTrending,
  getUnder100,
  getBestDeals,
  getKnivesGloves,
  getJustListed,
  TOTAL_LISTINGS,
} from '@/data/skins';

type Tab = 'trending' | 'under100' | 'bestDeals' | 'knivesGloves' | 'justListed';

const TABS: { key: Tab; count: () => number }[] = [
  { key: 'trending', count: () => getTrending().length },
  { key: 'under100', count: () => getUnder100().length },
  { key: 'bestDeals', count: () => getBestDeals().length },
  { key: 'knivesGloves', count: () => getKnivesGloves().length },
  { key: 'justListed', count: () => getJustListed().length },
];

function itemsFor(tab: Tab) {
  switch (tab) {
    case 'trending': return getTrending();
    case 'under100': return getUnder100();
    case 'bestDeals': return getBestDeals();
    case 'knivesGloves': return getKnivesGloves();
    case 'justListed': return getJustListed();
  }
}

export default function MarketFloor() {
  const t = useTranslations('floor');
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>('trending');

  const items = itemsFor(tab);
  const nf = (n: number) => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(n);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t('kicker')}</p>
          <h2 className="mt-2 max-w-md text-2xl font-black leading-tight sm:text-3xl">{t('title')}</h2>
          <p className="mt-2 text-sm text-muted">{t('subtitle')}</p>
        </div>
        <p className="text-xs text-muted">
          {/* meta row moved below tabs */}
        </p>
      </div>

      {/* tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map(({ key }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`h-9 rounded-full px-4 text-xs font-bold transition-colors cursor-pointer ${
              tab === key
                ? 'bg-accent text-accent-foreground'
                : 'border border-border bg-card text-muted hover:border-accent/40 hover:text-foreground'
            }`}
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
        <button className="ms-auto inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-xs font-bold text-muted hover:border-accent/40 hover:text-foreground transition-colors cursor-pointer">
          <SlidersHorizontal className="size-3.5" />
          {t('filters')}
        </button>
      </div>

      {/* meta row */}
      <p className="mt-3 text-xs text-muted">
        {locale === 'fa' ? 'همه' : 'All'} {nf(TOTAL_LISTINGS)} {t('listings')}
      </p>

      {/* grid */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, 8).map((skin) => (
          <SkinCard key={skin.id} skin={skin} />
        ))}
      </div>
    </section>
  );
}
