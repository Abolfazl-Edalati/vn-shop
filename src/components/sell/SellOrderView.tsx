'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  CheckCircle2, Zap, BadgeCheck, Banknote, ShieldCheck, Package, Clock, Copy, Check,
  ArrowLeft, ArrowRight, Wallet, CreditCard, Bitcoin, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { primaryPrice, secondaryPrice } from '@/data/skins';
import { wearLabel } from '@/components/skins/SkinCard';
import { getSellOrder, updateSellOrderStep, type SellOrder } from '@/lib/orders';

const METHOD: Record<string, { fa: string; en: string; Icon: typeof Wallet }> = {
  wallet: { fa: 'کیف پول VN Shop', en: 'VN Shop wallet', Icon: Wallet },
  card: { fa: 'کارت بانکی', en: 'Bank card', Icon: CreditCard },
  crypto: { fa: 'ارز دیجیتال (USDT)', en: 'Crypto (USDT)', Icon: Bitcoin },
};

/** How long the user has to accept the offer, mirroring Steam's trade holds. */
const ACCEPT_WINDOW_MS = 15 * 60 * 1000;

export default function SellOrderView({ id }: { id: string }) {
  const locale = useLocale();
  const L = (fa: string, en: string) => (locale === 'fa' ? fa : en);
  const nf = (n: number, frac = 0) =>
    new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: frac }).format(n);
  const Back = locale === 'fa' ? ArrowRight : ArrowLeft;

  const [order, setOrder] = useState<SellOrder | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setOrder(getSellOrder(id) ?? null);
  }, [id]);

  // tick only while the offer is genuinely waiting to be accepted (step 0)
  useEffect(() => {
    if (order?.step !== 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [order?.step]);

  if (order === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-sm text-muted sm:px-6">
        {L('در حال بارگذاری…', 'Loading…')}
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-border bg-card">
          <AlertCircle className="size-5 text-muted" />
        </span>
        <h1 className="mt-4 text-lg font-black">{L('درخواست فروش پیدا نشد', 'Sell request not found')}</h1>
        <p className="mt-1 text-xs text-muted">
          {L('این درخواست روی این مرورگر ذخیره نشده است.', 'This request is not stored in this browser.')}
        </p>
        <Link
          href="/sell"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-black text-accent-foreground hover:bg-accent-strong transition-colors"
        >
          {L('شروع یک فروش جدید', 'Start a new sale')}
          <Back className="size-3.5" />
        </Link>
      </div>
    );
  }

  const current = order.step;
  const method = METHOD[order.payout_method] ?? METHOD.wallet;
  const expiresAt = order.created_at + ACCEPT_WINDOW_MS;
  const remaining = Math.max(0, expiresAt - now);
  const expired = current === 0 && remaining === 0;

  const mm = String(Math.floor(remaining / 60000)).padStart(2, '0');
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');

  const STEPS = [
    {
      icon: Zap,
      title: L('ترید آفر ارسال شد', 'Trade offer sent'),
      note: L('منتظر تأیید تو در استیم', 'Waiting for your approval in Steam'),
    },
    {
      icon: BadgeCheck,
      title: L('آیتم‌ها دریافت و بررسی شد', 'Items received & checked'),
      note: L('فلوت، پترن و اصالت تأیید شد', 'Float, pattern and authenticity verified'),
    },
    {
      icon: Banknote,
      title: L('مبلغ واریز شد', 'Payout sent'),
      note: L('به روش انتخابی تو', 'To your chosen method'),
    },
  ];

  function copyId() {
    navigator.clipboard
      ?.writeText(order!.id)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  }

  function advance() {
    const next = Math.min(2, current + 1);
    const updated = updateSellOrderStep(order!.id, next);
    if (updated) setOrder(updated);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* header */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                current === 2 ? 'bg-emerald-500/15' : 'bg-accent/15'
              }`}
            >
              {current === 2 ? (
                <CheckCircle2 className="size-5 text-emerald-400" />
              ) : (
                <Zap className="size-5 text-accent" />
              )}
            </span>
            <div>
              <h1 className="text-lg font-black">
                {current === 2
                  ? L('فروش کامل شد', 'Sale complete')
                  : L('درخواست فروش ثبت شد', 'Sell request submitted')}
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted">
                {current === 2
                  ? L('آیتم‌ها به VN Shop رسیدن و مبلغ واریز شد.', 'Your items arrived and the payout was sent.')
                  : L(
                      'ترید آفر برات ارسال شد. بعد از تأیید در استیم، مبلغ به روش انتخابی واریز می‌شه.',
                      'A trade offer has been sent. Once you accept it in Steam, your payout is released.'
                    )}
              </p>
            </div>
          </div>

          <button
            onClick={copyId}
            dir="ltr"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground hover:border-accent/40 transition-colors cursor-pointer"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-muted" />}
            {order.id}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-accent" />
            {new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(order.created_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <method.Icon className="size-3.5 text-accent" />
            {L(method.fa, method.en)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Package className="size-3.5 text-accent" />
            {nf(order.lines.length)} {L('آیتم', 'items')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-accent" />
            {L('نرخ', 'Rate')} {nf(order.rate * 100, 1)}%
          </span>
        </div>

        {/* countdown while the offer is pending */}
        {current === 0 && !expired && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3.5">
            <p className="inline-flex items-center gap-2 text-xs font-bold text-accent">
              <Loader2 className="size-3.5 animate-spin" />
              {L('منتظر تأیید ترید آفر در استیم', 'Waiting for you to accept in Steam')}
            </p>
            <span dir="ltr" className="text-sm font-black tabular-nums text-accent">
              {mm}:{ss}
            </span>
          </div>
        )}

        {expired && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5">
            <p className="inline-flex items-center gap-2 text-xs font-bold text-amber-300">
              <AlertCircle className="size-3.5" />
              {L('ترید آفر منقضی شد', 'Trade offer expired')}
            </p>
            <Link href="/sell" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-500/40 px-3 text-[11px] font-bold text-amber-300 hover:bg-amber-500/10 transition-colors">
              <RefreshCw className="size-3" />
              {L('ارسال دوباره', 'Send again')}
            </Link>
          </div>
        )}
      </div>

      {/* timeline */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="inline-flex items-center gap-2 text-sm font-black">
          <ShieldCheck className="size-4 text-accent" />
          {L('وضعیت فروش', 'Sale status')}
        </h2>

        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={i} className="relative">
                {i < STEPS.length - 1 && (
                  <span
                    className={`absolute top-5 hidden h-0.5 w-full sm:block ${i < current ? 'bg-accent' : 'bg-border'}`}
                    style={{ insetInlineStart: '50%' }}
                  />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <span
                    className={`grid size-10 place-items-center rounded-full border-2 transition-colors ${
                      done
                        ? 'border-accent bg-accent text-accent-foreground'
                        : active
                          ? 'border-accent bg-accent/15 text-accent'
                          : 'border-border bg-background text-muted'
                    }`}
                  >
                    {done ? <Check className="size-4" /> : <s.icon className="size-4" />}
                  </span>
                  <p className={`mt-2.5 text-[11px] font-bold ${done || active ? 'text-foreground' : 'text-muted'}`}>
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">{s.note}</p>
                  {active && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[9px] font-bold text-accent">
                      <span className="relative flex size-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                      </span>
                      {L('در جریان', 'In progress')}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {current < 2 && (
          <button
            onClick={advance}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-accent/50 bg-accent/10 text-xs font-black text-accent transition-colors hover:bg-accent/20 cursor-pointer"
          >
            <Zap className="size-3.5" />
            {current === 0
              ? L('ترید آفر رو تأیید کردم — ادامه', 'I accepted the offer — continue')
              : L('مرحله بعدی', 'Next step')}
          </button>
        )}

        {current === 2 && (
          <p className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 text-xs font-bold text-emerald-300">
            <CheckCircle2 className="size-4" />
            {L('فروش کامل شد — مبلغ واریز شد', 'Sale complete — payout sent')}
          </p>
        )}

        <p className="mt-4 text-[10px] leading-relaxed text-muted">
          {L(
            'این یک فلو نمایشی است؛ در نسخه نهایی هر مرحله با داده واقعی استیم و درگاه پرداخت آپدیت می‌شه.',
            'This is a demo flow; in the final version each step updates from real Steam and payment-gateway data.'
          )}
        </p>
      </div>

      {/* payout + items */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-black">{L('آیتم‌های فروخته‌شده', 'Items sold')}</h2>
          <ul className="mt-4 flex flex-col divide-y divide-border/60">
            {order.lines.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/item/${l.id}`}
                  className="size-14 shrink-0 overflow-hidden rounded-xl"
                  style={{ background: `radial-gradient(70% 70% at 50% 45%, ${l.rarity_color}22 0%, transparent 75%), var(--tile)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.image} alt={l.name} className="h-full w-full object-contain p-1.5" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/item/${l.id}`}
                    className="block truncate text-xs font-bold hover:opacity-80"
                    style={{ color: l.rarity_color }}
                  >
                    {l.name}
                  </Link>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {wearLabel(l.wear, locale)} · float {nf(l.float, 4)}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-xs font-black">
                    {primaryPrice(l.price_usd * l.qty, locale)}
                    {locale === 'fa' && <span className="ms-1 text-[9px] font-medium text-muted">تومان</span>}
                  </p>
                  <p className="text-[9px] text-muted">{L('ارزش بازار', 'Market value')}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="flex flex-col gap-4 self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-black">{L('صورت‌حساب فروش', 'Payout summary')}</h2>
            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <dt>{L('ارزش آیتم‌ها', 'Items value')}</dt>
                <dd className="font-bold text-foreground">{primaryPrice(order.total_usd, locale)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>{L('کارمزد VN Shop', 'VN Shop fee')}</dt>
                <dd className="font-bold text-foreground">
                  −{primaryPrice(order.total_usd - order.payout_usd, locale)}
                </dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>{L('نرخ فروش', 'Payout rate')}</dt>
                <dd className="font-bold text-foreground tabular-nums">{nf(order.rate * 100, 1)}%</dd>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                <dt className="text-xs font-bold">
                  {current === 2 ? L('مبلغ واریزشده', 'Amount paid out') : L('مبلغ دریافتی', 'You receive')}
                </dt>
                <dd className="text-end">
                  <p className="text-xl font-black text-accent">
                    {primaryPrice(order.payout_usd, locale)}
                    {locale === 'fa' && <span className="ms-1 text-xs font-medium text-muted">تومان</span>}
                  </p>
                  <p className="text-[10px] text-muted">{secondaryPrice(order.payout_usd, locale)}</p>
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl border border-border bg-background/60 p-3.5">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted">
                <method.Icon className="size-3.5 text-accent" />
                {L('مقصد واریز', 'Payout destination')}
              </p>
              <p dir="ltr" className="mt-1 break-all text-[11px] text-foreground/90">
                {order.payout_target || L('کیف پول داخلی VN Shop', 'VN Shop internal balance')}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <ol className="space-y-2 text-[11px] text-muted">
              {[
                { icon: Zap, label: L('تأیید ترید آفر در استیم', 'Accept the offer in Steam') },
                { icon: BadgeCheck, label: L('بررسی آیتم‌ها توسط ما', 'We verify your items') },
                { icon: Banknote, label: L('واریز به روش انتخابی', 'Payout to your method') },
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
                'ترید آفر تا ۱۵ دقیقه معتبره؛ بعد از اون باید دوباره درخواست بدی.',
                'The trade offer is valid for 15 minutes; after that you need to send it again.'
              )}
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/sell"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-black text-accent-foreground hover:bg-accent-strong transition-colors"
        >
          {L('فروش آیتم‌های بیشتر', 'Sell more items')}
          <Back className="size-3.5" />
        </Link>
        <Link
          href="/market"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-5 text-xs font-bold text-muted hover:border-accent/40 hover:text-foreground transition-colors"
        >
          {L('ادامه خرید', 'Keep shopping')}
        </Link>
      </div>
    </div>
  );
}
