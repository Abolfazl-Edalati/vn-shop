import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import MarketGrid from '@/components/market/MarketGrid';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MarketPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-card/30 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">VN SHOP</p>
            <h1 className="mt-2 text-3xl font-black">
              {locale === 'fa' ? 'بازار اسکین‌ها' : 'Skins Market'}
            </h1>
          </div>
        </div>
        <MarketGrid />
      </main>
      <Footer />
    </>
  );
}
