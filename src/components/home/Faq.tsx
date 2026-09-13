'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';

export default function Faq() {
  const t = useTranslations('faq');
  const [open, setOpen] = useState<string | null>('q1');

  const questions = [
    { id: 'q1', answer: 'q1a' },
    { id: 'q2' },
    { id: 'q3' },
    { id: 'q4' },
    { id: 'q5' },
    { id: 'q6' },
  ];

  return (
    <section className="border-y border-border bg-card/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t('kicker')}</p>
        <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{t('title')}</h2>

        <div className="mt-8 max-w-3xl">
          {questions.map((q) => {
            const isOpen = open === q.id;
            const hasAnswer = 'answer' in q;
            return (
              <div key={q.id} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => setOpen(isOpen ? null : q.id)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-start cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className={`text-sm font-bold transition-colors ${isOpen ? 'text-foreground' : 'text-muted hover:text-foreground'}`}>
                    {t(`items.${q.id}`)}
                  </span>
                  {isOpen ? (
                    <X className="size-4 shrink-0 text-accent" />
                  ) : (
                    <Plus className="size-4 shrink-0 text-muted" />
                  )}
                </button>
                {isOpen && hasAnswer && (
                  <p className="max-w-2xl pb-5 text-xs leading-relaxed text-muted">
                    {t(`items.${q.answer as string}`)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
