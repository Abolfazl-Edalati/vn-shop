'use client';

// Account page — real Steam session + Prisma-backed orders/wallet.

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Package, TrendingUp, Wallet, ArrowDownToLine, LogOut, ShoppingBag, Coins,
  ChevronRight, CheckCircle2, Clock, Copy, Check,
} from 'lucide-react';
import { useSession } from '@/components/session/SessionProvider';
import { USD_TO_TOMAN } from '@/data/skins';
import SteamIcon from '@/components/icons/SteamIcon';

interface OrderRow {
  id: string;
  createdAt: string;
  status: string;
  escrowStep: number;
  paymentMethod: string;
  totalUsd: string;
  totalToman: string;
  itemCount: number;
  firstItem: string | null;
}
interface SellRow {
  id: string;
  createdAt: string;
  step: number;
  payoutMethod: string;
  payoutUsd: string;
  payoutToman: string;
  itemCount: number;
  firstItem: string | null;
}

function fallbackCopy(text: string, done: () => void) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    done();
  } catch {
    /* clipboard unavailable — still fire the feedback so the UX is not silent */
    done();
  }
}

export default function AccountView() {
  const locale = useLocale();
  const L = (fa: string, en: string) => (locale === 'fa' ? fa : en);
  const { user, loading, signOut, refresh } = useSession();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [sells, setSells] = useState<SellRow[]>([]);
  const [tab, setTab] = useState<'purchases' | 'sales'>('purchases');
  const [copied, setCopied] = useState(false);
  const [tradeUrlInput, setTradeUrlInput] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);
  const [toppingUp, setToppingUp] = useState(false);

  const dt = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    }).format(new Date(iso));

  const nf = (n: number) => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(n);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setOrders(data.orders ?? []);
        setSells(data.sellOrders ?? []);
      } catch {
        /* keep empty lists on network failure */
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (user?.tradeUrl) setTradeUrlInput(user.tradeUrl);
  }, [user?.tradeUrl]);

  const walletToman = user ? Number(user.wallet) : 0;
  const totalPurchases = orders.length;
  const totalSales = sells.length;
  const netUsd =
    orders.reduce((s, o) => s + Number(o.totalUsd), 0) -
    sells.reduce((s, o) => s + Number(o.payoutUsd), 0);

  /* ---------- loading skeleton ---------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-card" />
        <div className="mx-auto mt-6 h-5 w-48 animate-pulse rounded bg-card" />
        <div className="mx-auto mt-3 h-3 w-64 animate-pulse rounded bg-card" />
      </div>
    );
  }

  /* ---------- signed out ---------- */
  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-accent/10">
            <SteamIcon className="size-7 text-accent" />
          </div>
          <h1 className="mt-5 text-lg font-black">
            {L('وارد شوید', 'Sign in')}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {L(
              'برای دیدن خریدها، فروش‌ها و کیف پول باید با استیم وارد بشی.',
              'Sign in with Steam to see your purchases, sales and wallet.',
            )}
          </p>
          <a
            href="/api/auth/steam"
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1b2838] text-sm font-black text-white transition-colors hover:bg-[#2a475e]"
          >
            <SteamIcon className="size-4" />
            {L('ورود با استیم', 'Sign in with Steam')}
          </a>
        </div>
      </div>
    );
  }

  /* ---------- signed in ---------- */
  const saveTradeUrl = async () => {
    setSavingUrl(true);
    try {
      const res = await fetch('/api/account/trade-url', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeUrl: tradeUrlInput.trim() }),
      });
      if (res.ok) await refresh();
    } catch {
      /* ignore — the input still holds the value */
    } finally {
      setSavingUrl(false);
    }
  };

  const topUp = async () => {
    setToppingUp(true);
    try {
      const res = await fetch('/api/wallet/topup', { method: 'POST' });
      if (res.ok) await refresh();
    } catch {
      /* ignore */
    } finally {
      setToppingUp(false);
    }
  };

  const stats = [
    { icon: ShoppingBag, label: L('خریدها', 'Purchases'), value: nf(totalPurchases) },
    { icon: Coins, label: L('فروش‌ها', 'Sales'), value: nf(totalSales) },
    {
      icon: TrendingUp, label: L('تراز خالص', 'Net balance'),
      value: `${netUsd >= 0 ? '+' : '−'}${nf(Math.abs(Math.round(netUsd)))}$`,
      tone: netUsd >= 0 ? 'up' : 'down',
    },
    {
      icon: Wallet, label: L('موجودی کیف پول', 'Wallet'),
      value: `${nf(walletToman)} ${L('تومان', 'Toman')}`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* identity */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="size-14 rounded-2xl border border-border object-cover" />
          ) : (
            <span className="grid size-14 place-items-center rounded-2xl border border-border bg-accent/10 text-lg font-black text-accent">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="flex items-center gap-2 text-lg font-black">
              {user.name}
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500">
                <CheckCircle2 className="size-2.5" />
                {L('تأیید شده', 'Verified')}
              </span>
            </h1>
            <p className="mt-1 text-[11px] text-muted" dir="ltr">
              ID: {user.steamId} · {L('عضویت', 'Joined')} {dt(user.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-xs font-bold text-muted transition-colors hover:border-red-500/40 hover:text-red-500 cursor-pointer"
        >
          <LogOut className="size-4" />
          {L('خروج', 'Sign out')}
        </button>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted">
              <s.icon className="size-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="mt-2 text-base font-black tabular-nums" dir="ltr">{s.value}</p>
          </div>
        ))}
      </div>

      {/* trade url */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">{L('لینک ترید استیم', 'Steam trade URL')}</h2>
            <p className="mt-1 text-[10px] text-muted">
              {L('برای تحویل آیتم‌ها لازمه', 'Required so we can deliver your items')}
            </p>
          </div>
          <button
            onClick={() => fallbackCopy(tradeUrlInput, () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            })}
            disabled={!tradeUrlInput}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-[10px] font-bold text-muted transition-colors hover:text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            {copied ? L('کپی شد', 'Copied') : L('کپی', 'Copy')}
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={tradeUrlInput}
            onChange={(e) => setTradeUrlInput(e.target.value)}
            dir="ltr"
            placeholder="https://steamcommunity.com/tradeoffer/new/?partner=…"
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none"
          />
          <button
            onClick={saveTradeUrl}
            disabled={savingUrl || !tradeUrlInput.trim()}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-accent px-5 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent-strong disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            {savingUrl ? L('ذخیره…', 'Saving…') : L('ذخیره', 'Save')}
          </button>
        </div>
      </div>

      {/* wallet actions */}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={topUp}
          disabled={toppingUp}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-bold transition-colors hover:border-accent/40 cursor-pointer"
        >
          <ArrowDownToLine className="size-4" />
          {toppingUp ? '…' : L('شارژ کیف پول (دمو)', 'Top up wallet (demo)')}
        </button>
        <Link
          href="/sell"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-bold transition-colors hover:border-accent/40 cursor-pointer"
        >
          <Package className="size-4" />
          {L('فروش اسکین به ما', 'Sell skins to us')}
        </Link>
      </div>

      {/* history */}
      <div className="mt-8">
        <div className="flex items-center gap-2 border-b border-border">
          {(['purchases', 'sales'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`-mb-px border-b-2 px-4 py-3 text-xs font-bold transition-colors cursor-pointer ${
                tab === k
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {k === 'purchases' ? L('خریدها', 'Purchases') : L('فروش‌ها', 'Sales')}
              <span className="ms-1.5 rounded-full bg-card px-1.5 py-0.5 text-[9px] text-muted">
                {k === 'purchases' ? nf(totalPurchases) : nf(totalSales)}
              </span>
            </button>
          ))}
        </div>

        {tab === 'purchases' ? (
          orders.length === 0 ? (
            <Empty
              icon={ShoppingBag}
              title={L('هنوز خریدی نداشتی', 'No purchases yet')}
              cta={L('رفتن به بازار', 'Browse the market')}
              href="/market"
            />
          ) : (
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/order/${o.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors hover:bg-card/50 px-2 -mx-2 rounded-lg cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {o.firstItem ?? L('سفارش', 'Order')}
                        {o.itemCount > 1 && <span className="text-muted"> +{nf(o.itemCount - 1)}</span>}
                      </p>
                      <p className="mt-1 text-[10px] text-muted" dir="ltr">
                        {o.id} · {dt(o.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill kind="order" step={o.escrowStep} status={o.status} L={L} />
                      <b className="text-sm tabular-nums" dir="ltr">
                        {nf(Math.round(Number(o.totalUsd)))}$
                      </b>
                      <ChevronRight className="size-4 rotate-180 text-muted rtl:rotate-0" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : sells.length === 0 ? (
          <Empty
            icon={Coins}
            title={L('هنوز فروشی نداشتی', 'No sales yet')}
            cta={L('فروش اسکین به ما', 'Sell skins to us')}
            href="/sell"
          />
        ) : (
          <ul className="divide-y divide-border">
            {sells.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/sell-order/${o.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors hover:bg-card/50 px-2 -mx-2 rounded-lg cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {o.firstItem ?? L('فروش', 'Sale')}
                      {o.itemCount > 1 && <span className="text-muted"> +{nf(o.itemCount - 1)}</span>}
                    </p>
                    <p className="mt-1 text-[10px] text-muted" dir="ltr">
                      {o.id} · {dt(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill kind="sell" step={o.step} status="" L={L} />
                    <b className="text-sm tabular-nums" dir="ltr">
                      {nf(Math.round(Number(o.payoutUsd)))}$
                    </b>
                    <ChevronRight className="size-4 rotate-180 text-muted rtl:rotate-0" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Empty({
  icon: Icon, title, cta, href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; cta: string; href: string;
}) {
  return (
    <div className="py-16 text-center">
      <Icon className="mx-auto size-8 text-muted" />
      <p className="mt-3 text-sm font-bold">{title}</p>
      <Link
        href={href}
        className="mt-4 inline-flex h-9 items-center rounded-lg bg-accent px-4 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent-strong cursor-pointer"
      >
        {cta}
      </Link>
    </div>
  );
}

function StatusPill({
  kind, step, status, L,
}: {
  kind: 'order' | 'sell';
  step: number;
  status: string;
  L: (fa: string, en: string) => string;
}) {
  const done = kind === 'order' ? status === 'COMPLETED' || step >= 3 : step >= 2;
  const inProgress = !done && step > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
        done
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
          : inProgress
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
            : 'border-border bg-card text-muted'
      }`}
    >
      {done ? <CheckCircle2 className="size-2.5" /> : <Clock className="size-2.5" />}
      {done
        ? L('تحویل شد', 'Delivered')
        : inProgress
          ? L('در حال انجام', 'In progress')
          : L('در انتظار', 'Pending')}
    </span>
  );
}
