'use client';

import { useLocale, useTranslations } from 'next-intl';
import { TrendingUp } from 'lucide-react';

export default function MarketStats() {
  const t = useTranslations('stats');
  const locale = useLocale();
  const nf = (n: number, frac = 0) =>
    new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: frac }).format(n);

  // mock index sparkline data (36 days, upward trend)
  const spark = [42, 45, 44, 48, 52, 51, 55, 53, 58, 60, 59, 63, 62, 66, 65, 69, 71, 70, 74, 73, 77, 76, 80, 79, 83, 82, 86, 85, 88, 90, 89, 93, 92, 96, 98, 100];

  const stats = [
    { label: t('activeListings'), value: nf(41928), sub: t('activeListingsSub') },
    { label: t('settled30d'), value: locale === 'fa' ? `${nf(8.42, 2)} م دلار` : '$8.42M', sub: t('settled30dSub') },
    { label: t('medianPayout'), value: locale === 'fa' ? '۴۱ ثانیه' : '41s', sub: t('medianPayoutSub') },
    { label: t('disputeRate'), value: nf(0.04, 2) + '٪', sub: t('disputeRateSub') },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{s.label}</p>
            <p className="mt-2 text-2xl font-black">{s.value}</p>
            <p className="mt-1 text-[11px] text-muted">{s.sub}</p>
          </div>
        ))}

        {/* index card with sparkline */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{t('indexTitle')}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-2xl font-black text-emerald-400">
            <TrendingUp className="size-4" />
            +{nf(6.6, 1)}٪
          </p>
          <svg viewBox="0 0 100 32" className="mt-2 h-8 w-full" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points={spark.map((v, i) => `${(i / (spark.length - 1)) * 100},${32 - (v / 100) * 28}`).join(' ')}
              fill="none"
              stroke="#4ade80"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <p className="mt-1 text-[11px] text-muted">{t('indexSub')}</p>
        </div>
      </div>
    </section>
  );
}
