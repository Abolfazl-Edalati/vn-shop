import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import AccountView from '@/components/account/AccountView';

// Profile and history live in localStorage (mock), so this renders per-request.
export const dynamic = 'force-dynamic';

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="flex-1">
        <AccountView />
      </main>
      <Footer />
    </>
  );
}
