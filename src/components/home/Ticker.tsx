'use client';

import { useLocale, useTranslations } from 'next-intl';
import { skins } from '@/data/skins';
import { primaryPrice } from '@/data/skins';

export default function Ticker() {
  const locale = useLocale();
  const t = useTranslations('ticker');

  // Build a deterministic pseudo-live feed from skins
  const feed = [...skins]
    .sort((a, b) => b.seller_trades - a.seller_trades)
    .slice(0, 14)
    .map((s, i) => ({
      name: s.market_hash_name,
      price: primaryPrice(s.price_usd, locale),
      wear: s.wear,
      seconds: ((i * 7) % 55) + 2,
    }));

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center gap-10 px-5">
      {feed.map((f, i) => (
        <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-muted">
          <span className="size-1.5 rounded-full bg-accent/70" />
          <span className="font-medium text-foreground/90">{f.name}</span>
          {f.wear === 'Factory New' && <span className="text-accent">FN</span>}
          <span className="font-bold">{f.price}{locale === 'fa' ? ' تومان' : ''}</span>
          <span className="text-[10px]">
            {new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(f.seconds)}
            {locale === 'fa' ? ' ثانیه پیش' : 's ago'}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="border-y border-border bg-card/40 py-2.5" aria-label={t('label')}>
      <div className="relative overflow-hidden">
        <div className={`flex w-max ${locale === 'fa' ? 'ticker-rtl' : 'ticker-ltr'}`}>
          {row('a')}
          {row('b')}
        </div>
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 start-0 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 end-0 w-16 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
}
