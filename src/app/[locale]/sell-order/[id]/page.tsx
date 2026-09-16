import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import SellOrderView from '@/components/sell/SellOrderView';

// Sell requests live in localStorage (mock), so this route renders per-request.
export const dynamic = 'force-dynamic';

export default async function SellOrderPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="flex-1">
        <SellOrderView id={id} />
      </main>
      <Footer />
    </>
  );
}
