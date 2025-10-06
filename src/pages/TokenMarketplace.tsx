import { TokenMarketplace } from '@/components/dao/TokenMarketplace';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TokenMarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <TokenMarketplace />
      </div>
      <Footer />
    </div>
  );
}