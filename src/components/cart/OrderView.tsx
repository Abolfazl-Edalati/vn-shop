'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  CheckCircle2, Lock, BadgeCheck, Send, Banknote, ShieldCheck, Package,
  Clock, ArrowLeft, ArrowRight, Copy, Check, CreditCard, Bitcoin, Wallet,
} from 'lucide-react';
import { primaryPrice, secondaryPrice } from '@/data/skins';
import { wearLabel } from '@/components/skins/SkinCard';
import { getOrder, updateOrderStep, type Order } from '@/lib/orders';

const METHOD_LABEL: Record<string, { fa: string; en: string; Icon: typeof CreditCard }> = {
  card: { fa: 'کارت بانکی (شتاب)', en: 'Bank card (Shetab)', Icon: CreditCard },
  crypto: { fa: 'ارز دیجیتال (USDT)', en: 'Crypto (USDT)', Icon: Bitcoin },
  wallet: { fa: 'کیف پول VN Shop', en: 'VN Shop wallet', Icon: Wallet },
};

export default function OrderView({ id }: { id: string }) {
  const locale = useLocale();
  const L = (fa: string, en: string) => (locale === 'fa' ? fa : en);
  const nf = (n: number, frac = 0) =>
    new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: frac }).format(n);
  const Back = locale === 'fa' ? ArrowRight : ArrowLeft;

  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrder(getOrder(id) ?? null);
  }, [id]);

  // loading / not found
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
        <h1 className="text-lg font-black">{L('سفارش پیدا نشد', 'Order not found')}</h1>
        <p className="mt-1 text-xs text-muted">
          {L('این سفارش روی این مرورگر ذخیره نشده است.', 'This order is not stored in this browser.')}
        </p>
        <Link href="/market" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-black text-accent-foreground">
          {L('رفتن به بازار', 'Browse market')}
          <Back className="size-3.5" />
        </Link>
      </div>
    );
  }

  const STEPS = [
    { icon: Lock, title: L('پرداخت انجام شد', 'Payment received'), note: L('مبلغ در اسکرو VN Shop نگه داشته شد', 'Amount held in VN Shop escrow') },
    { icon: BadgeCheck, title: L('بررسی و تأیید آیتم', 'Item verified'), note: L('فلوت و اصالت اسکین چک شد', 'Float and authenticity checked') },
    { icon: Send, title: L('تحویل به اکانت استیم', 'Delivered to your Steam'), note: L('ترید آفر به اکانتت ارسال شد', 'Trade offer sent to your account') },
    { icon: Banknote, title: L('پرداخت آزاد شد', 'Payment released'), note: L('تراکنش کامل شد', 'Transaction complete') },
  ];

  const current = order.step;
  const method = METHOD_LABEL[order.payment];

  function copyId() {
    navigator.clipboard?.writeText(order!.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }).catch(() => {});
  }

  function advance() {
    const next = Math.min(3, current + 1);
    const updated = updateOrderStep(order!.id, next);
    if (updated) setOrder(updated);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* header */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-500/15">
              <CheckCircle2 className="size-5 text-emerald-400" />
            </span>
            <div>
              <h1 className="text-lg font-black">{L('سفارش ثبت شد', 'Order placed')}</h1>
              <p className="mt-1 text-xs text-muted">
                {L('پرداختت با موفقیت در اسکرو نگه داشته شد. آیتم‌ها به‌زودی تحویل داده می‌شن.', 'Your payment is safely in escrow. Items will be delivered shortly.')}
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
            {new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(order.created_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <method.Icon className="size-3.5 text-accent" />
            {L(method.fa, method.en)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Package className="size-3.5 text-accent" />
            {nf(order.lines.reduce((n, l) => n + l.qty, 0))} {L('آیتم', 'items')}
          </span>
        </div>
      </div>

      {/* escrow timeline */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="inline-flex items-center gap-2 text-sm font-black">
          <ShieldCheck className="size-4 text-accent" />
          {L('وضعیت اسکرو', 'Escrow status')}
        </h2>

        <ol className="mt-5 grid gap-4 sm:grid-cols-4">
          {STEPS.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={i} className="relative">
                {/* connector */}
                {i < STEPS.length - 1 && (
                  <span
                    className={`absolute top-5 hidden h-0.5 w-full sm:block ${
                      i < current ? 'bg-accent' : 'bg-border'
                    }`}
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
                  <p className={`mt-2.5 text-[11px] font-bold ${done || active ? 'text-foreground' : 'text-muted'}`}>{s.title}</p>
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

        {current < 3 && (
          <button
            onClick={advance}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-accent/50 bg-accent/10 text-xs font-black text-accent transition-colors hover:bg-accent/20 cursor-pointer"
          >
            <Send className="size-3.5" />
            {current === 1
              ? L('آیتم رو دریافت کردم — ادامه', "I received the item — continue")
              : L('مرحله بعدی', 'Next step')}
          </button>
        )}

        {current === 3 && (
          <p className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 text-xs font-bold text-emerald-300">
            <CheckCircle2 className="size-4" />
            {L('سفارش کامل شد — پرداخت آزاد شد', 'Order complete — payment released')}
          </p>
        )}

        <p className="mt-4 text-[10px] leading-relaxed text-muted">
          {L(
            'این یک فلو نمایشی است؛ در نسخه نهایی، هر مرحله با داده واقعی استیم و درگاه پرداخت آپدیت می‌شه.',
            'This is a demo flow; in the final version each step updates from real Steam and payment-gateway data.'
          )}
        </p>
      </div>

      {/* items */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-black">{L('آیتم‌های سفارش', 'Order items')}</h2>
        <ul className="mt-4 flex flex-col divide-y divide-border/60">
          {order.lines.map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Link href={`/item/${l.id}`} className="size-14 shrink-0 overflow-hidden rounded-xl" style={{ background: `radial-gradient(70% 70% at 50% 45%, ${l.rarity_color}22 0%, transparent 75%), var(--tile)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.image} alt={l.name} className="h-full w-full object-contain p-1.5" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/item/${l.id}`} className="block truncate text-xs font-bold hover:opacity-80" style={{ color: l.rarity_color }}>
                  {l.name}
                </Link>
                <p className="mt-0.5 text-[10px] text-muted">
                  {wearLabel(l.wear, locale)} · float {nf(l.float, 4)}
                  {l.qty > 1 && <> · ×{nf(l.qty)}</>}
                </p>
              </div>
              <div className="shrink-0 text-end">
                <p className="text-xs font-black">
                  {primaryPrice(l.price_usd * l.qty, locale)}
                  {locale === 'fa' && <span className="ms-1 text-[9px] font-medium text-muted">تومان</span>}
                </p>
                <p className="text-[9px] text-muted">{secondaryPrice(l.price_usd * l.qty, locale)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-xs font-bold">{L('مبلغ پرداخت‌شده', 'Amount paid')}</span>
          <span className="text-end">
            <span className="block text-lg font-black">
              {primaryPrice(order.total_usd, locale)}
              {locale === 'fa' && <span className="ms-1 text-xs font-medium text-muted">تومان</span>}
            </span>
            <span className="block text-[10px] text-muted">{secondaryPrice(order.total_usd, locale)}</span>
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-background/60 p-3.5">
          <p className="text-[10px] font-bold text-muted">{L('تحویل به', 'Delivering to')}</p>
          <p dir="ltr" className="mt-1 break-all text-[11px] text-foreground/90">{order.trade_url}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/market" className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-black text-accent-foreground hover:bg-accent-strong transition-colors">
          <Back className="size-3.5" />
          {L('ادامه خرید', 'Keep shopping')}
        </Link>
        <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-5 text-xs font-bold text-muted hover:border-accent/40 hover:text-foreground transition-colors">
          {L('صفحه اصلی', 'Home')}
        </Link>
      </div>
    </div>
  );
}
