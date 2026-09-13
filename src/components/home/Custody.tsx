'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Lock, BadgeCheck, Send, Banknote, Package, Coins } from 'lucide-react';

export default function Custody() {
  const t = useTranslations('custody');
  const locale = useLocale();
  const nf = (n: number) =>
    new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(n);

  const steps = [
    { icon: Lock, title: t('steps.one.title'), item: t('steps.one.item'), cash: t('steps.one.cash') },
    { icon: BadgeCheck, title: t('steps.two.title'), item: t('steps.two.item'), cash: t('steps.two.cash') },
    { icon: Send, title: t('steps.three.title'), item: t('steps.three.item'), cash: t('steps.three.cash') },
    { icon: Banknote, title: t('steps.four.title'), item: t('steps.four.item'), cash: t('steps.four.cash'), highlight: true },
  ];

  return (
    <section id="custody" className="border-y border-border bg-card/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t('kicker')}</p>
        <h2 className="mt-2 max-w-xl text-2xl font-black leading-tight sm:text-3xl">{t('title')}</h2>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={i}
              className={`relative rounded-2xl border p-5 ${
                step.highlight ? 'border-accent/40 bg-accent/5' : 'border-border bg-card'
              }`}
            >
              <span className="absolute end-4 top-4 text-[10px] font-bold text-muted">
                {nf(i + 1)}/{nf(4)}
              </span>

              <span
                className={`flex size-10 items-center justify-center rounded-xl ${
                  step.highlight ? 'bg-accent text-accent-foreground' : 'bg-background text-accent'
                }`}
              >
                <step.icon className="size-5" />
              </span>

              <h3 className="mt-4 text-sm font-black">{step.title}</h3>

              <div className="mt-3 space-y-1.5 text-[11px] leading-relaxed">
                <p className="flex items-start gap-1.5 text-muted">
                  <Package className="mt-0.5 size-3 shrink-0" />
                  {step.item}
                </p>
                <p className="flex items-start gap-1.5 text-muted">
                  <Coins className="mt-0.5 size-3 shrink-0" />
                  {step.cash}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
