'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import {
  Search, Check, Zap, ArrowLeft, ArrowRight, Clock, ShieldCheck, BadgeCheck,
  Wallet, TrendingUp, Info, Loader2, Banknote,
} from 'lucide-react';
import { getDemoInventory, USD_TO_TOMAN } from '@/data/skins';
import { wearLabel } from '@/components/skins/SkinCard';
import { newOrderId, saveSellOrder } from '@/lib/orders';

/** Instant-sell payout tiers — the more value you send, the better the rate. */
const TIERS = [
  { min: 0, rate: 0.90, fa: 'پایه', en: 'Base' },
  { min: 500, rate: 0.925, fa: 'نقره‌ای', en: 'Silver' },
  { min: 2000, rate: 0.945, fa: 'طلایی', en: 'Gold' },
  { min: 5000, rate: 0.96, fa: 'الماس', en: 'Diamond' },
];

type Payout = 'wallet' | 'card' | 'crypto';

const PAYOUTS: { key: Payout; fa: string; en: string; noteFa: string; noteEn: string }[] = [
  { key: 'wallet', fa: 'کیف پول VN Shop', en: 'VN Shop wallet', noteFa: 'فوری · بدون کارمزد', noteEn: 'Instant · no fee' },
  { key: 'card', fa: 'کارت بانکی', en: 'Bank card', noteFa: 'تا ۲۴ ساعت', noteEn: 'Within 24h' },
  { key: 'crypto', fa: 'ارز دیجیتال (USDT)', en: 'Crypto (USDT)', noteFa: 'TRC-20 · network fee', noteEn: 'TRC-20 · network fee' },
];

export default function SellView() {
  const locale = useLocale();
  const router = useRouter();
  const L = (fa: string, en: string) => (locale === 'fa' ? fa : en);
  const nf = (n: number, frac = 0) =>
    new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: frac }).format(n);
  const Back = locale === 'fa' ? ArrowRight : ArrowLeft;

  const inventory = getDemoInventory();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [payout, setPayout] = useState<Payout>('wallet');
  const [payoutTarget, setPayoutTarget] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [stage, setStage] = useState<'select' | 'sending'>('select');
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      inventory.filter((s) =>
        s.market_hash_name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [inventory, query]
  );

  const selectedItems = inventory.filter((s) => selected.has(s.id));
  const selectedValue = selectedItems.reduce((sum, s) => sum + s.price_usd, 0);

  const rate = [...TIERS].reverse().find((t) => selectedValue >= t.min)!.rate;
  const payoutUsd = selectedValue * rate;
  const feeUsd = selectedValue - payoutUsd;
  const nextTier = TIERS.find((t) => t.min > selectedValue);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError(null);
  }

  function submit() {
    setError(null);
    if (selected.size === 0) {
      setError(L('حداقل یک آیتم انتخاب کن.', 'Select at least one item.'));
      return;
    }
    if (payout !== 'wallet' && payoutTarget.trim().length < 4) {
      setError(L('اطلاعات دریافت وجه را کامل کن.', 'Complete your payout details.'));
      return;
    }
    if (!agreed) {
      setError(L('برای ادامه، شرایط فروش را تأیید کن.', 'Accept the sale terms to continue.'));
      return;
    }

    setStage('sending');
    const id = newOrderId();
    // simulate a trade-offer handshake, then persist the sell order
    setTimeout(() => {
      saveSellOrder({
        id,
        created_at: Date.now(),
        lines: selectedItems.map((s) => ({
          id: s.id,
          name: s.market_hash_name,
          image: s.image,
          rarity_color: s.rarity_color,
          wear: s.wear,
          float: s.float,
          qty: 1,
          price_usd: s.price_usd,
        })),
        total_usd: selectedValue,
        total_toman: Math.round(selectedValue * USD_TO_TOMAN),
        payout_usd: payoutUsd,
        payout_method: payout,
        payout_target: payoutTarget.trim(),
        rate,
        step: 0, // 0 = offer sent, waiting for the user to accept in Steam
      });
      router.push(`/sell-order/${id}`);
    }, 1400);
  }

  /* ---------- sending overlay ---------- */
  if (stage === 'sending') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center sm:px-6">
        <span className="grid size-16 place-items-center rounded-2xl border border-border bg-card">
          <Loader2 className="size-6 animate-spin text-accent" />
        </span>
        <h1 className="mt-5 text-lg font-black">{L('در حال ارسال ترید آفر…', 'Sending trade offer…')}</h1>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {L(
            'آیتم‌ها رو در اینونتوری استیم تأیید کن. بعد از تأیید، مبلغ به روش انتخابی واریز می‌شه.',
            'Confirm the items in your Steam inventory. Once confirmed, your payout is released.'
          )}
        </p>
        <div className="mt-6 w-full space-y-2 rounded-2xl border border-border bg-card p-4 text-start">
          <p className="flex justify-between text-xs text-muted">
            <span>{L('آیتم‌های ارسالی', 'Items sent')}</span>
            <b className="text-foreground">{nf(selected.size)}</b>
          </p>
          <p className="flex justify-between text-xs text-muted">
            <span>{L('مبلغ دریافتی', 'Your payout')}</span>
            <b className="text-accent">{nf(Math.round(payoutUsd * USD_TO_TOMAN))} {L('تومان', 'T')}</b>
          </p>
        </div>
      </div>
    );
  }

  /* ---------- main ---------- */
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black">{L('فروش آیتم به VN Shop', 'Sell items to VN Shop')}</h1>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted">
            {L(
              'اسکین‌هات رو به ما بفروش. پول پیش ما امن می‌مونه و بلافاصله بعد از تأیید ترید، واریز می‌شه.',
              'Sell your skins to us. Your payout is protected and released as soon as the trade is confirmed.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5">
          <ShieldCheck className="size-4 shrink-0 text-accent" />
          <p className="text-[11px] text-muted">
            {L('خریدار خودِ VN Shopه — واسطه‌ای در کار نیست', 'VN Shop is the buyer — no third party involved')}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* inventory */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-3.5">
            <div className="relative min-w-48 flex-1">
              <Search className="absolute inset-y-0 start-3 my-auto size-4 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder={L('جستجو در اینونتوری…', 'Search your inventory…')}
                className="h-9 w-full rounded-lg border border-border bg-background ps-10 pe-3 text-xs text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none"
              />
            </div>
            <button
              onClick={() =>
                setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((i) => i.id)))
              }
              className="h-9 shrink-0 rounded-lg border border-border bg-background px-3.5 text-xs font-bold text-foreground transition-colors hover:border-accent/40 cursor-pointer"
            >
              {selected.size === filtered.length && filtered.length > 0
                ? L('حذف انتخاب‌ها', 'Clear selection')
                : L('انتخاب همه', 'Select all')}
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="p-10 text-center text-xs text-muted">{L('آیتمی پیدا نشد.', 'No items found.')}</p>
          ) : (
            <ul className="max-h-130 divide-y divide-border overflow-y-auto">
              {filtered.map((s) => {
                const isSel = selected.has(s.id);
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => toggle(s.id)}
                      className={`flex w-full cursor-pointer items-center gap-3 p-3.5 text-start transition-colors ${
                        isSel ? 'bg-accent/5' : 'hover:bg-card-hover'
                      }`}
                    >
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSel ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-background'
                        }`}
                      >
                        {isSel && <Check className="size-3.5" />}
                      </span>

                      <span
                        className="size-12 shrink-0 overflow-hidden rounded-lg"
                        style={{ background: `radial-gradient(70% 70% at 50% 45%, ${s.rarity_color}22 0%, transparent 75%), var(--tile)` }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.image} alt={s.market_hash_name} className="h-full w-full object-contain p-1" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          {s.stattrak && (
                            <span className="rounded bg-orange-600/90 px-1 text-[9px] font-bold text-white">ST™</span>
                          )}
                          <span className="truncate text-xs font-bold" style={{ color: s.rarity_color }}>
                            {s.market_hash_name}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[10px] text-muted">
                          {wearLabel(s.wear, locale)} · float {nf(s.float, 4)}
                        </span>
                      </span>

                      <span className="shrink-0 text-end">
                        <span className="block text-xs font-bold" style={{ color: s.rarity_color }}>
                          {nf(Math.round(s.price_usd * rate * USD_TO_TOMAN))}
                          {locale === 'fa' && <span className="ms-1 text-[9px] font-medium text-muted">تومان</span>}
                        </span>
                        <span className="mt-0.5 block text-[9px] text-muted">
                          {L('می‌خریم از تو', 'We pay')}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-border bg-background/40 px-3.5 py-2.5 text-[10px] text-muted">
            <span>{nf(filtered.length)} {L('آیتم در اینونتوری دمو', 'items in demo inventory')}</span>
            <span className="inline-flex items-center gap-1">
              <Info className="size-3" />
              {L('داده نمایشی', 'Demo data')}
            </span>
          </div>
        </div>

        {/* summary */}
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20">
          {/* rate tier */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-sm font-black">
                <TrendingUp className="size-4 text-accent" />
                {L('نرخ فروش تو', 'Your payout rate')}
              </h2>
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-black text-accent tabular-nums">
                {nf(rate * 100, 1)}%
              </span>
            </div>

            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <dt>{L('ارزش آیتم‌های انتخابی', 'Selected value')}</dt>
                <dd className="font-bold text-foreground">{nf(Math.round(selectedValue * USD_TO_TOMAN))}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>{L('کارمزد VN Shop', 'VN Shop fee')}</dt>
                <dd className="font-bold text-foreground">−{nf(Math.round(feeUsd * USD_TO_TOMAN))}</dd>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                <dt className="text-xs font-bold">{L('مبلغ دریافتی', 'You receive')}</dt>
                <dd className="text-end">
                  <p className="text-xl font-black text-accent">
                    {nf(Math.round(payoutUsd * USD_TO_TOMAN))}
                    {locale === 'fa' && <span className="ms-1 text-xs font-medium text-muted">تومان</span>}
                  </p>
                  <p className="text-[10px] text-muted">${nf(payoutUsd, 2)}</p>
                </dd>
              </div>
            </dl>

            {nextTier && selectedValue > 0 && (
              <p className="mt-3 rounded-lg border border-accent/25 bg-accent/5 p-2.5 text-[10px] leading-relaxed text-muted">
                {L(
                  `${nf(Math.round((nextTier.min - selectedValue) * USD_TO_TOMAN))} تومان دیگه بفروش تا نرخ ${nf(nextTier.rate * 100, 1)}٪ بگیری.`,
                  `Sell ${nf(Math.round((nextTier.min - selectedValue) * USD_TO_TOMAN))} T more to unlock a ${nf(nextTier.rate * 100, 1)}% rate.`
                )}
              </p>
            )}
          </div>

          {/* payout method */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="inline-flex items-center gap-2 text-sm font-black">
              <Wallet className="size-4 text-accent" />
              {L('روش دریافت وجه', 'Payout method')}
            </h2>

            <div className="mt-3 flex flex-col gap-2">
              {PAYOUTS.map((p) => {
                const active = payout === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setPayout(p.key)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-start transition-colors cursor-pointer ${
                      active ? 'border-accent bg-accent/10' : 'border-border bg-background/60 hover:border-accent/40'
                    }`}
                  >
                    <span>
                      <span className={`block text-xs font-bold ${active ? 'text-accent' : 'text-foreground/90'}`}>
                        {L(p.fa, p.en)}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-muted">{L(p.noteFa, p.noteEn)}</span>
                    </span>
                    <span
                      className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                        active ? 'border-accent bg-accent' : 'border-border'
                      }`}
                    >
                      {active && <Check className="size-2.5 text-accent-foreground" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {payout !== 'wallet' && (
              <input
                value={payoutTarget}
                onChange={(e) => setPayoutTarget(e.target.value)}
                dir="ltr"
                placeholder={payout === 'card' ? L('شماره کارت / شبا', 'Card / IBAN') : L('آدرس کیف پول USDT', 'USDT wallet address')}
                className="mt-3 h-11 w-full rounded-xl border border-border bg-background/60 px-3.5 text-xs text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-accent/50"
              />
            )}
          </div>

          {/* confirm */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  setError(null);
                }}
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--accent)]"
              />
              <span className="text-[11px] leading-relaxed text-muted">
                {L(
                  'این آیتم‌ها مالکشون منم و آزادانه به VN Shop می‌فروشم؛ مبلغ بعد از تأیید ترید واریز می‌شه.',
                  'I own these items and sell them freely to VN Shop; payout is released after the trade is confirmed.'
                )}
              </span>
            </label>

            {error && (
              <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-[11px] text-red-300">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={selected.size === 0}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-black text-accent-foreground transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <Zap className="size-4" />
              {selected.size === 0
                ? L('آیتمی انتخاب نشده', 'No items selected')
                : L(`فروش ${nf(selected.size)} آیتم`, `Sell ${nf(selected.size)} items`)}
            </button>

            <ol className="mt-4 space-y-2 border-t border-border pt-4 text-[11px] text-muted">
              {[
                { icon: Zap, label: L('ارسال ترید آفر به اکانتت', 'Trade offer sent to you') },
                { icon: BadgeCheck, label: L('بررسی فلوت و اصالت', 'Float and authenticity checked') },
                { icon: Banknote, label: L('واریز مبلغ به روش انتخابی', 'Payout sent to your chosen method') },
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <s.icon className="size-3.5 shrink-0 text-accent" />
                  {s.label}
                </li>
              ))}
            </ol>

            <p className="mt-3 inline-flex items-start gap-1.5 text-[10px] leading-relaxed text-muted">
              <Clock className="mt-0.5 size-3.5 shrink-0 text-accent" />
              {L(
                'ممکنه آیتم‌های تحت هولد ترید باشن؛ اون‌ها رو بعد از باز شدن قفل می‌شه فروخت.',
                'Some items may be trade-locked; you can sell them once the hold expires.'
              )}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
