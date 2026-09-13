import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import ItemDetail from '@/components/item/ItemDetail';
import { skins, getSkinById } from '@/data/skins';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

// Pre-generate all mock item pages (phase 1: static)
export function generateStaticParams() {
  return skins.map((skin) => ({ id: skin.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const skin = getSkinById(id);
  return {
    title: skin ? `${skin.market_hash_name} — VN Shop` : 'VN Shop',
  };
}

export default async function ItemPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const skin = getSkinById(id);
  if (!skin) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <ItemDetail skin={skin} />
      </main>
      <Footer />
    </>
  );
}
