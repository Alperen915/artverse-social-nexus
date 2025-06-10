
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CommunityGrid from '@/components/CommunityGrid';
import NFTGallery from '@/components/NFTGallery';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <CommunityGrid />
        <NFTGallery />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
