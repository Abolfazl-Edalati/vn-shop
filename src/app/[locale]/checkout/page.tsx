import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import CheckoutView from '@/components/cart/CheckoutView';

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="flex-1">
        <CheckoutView />
      </main>
      <Footer />
    </>
  );
}
