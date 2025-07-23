import { PublicNFTMarketplace } from '@/components/marketplace/PublicNFTMarketplace';

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <PublicNFTMarketplace />
      </div>
    </div>
  );
}