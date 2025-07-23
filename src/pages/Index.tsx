
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import CommunityGrid from '@/components/CommunityGrid';
import { PlatformStats } from '@/components/stats/PlatformStats';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Platform Statistics */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Platform İstatistikleri
            </h2>
            <p className="text-gray-600">
              Topluluk ekosistemimizin canlı verilerini görüntüleyin
            </p>
          </div>
          <PlatformStats />
        </div>

        {/* Communities Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Topluluklar
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sanat topluluklarına katılın ve NFT ekosisteminin bir parçası olun
          </p>
        </div>

        <CommunityGrid />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
