import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');

  const columns = [
    {
      title: t('market'),
      links: [
        { label: t('links.browseAll'), href: '/market' },
        { label: t('links.knivesGloves'), href: '/market' },
        { label: t('links.under50'), href: '/market' },
        { label: t('links.priceIndex'), href: '/market-data' },
        { label: t('links.floatSearch'), href: '/market' },
      ],
    },
    {
      title: t('sellCol'),
      links: [
        { label: t('links.instantSell'), href: '/sell' },
        { label: t('links.listItem'), href: '/sell' },
        { label: t('links.payoutMethods'), href: '/sell' },
        { label: t('links.sellerFees'), href: '/sell' },
        { label: t('links.bulkSell'), href: '/sell' },
      ],
    },
    {
      title: t('learn'),
      links: [
        { label: t('links.howCustody'), href: '/#custody' },
        { label: t('links.floatExplained'), href: '/#custody' },
        { label: t('links.patternGuide'), href: '/#custody' },
        { label: t('links.tradeHolds'), href: '/#custody' },
        { label: t('links.support'), href: '/#custody' },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('links.about'), href: '/#about' },
        { label: t('links.careers'), href: '/#about' },
        { label: t('links.terms'), href: '/#about' },
        { label: t('links.privacy'), href: '/#about' },
        { label: t('links.custodyPolicy'), href: '/#custody' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2" dir="ltr">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground font-black">
                VN
              </span>
              <span className="text-sm font-bold">shop</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {t('tagline')}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted">{t('copyright')}</p>
          <p className="inline-flex items-center gap-2 text-xs text-muted">
            <span className="size-2 rounded-full bg-emerald-500" />
            {t('status')}
          </p>
        </div>
      </div>
    </footer>
  );
}
