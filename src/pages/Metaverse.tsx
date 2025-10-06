import { MetaverseDashboard } from '@/components/metaverse/MetaverseDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Metaverse() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-6">
        <MetaverseDashboard />
      </div>
      <Footer />
    </div>
  );
}