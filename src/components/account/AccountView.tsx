'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Package, TrendingUp, Wallet, ArrowDownToLine, ArrowUpFromLine, LogOut, User,
  ShoppingBag, Coins, ChevronRight, CheckCircle2, Clock, Copy, Check,
} from 'lucide-react';
import {
  clearProfile, DEMO_PROFILE, getProfile, getWalletToman, setProfile, setWalletToman,
  type Order, type Profile, type SellOrder,
} from '@/lib/orders';
import { USD_TO_TOMAN } from '@/data/skins';
import SteamIcon from '@/components/icons/SteamIcon';

const DEMO_WALLET_TOMAN = 12_500_000;

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
    /* clipboard unavailable — the button still shows the copied state briefly */
    done();
  }
}

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem('vn-orders');
    if (!raw) return [];
    const all = JSON.parse(raw) as Order[];
    return Array.isArray(all) ? all : [];
  } catch {
    return [];
  }
}

function readSellOrders(): SellOrder[] {
  try {
    const raw = localStorage.getItem('vn-sell-orders');
    if (!raw) return [];
    const all = JSON.parse(raw) as SellOrder[];
    return Array.isArray(all) ? all : [];
  } catch {
    return [];
  }
}

export default function AccountView() {
  const locale = useLocale();
  const L = (fa: string, en: string) => (locale === 'fa' ? fa : en);
  const nf = (n: number, frac = 0) =>
    new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: frac }).format(n);
  const dt = (ts: number) =>
    new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(ts);

  const [profile, setP] = useState<Profile | null>(null);
  const [wallet, setW] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sells, setSells] = useState<SellOrder[]>([]);
  const [tab, setTab] = useState<'purchases' | 'sales'>('purchases');
  const [copied, setCopied] = useState(false);

  // hydrate everything from localStorage on mount
  useEffect(() => {
    const p = getProfile();
    setP(p);
    const existing = getWalletToman();
    if (!existing) setWalletToman(DEMO_WALLET_TOMAN);
    setW(existing || DEMO_WALLET_TOMAN);
    setOrders(readOrders());
    setSells(readSellOrders());
  }, []);

  const stats = useMemo(() => {
    const bought = orders.reduce((s, o) => s + o.total_usd, 0);
    const sold = sells.reduce((s, o) => s + o.payout_usd, 0);
    return { bought, sold, net: sold - bought };
  }, [orders, sells]);

  const activeBuys = orders.filter((o) => o.step < 3).length;
  const activeSells = sells.filter((s) => s.step < 2).length;

  function copyTradeUrl() {
    if (!profile) return;
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    };
    // navigator.clipboard may be unavailable (insecure context / headless),
    // so fall back to a legacy execCommand copy before giving up silently.
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(profile.tradeUrl).then(done).catch(() => fallbackCopy(profile!.tradeUrl, done));
    } else {
      fallbackCopy(profile.tradeUrl, done);
    }
  }

  /* ---------- signed-out ---------- */
  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-border bg-card">
          <User className="size-6 text-muted" />
        </span>
        <h1 className="mt-5 text-xl font-black">{L('حساب کاربری', 'Your account')}</h1>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {L(
            'با اکانت استیم وارد شو تا سفارش‌ها، فروش‌ها و کیف پولت رو ببینی.',
            'Sign in with Steam to see your orders, sales and wallet.'
          )}
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-start">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#1b2838]">
              <SteamIcon className="size-5 text-white" />
            </span>
            <div>
              <p className="text-sm font-black">{L('ورود با استیم', 'Sign in with Steam')}</p>
              <p className="text-[10px] text-muted">
                {L('فقط برای نمایش پروفایل در نسخه دمو', 'Demo only — just to show the profile')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setProfile(DEMO_PROFILE);
              setP(DEMO_PROFILE);
              if (!getWalletToman()) setWalletToman(DEMO_WALLET_TOMAN);
              setW(DEMO_WALLET_TOMAN);
            }}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1b2838] text-sm font-black text-white transition-colors hover:bg-[#2a475e] cursor-pointer"
          >
            <SteamIcon className="size-4" />
            {L('ورود با استیم', 'Sign in with Steam')}
          </button>
          <p className="mt-3 text-center text-[10px] text-muted">
            {L(
              'اطلاعات واقعی استیم استفاده نمی‌شه — این فقط دموی فاز اول است.',
              'No real Steam data is used — phase-one demo only.'
            )}
          </p>
        </div>
      </div>
    );
  }

  /* ---------- signed-in ---------- */
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* identity */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatar} alt={profile.name} className="size-14 rounded-2xl border border-border object-cover" />
          <div>
            <h1 className="flex items-center gap-2 text-lg font-black">
              {profile.name}
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                <CheckCircle2 className="size-2.5" />
                {L('تأیید شده', 'Verified')}
              </span>
            </h1>
            <p className="mt-1 text-[11px] text-muted" dir="ltr">
              ID: {profile.steamId} · {L('عضویت', 'Joined')} {dt(profile.joinedAt)}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            clearProfile();
            setP(null);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-xs font-bold text-muted transition-colors hover:border-red-500/50 hover:text-red-400 cursor-pointer"
        >
          <LogOut className="size-3.5" />
          {L('خروج', 'Sign out')}
        </button>
      </div>

      {/* stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          Icon={ShoppingBag}
          label={L('کل خریدها', 'Total purchases')}
          value={nf(Math.round(stats.bought * USD_TO_TOMAN))}
          unit={L('تومان', 'Toman')}
        />
        <Card
          Icon={Coins}
          label={L('کل فروش‌ها', 'Total sales')}
          value={nf(Math.round(stats.sold * USD_TO_TOMAN))}
          unit={L('تومان', 'Toman')}
          accent
        />
        <Card
          Icon={TrendingUp}
          label={L('تراز خالص', 'Net flow')}
          value={nf(Math.round(stats.net * USD_TO_TOMAN))}
          unit={L('تومان', 'Toman')}
          hint={stats.net >= 0 ? L('سود خالص', 'Net profit') : L('هزینه خالص', 'Net spend')}
        />
        <Card Icon={Wallet} label={L('موجودی کیف پول', 'Wallet balance')} value={nf(wallet)} unit={L('تومان', 'Toman')}>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                const next = wallet + 1_000_000;
                setWalletToman(next);
                setW(next);
              }}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 text-[10px] font-bold text-accent transition-colors hover:bg-accent/20 cursor-pointer"
            >
              <ArrowDownToLine className="size-3" />
              {L('شارژ', 'Top up')}
            </button>
            <Link
              href="/sell"
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-[10px] font-bold text-muted transition-colors hover:border-accent/40 hover:text-foreground"
            >
              <ArrowUpFromLine className="size-3" />
              {L('نقد کردن', 'Cash out')}
            </Link>
          </div>
        </Card>
      </div>

      {/* trade link */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-background/60">
            <SteamIcon className="size-4 text-accent" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-foreground/90">{L('لینک ترید استیم', 'Steam trade URL')}</p>
            <p dir="ltr" className="mt-0.5 truncate text-[10px] text-muted">
              {profile.tradeUrl || L('تنظیم نشده', 'Not set')}
            </p>
          </div>
        </div>
        <button
          onClick={copyTradeUrl}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border px-3.5 text-[11px] font-bold text-muted transition-colors hover:border-accent/40 hover:text-foreground cursor-pointer"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          {copied ? L('کپی شد', 'Copied') : L('کپی', 'Copy')}
        </button>
      </div>

      {/* activity */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-1 border-b border-border p-2">
          <Tab active={tab === 'purchases'} onClick={() => setTab('purchases')} count={orders.length}>
            <Package className="size-3.5" />
            {L('خریدها', 'Purchases')}
          </Tab>
          <Tab active={tab === 'sales'} onClick={() => setTab('sales')} count={sells.length}>
            <Coins className="size-3.5" />
            {L('فروش‌ها', 'Sales')}
          </Tab>
          <span className="ms-auto px-2 text-[10px] text-muted">
            {tab === 'purchases'
              ? `${nf(activeBuys)} ${L('در حال انجام', 'in progress')}`
              : `${nf(activeSells)} ${L('در حال انجام', 'in progress')}`}
          </span>
        </div>

        {tab === 'purchases' ? (
          orders.length === 0 ? (
            <Empty Icon={Package} title={L('هنوز خریدی نکردی', 'No purchases yet')} cta={L('پیمایش بازار', 'Browse the market')} href="/market" />
          ) : (
            <ul className="divide-y divide-border">
              {orders.map((o) => {
                const done = o.step >= 3;
                return (
                  <li key={o.id}>
                    <Link href={`/order/${o.id}`} className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-card-hover">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-background/60">
                        <Package className="size-4 text-accent" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black" dir="ltr">
                          {nf(o.lines.length)} {L('آیتم', 'items')} · {o.lines[0]?.name ?? '—'}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted">
                          {done ? <CheckCircle2 className="size-3 text-emerald-400" /> : <Clock className="size-3 text-accent" />}
                          <span dir="ltr">{o.id}</span> · {dt(o.created_at)}
                        </p>
                      </div>
                      <div className="hidden shrink-0 text-end sm:block">
                        <p className="text-xs font-black">
                          {nf(o.total_toman)} {L('تومان', 'Toman')}
                        </p>
                        <p className="text-[9px] text-muted">${nf(o.total_usd, 2)}</p>
                      </div>
                      <Pill done={done} label={done ? L('تحویل شد', 'Delivered') : `${nf(o.step + 1)}/۴`} />
                      <Chevron locale={locale} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )
        ) : sells.length === 0 ? (
          <Empty Icon={Coins} title={L('هنوز چیزی نفروختی', 'No sales yet')} cta={L('فروش آیتم‌ها', 'Sell your items')} href="/sell" />
        ) : (
          <ul className="divide-y divide-border">
            {sells.map((s) => {
              const done = s.step >= 2;
              return (
                <li key={s.id}>
                  <Link href={`/sell-order/${s.id}`} className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-card-hover">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-background/60">
                      <Coins className="size-4 text-accent" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black" dir="ltr">
                        {nf(s.lines.length)} {L('آیتم', 'items')} · {s.lines[0]?.name ?? '—'}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted">
                        {done ? <CheckCircle2 className="size-3 text-emerald-400" /> : <Clock className="size-3 text-accent" />}
                        <span dir="ltr">{s.id}</span> · {dt(s.created_at)}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-end sm:block">
                      <p className="text-xs font-black text-accent">
                        {nf(Math.round(s.payout_usd * USD_TO_TOMAN))} {L('تومان', 'Toman')}
                      </p>
                      <p className="text-[9px] text-muted">
                        {L('دریافتی', 'payout')} · {nf(s.rate * 100, 1)}%
                      </p>
                    </div>
                    <Pill done={done} label={done ? L('پرداخت شد', 'Paid out') : `${nf(s.step + 1)}/۳`} />
                    <Chevron locale={locale} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Chevron({ locale }: { locale: string }) {
  return <ChevronRight className={`size-4 shrink-0 text-muted ${locale === 'fa' ? 'rotate-180' : ''}`} />;
}

function Pill({ done, label }: { done: boolean; label: string }) {
  if (done) {
    return (
      <span className="hidden shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-300 sm:inline-flex">
        {label}
      </span>
    );
  }
  return (
    <span className="hidden shrink-0 items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[9px] font-bold text-accent sm:inline-flex">
      <Clock className="size-2.5" />
      {label}
    </span>
  );
}

function Card({
  Icon,
  label,
  value,
  unit,
  hint,
  accent,
  children,
}: {
  Icon: typeof Package;
  label: string;
  value: string;
  unit: string;
  hint?: string;
  accent?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon className={`size-4 ${accent ? 'text-accent' : 'text-muted'}`} />
        <span className="text-[11px] font-bold text-muted">{label}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`text-2xl font-black tabular-nums ${accent ? 'text-accent' : 'text-foreground'}`}>{value}</span>
        <span className="text-[10px] font-medium text-muted">{unit}</span>
      </div>
      {hint && <p className="mt-1 text-[10px] text-muted">{hint}</p>}
      {children}
    </div>
  );
}

function Tab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-bold transition-colors cursor-pointer ${
        active ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-card-hover hover:text-foreground'
      }`}
    >
      {children}
      <span className="rounded-full bg-background/80 px-1.5 text-[9px] tabular-nums">{count}</span>
    </button>
  );
}

function Empty({ Icon, title, cta, href }: { Icon: typeof Package; title: string; cta: string; href: string }) {
  return (
    <div className="p-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-border bg-background/60">
        <Icon className="size-4 text-muted" />
      </span>
      <p className="mt-3 text-sm font-bold text-foreground/90">{title}</p>
      <Link
        href={href}
        className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 text-[11px] font-bold text-accent transition-colors hover:bg-accent/20"
      >
        {cta}
        <ChevronRight className="size-3.5" />
      </Link>
    </div>
  );
}
