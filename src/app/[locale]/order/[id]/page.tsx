import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import OrderView from '@/components/cart/OrderView';

// Orders live in localStorage (mock), so this route is rendered per-request.
export const dynamic = 'force-dynamic';

export default async function OrderPage({
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
        <OrderView id={id} />
      </main>
      <Footer />
    </>
  );
}
