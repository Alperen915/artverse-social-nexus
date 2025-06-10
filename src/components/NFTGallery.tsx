
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const NFTGallery = () => {
  const featuredNFTs = [
    {
      id: 1,
      title: "Ethereal Dreams #001",
      artist: "PixelMaster",
      price: "2.5 ETH",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      title: "Digital Sunset",
      artist: "CryptoArtist",
      price: "1.8 ETH",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop",
    },
    {
      id: 3,
      title: "Neon Genesis",
      artist: "FutureVision",
      price: "3.2 ETH",
      image: "https://images.unsplash.com/photo-1635776062043-223faf322554?w=400&h=400&fit=crop",
    },
    {
      id: 4,
      title: "Abstract Reality",
      artist: "MindBender",
      price: "1.5 ETH",
      image: "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=400&h=400&fit=crop",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Featured <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">NFT Gallery</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover unique digital artworks from our vibrant community of creators, now available as NFTs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredNFTs.map((nft) => (
            <Card key={nft.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-105 bg-white/70 backdrop-blur-sm">
              <div className="relative">
                <img 
                  src={nft.image} 
                  alt={nft.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Button size="sm" className="w-full bg-white/90 text-gray-900 hover:bg-white">
                    View Details
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 transition-colors">
                  {nft.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  by {nft.artist}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-purple-600">
                    {nft.price}
                  </span>
                  <Button size="sm" variant="outline" className="border-purple-200 hover:border-purple-400">
                    Bid
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            Explore Full Gallery
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NFTGallery;
