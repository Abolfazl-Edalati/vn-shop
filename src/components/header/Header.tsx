'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, Bell, Sun, Moon, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import SteamIcon from '@/components/icons/SteamIcon';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-black">
            VN
          </span>
          <span className="text-sm font-bold tracking-tight">shop</span>
        </Link>

        {/* Main nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/market">{t('buy')}</NavLink>
          <NavLink href="/sell" soon>{t('sell')}</NavLink>
          <NavLink href="/trade" soon>{t('trade')}</NavLink>
          <NavLink href="/market-data" soon>{t('marketData')}</NavLink>
        </nav>

        {/* Search */}
        <div className="relative hidden flex-1 max-w-md lg:block">
          <Search className="absolute inset-y-0 start-3.5 my-auto size-4 text-muted" />
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            className="h-9 w-full rounded-lg border border-border bg-card ps-10 pe-14 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none transition-colors"
          />
          <kbd className="absolute inset-y-0 end-3 my-auto flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] text-muted">
            {locale === 'fa' ? 'Ctrl K' : '⌘ K'}
          </kbd>
        </div>

        {/* Right side */}
        <div className="ms-auto flex items-center gap-1">
          <LanguageSwitcher />
          <button className="hidden rounded-md px-2 py-1.5 text-muted hover:bg-card-hover hover:text-foreground transition-colors cursor-pointer sm:inline-flex" aria-label="Currency">
            <span className="text-xs font-medium">$</span>
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="hidden rounded-md px-2 py-1.5 text-muted hover:bg-card-hover hover:text-foreground transition-colors cursor-pointer sm:inline-flex"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button className="relative rounded-md px-2 py-1.5 text-muted hover:bg-card-hover hover:text-foreground transition-colors cursor-pointer" aria-label={t('notifications')}>
            <Bell className="size-4" />
            <span className="absolute end-1.5 top-1.5 size-1.5 rounded-full bg-accent" />
          </button>

          <button className="ms-2 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-xs font-bold text-accent-foreground hover:bg-accent-strong transition-colors cursor-pointer">
            <SteamIcon className="size-4" />
            <span className="hidden sm:inline">{t('login')}</span>
            <span className="sm:hidden">Login</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children, soon = false }: { href: string; children: React.ReactNode; soon?: boolean }) {
  const t = useTranslations('nav');
  return (
    <Link
      href={href}
      className="relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted hover:bg-card-hover hover:text-foreground transition-colors"
    >
      {children}
      {soon && (
        <span className="rounded-full border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
          {t('soon')}
        </span>
      )}
    </Link>
  );
}
