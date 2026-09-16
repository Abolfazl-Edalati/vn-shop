import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import CartView from '@/components/cart/CartView';

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="flex-1">
        <CartView />
      </main>
      <Footer />
    </>
  );
}
