import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import Hero from '@/components/home/Hero';
import Ticker from '@/components/home/Ticker';
import MarketFloor from '@/components/home/MarketFloor';
import RareSpecials from '@/components/home/RareSpecials';
import SellPanel from '@/components/home/SellPanel';
import Custody from '@/components/home/Custody';
import MarketStats from '@/components/home/MarketStats';
import Faq from '@/components/home/Faq';
import FinalCta from '@/components/home/FinalCta';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Ticker />
        <MarketFloor />
        <RareSpecials />
        <SellPanel />
        <Custody />
        <MarketStats />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
