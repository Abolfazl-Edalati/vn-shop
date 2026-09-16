'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, ArrowRight, ShieldCheck, Lock, BadgeCheck, Send, Banknote } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { primaryPrice, secondaryPrice } from '@/data/skins';
import { wearLabel } from '@/components/skins/SkinCard';

export default function CartView() {
  const locale = useLocale();
  const cart = useCart();
  const L = (fa: string, en: string) => (locale === 'fa' ? fa : en);
  const nf = (n: number) => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(n);
  const Back = locale === 'fa' ? ArrowRight : ArrowLeft;

  if (!cart.ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-muted sm:px-6">
        {L('در حال بارگذاری…', 'Loading…')}
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-border bg-card">
          <ShoppingCart className="size-6 text-muted" />
        </span>
        <h1 className="mt-4 text-lg font-black">{L('سبد خرید خالی است', 'Your cart is empty')}</h1>
        <p className="mt-1 text-xs text-muted">
          {L('از بازار، اسکینی که می‌خوای رو اضافه کن.', 'Add a skin from the market to get started.')}
        </p>
        <Link
          href="/market"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-black text-accent-foreground hover:bg-accent-strong transition-colors"
        >
          {L('رفتن به بازار', 'Browse market')}
          <Back className="size-3.5" />
        </Link>
      </div>
    );
  }

  const fee = 0;
  const totalToman = cart.totalToman;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-xl font-black">{L('سبد خرید', 'Your cart')}</h1>
      <p className="mt-1 text-xs text-muted">
        {nf(cart.count)} {L('آیتم', 'items')}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* lines */}
        <ul className="flex flex-col gap-3">
          {cart.items.map(({ skin, qty }) => (
            <li key={skin.id} className="flex gap-4 rounded-2xl border border-border bg-card p-3">
              <Link href={`/item/${skin.id}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl" style={{ background: `radial-gradient(70% 70% at 50% 45%, ${skin.rarity_color}22 0%, transparent 75%), var(--tile)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={skin.image} alt={skin.market_hash_name} className="h-full w-full object-contain p-1.5" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/item/${skin.id}`} className="truncate text-sm font-bold hover:text-accent" style={{ color: skin.rarity_color }}>
                  {skin.market_hash_name}
                </Link>
                <p className="mt-0.5 text-[11px] text-muted">
                  {wearLabel(skin.wear, locale)} · float {nf(skin.float)}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/60">
                    <button
                      onClick={() => cart.setQty(skin.id, qty - 1)}
                      className="grid size-7 place-items-center text-muted hover:text-foreground cursor-pointer"
                      aria-label={L('کاهش', 'Decrease')}
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="min-w-6 text-center text-xs font-bold tabular-nums">{nf(qty)}</span>
                    <button
                      onClick={() => cart.setQty(skin.id, qty + 1)}
                      className="grid size-7 place-items-center text-muted hover:text-foreground cursor-pointer"
                      aria-label={L('افزایش', 'Increase')}
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <div className="text-end">
                    <p className="text-sm font-black">
                      {primaryPrice(skin.price_usd * qty, locale)}
                      {locale === 'fa' && <span className="ms-1 text-[10px] font-medium text-muted">تومان</span>}
                    </p>
                    <p className="text-[10px] text-muted">{secondaryPrice(skin.price_usd * qty, locale)}</p>
                  </div>

                  <button
                    onClick={() => cart.remove(skin.id)}
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-border text-muted hover:border-red-500/50 hover:text-red-400 cursor-pointer"
                    aria-label={L('حذف', 'Remove')}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* summary */}
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-black">{L('خلاصه سفارش', 'Order summary')}</h2>

            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <dt>{L('جمع آیتم‌ها', 'Subtotal')}</dt>
                <dd className="font-bold text-foreground">{primaryPrice(cart.totalUsd, locale)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>{L('کارمزد سرویس', 'Service fee')}</dt>
                <dd className="font-bold text-emerald-400">{L('رایگان', 'Free')}</dd>
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

            <Link
              href="/checkout"
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-black text-accent-foreground transition-colors hover:bg-accent-strong"
            >
              <Lock className="size-4" />
              {L('ادامه و پرداخت', 'Continue to payment')}
            </Link>

            <Link
              href="/market"
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-xs font-bold text-muted hover:border-accent/40 hover:text-foreground transition-colors"
            >
              <Back className="size-3.5" />
              {L('ادامه خرید', 'Keep shopping')}
            </Link>
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
            <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-muted">
              <ShieldCheck className="size-3.5 text-accent" />
              {L('تا تأیید تحویل، پول پیش ما امن می‌مونه', 'Your money stays protected until delivery is confirmed')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
