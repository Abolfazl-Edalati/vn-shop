'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import {
  CreditCard, Bitcoin, Wallet, Lock, ShieldCheck, ArrowLeft, ArrowRight,
  Check, AlertCircle, BadgeCheck, Send, Banknote,
} from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { primaryPrice, secondaryPrice } from '@/data/skins';
import { wearLabel } from '@/components/skins/SkinCard';
import { newOrderId, saveOrder, type PaymentMethod } from '@/lib/orders';

const METHODS: { key: PaymentMethod; fa: string; en: string; noteFa: string; noteEn: string; Icon: typeof CreditCard }[] = [
  { key: 'card', fa: 'کارت بانکی (شتاب)', en: 'Bank card (Shetab)', noteFa: 'انتقال به درگاه امن', noteEn: 'Redirect to secure gateway', Icon: CreditCard },
  { key: 'crypto', fa: 'ارز دیجیتال (USDT)', en: 'Crypto (USDT)', noteFa: 'TRC-20 · تأیید شبکه', noteEn: 'TRC-20 · network confirmation', Icon: Bitcoin },
  { key: 'wallet', fa: 'کیف پول VN Shop', en: 'VN Shop wallet', noteFa: 'پرداخت با موجودی', noteEn: 'Pay from your balance', Icon: Wallet },
];

export default function CheckoutView() {
  const locale = useLocale();
  const router = useRouter();
  const cart = useCart();
  const L = (fa: string, en: string) => (locale === 'fa' ? fa : en);
  const nf = (n: number) => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(n);
  const Back = locale === 'fa' ? ArrowRight : ArrowLeft;

  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [tradeUrl, setTradeUrl] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  // prefill from a previous order (convenience)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('vn-orders');
      if (!raw) return;
      const all = JSON.parse(raw) as { trade_url?: string; email?: string }[];
      if (all[0]?.trade_url) setTradeUrl(all[0].trade_url);
      if (all[0]?.email) setEmail(all[0].email);
    } catch {}
  }, []);

  const tradeUrlValid = /^https?:\/\/steamcommunity\.com\/tradeoffer\/new\/?\?partner=\d+/.test(tradeUrl.trim());

  function placeOrder() {
    setError(null);
    if (!tradeUrlValid) {
      setError(L('لینک ترید استیم معتبر نیست (نمونه: steamcommunity.com/tradeoffer/new/?partner=123456789)', 'Invalid Steam trade link (e.g. steamcommunity.com/tradeoffer/new/?partner=123456789)'));
      return;
    }
    if (!agreed) {
      setError(L('برای ادامه باید شرایط اسکرو را تأیید کنی.', 'You must accept the escrow terms to continue.'));
      return;
    }
    setPlacing(true);
    const id = newOrderId();
    saveOrder({
      id,
      created_at: Date.now(),
      lines: cart.items.map(({ skin, qty }) => ({
        id: skin.id,
        name: skin.market_hash_name,
        image: skin.image,
        rarity_color: skin.rarity_color,
        wear: skin.wear,
        float: skin.float,
        qty,
        price_usd: skin.price_usd,
      })),
      total_usd: cart.totalUsd,
      total_toman: cart.totalToman,
      payment,
      trade_url: tradeUrl.trim(),
      email: email.trim(),
      step: 1, // paid → funds in escrow
    });
    cart.clear();
    router.push(`/order/${id}`);
  }

  if (cart.ready && cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-lg font-black">{L('چیزی برای پرداخت نیست', 'Nothing to pay for')}</h1>
        <p className="mt-1 text-xs text-muted">{L('سبد خریدت خالیه.', 'Your cart is empty.')}</p>
        <Link href="/market" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-black text-accent-foreground">
          {L('رفتن به بازار', 'Browse market')}
          <Back className="size-3.5" />
        </Link>
      </div>
    );
  }

  const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2.5 text-sm font-black">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-black text-accent-foreground">{nf(n)}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">{L('تسویه حساب', 'Checkout')}</h1>
          <p className="mt-1 text-xs text-muted">
            {nf(cart.count)} {L('آیتم', 'items')} · {L('پرداخت امن با اسکرو', 'Secure escrow payment')}
          </p>
        </div>
        <Link href="/cart" className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3.5 text-xs font-bold text-muted hover:border-accent/40 hover:text-foreground transition-colors">
          <Back className="size-3.5" />
          {L('بازگشت به سبد', 'Back to cart')}
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          {/* 1 — delivery */}
          <Step n={1} title={L('اطلاعات تحویل', 'Delivery details')}>
            <label className="block">
              <span className="text-xs font-bold text-foreground/90">
                {L('لینک ترید استیم', 'Steam trade link')} <span className="text-red-400">*</span>
              </span>
              <input
                value={tradeUrl}
                onChange={(e) => setTradeUrl(e.target.value)}
                dir="ltr"
                placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
                className={`mt-2 h-11 w-full rounded-xl border bg-background/60 px-3.5 text-xs text-foreground placeholder:text-muted/60 outline-none transition-colors ${
                  tradeUrl && !tradeUrlValid ? 'border-red-500/60' : 'border-border focus:border-accent/50'
                }`}
              />
              <span className="mt-1.5 block text-[10px] text-muted">
                {L('اسکین‌ها بعد از تأیید پرداخت، به همین اکانت تحویل داده می‌شن.', 'Skins are delivered to this account once payment is confirmed.')}
              </span>
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-bold text-foreground/90">{L('ایمیل (اختیاری)', 'Email (optional)')}</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                type="email"
                placeholder="you@example.com"
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background/60 px-3.5 text-xs text-foreground placeholder:text-muted/60 outline-none focus:border-accent/50 transition-colors"
              />
            </label>
          </Step>

          {/* 2 — payment */}
          <Step n={2} title={L('روش پرداخت', 'Payment method')}>
            <div className="grid gap-2 sm:grid-cols-3">
              {METHODS.map((m) => {
                const active = payment === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setPayment(m.key)}
                    className={`flex flex-col items-start gap-2 rounded-xl border p-3.5 text-start transition-colors cursor-pointer ${
                      active ? 'border-accent bg-accent/10' : 'border-border bg-background/60 hover:border-accent/40'
                    }`}
                  >
                    <span className="flex w-full items-center justify-between">
                      <m.Icon className={`size-4 ${active ? 'text-accent' : 'text-muted'}`} />
                      <span className={`grid size-4 place-items-center rounded-full border ${active ? 'border-accent bg-accent' : 'border-border'}`}>
                        {active && <Check className="size-2.5 text-accent-foreground" />}
                      </span>
                    </span>
                    <span className={`text-xs font-bold ${active ? 'text-accent' : 'text-foreground/90'}`}>{L(m.fa, m.en)}</span>
                    <span className="text-[10px] text-muted">{L(m.noteFa, m.noteEn)}</span>
                  </button>
                );
              })}
            </div>
          </Step>

          {/* 3 — review */}
          <Step n={3} title={L('بازبینی سفارش', 'Review order')}>
            <ul className="flex flex-col divide-y divide-border/60">
              {cart.items.map(({ skin, qty }) => (
                <li key={skin.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="size-12 shrink-0 overflow-hidden rounded-lg" style={{ background: `radial-gradient(70% 70% at 50% 45%, ${skin.rarity_color}22 0%, transparent 75%), var(--tile)` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={skin.image} alt={skin.market_hash_name} className="h-full w-full object-contain p-1" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold" style={{ color: skin.rarity_color }}>{skin.market_hash_name}</span>
                    <span className="block text-[10px] text-muted">
                      {wearLabel(skin.wear, locale)} · float {nf(skin.float)}
                      {qty > 1 && <> · ×{nf(qty)}</>}
                    </span>
                  </span>
                  <span className="shrink-0 text-end text-xs font-bold">{primaryPrice(skin.price_usd * qty, locale)}</span>
                </li>
              ))}
            </ul>

            <label className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-background/60 p-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--accent)] cursor-pointer"
              />
              <span className="text-[11px] leading-relaxed text-muted">
                {L(
                  'می‌پذیرم مبلغ تا تأیید تحویل آیتم در اسکرو VN Shop نگه داشته می‌شه و در صورت عدم تحویل، کامل بازگردانده می‌شه.',
                  'I accept that the amount is held in VN Shop escrow until delivery is confirmed and fully refunded if delivery fails.'
                )}
              </span>
            </label>

            {error && (
              <p className="mt-3 inline-flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-[11px] text-red-300">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                {error}
              </p>
            )}
          </Step>
        </div>

        {/* summary */}
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-black">{L('پرداخت', 'Payment')}</h2>
            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <dt>{L('جمع آیتم‌ها', 'Subtotal')}</dt>
                <dd className="font-bold text-foreground">{primaryPrice(cart.totalUsd, locale)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>{L('کارمزد سرویس', 'Service fee')}</dt>
                <dd className="font-bold text-emerald-400">{L('رایگان', 'Free')}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>{L('روش پرداخت', 'Method')}</dt>
                <dd className="font-bold text-foreground">{L(METHODS.find((m) => m.key === payment)!.fa, METHODS.find((m) => m.key === payment)!.en)}</dd>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                <dt className="text-xs font-bold">{L('مبلغ قابل پرداخت', 'Total')}</dt>
                <dd className="text-end">
                  <p className="text-xl font-black">
                    {primaryPrice(cart.totalUsd, locale)}
                    {locale === 'fa' && <span className="ms-1 text-xs font-medium text-muted">تومان</span>}
                  </p>
                  <p className="text-[10px] text-muted">{secondaryPrice(cart.totalUsd, locale)}</p>
                </dd>
              </div>
            </dl>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-black text-accent-foreground transition-colors hover:bg-accent-strong disabled:opacity-60 cursor-pointer"
            >
              <Lock className="size-4" />
              {placing ? L('در حال ثبت…', 'Placing…') : L('پرداخت و ثبت سفارش', 'Pay & place order')}
            </button>

            <p className="mt-3 inline-flex items-start gap-1.5 text-[10px] text-muted">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" />
              {L('پولت تا تحویل آیتم پیش ما در اسکرو می‌مونه — بدون ریسک.', 'Your money sits in escrow until the item is delivered — zero risk.')}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <ol className="space-y-2 text-[11px] text-muted">
              {[
                { icon: Lock, label: L('پرداخت در اسکرو', 'Funds held in escrow') },
                { icon: BadgeCheck, label: L('بررسی و تأیید آیتم', 'Item verified') },
                { icon: Send, label: L('تحویل به اکانت استیم', 'Delivered to your Steam') },
                { icon: Banknote, label: L('آزادسازی پرداخت', 'Payment released') },
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <s.icon className="size-3.5 shrink-0 text-accent" />
                  {s.label}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
