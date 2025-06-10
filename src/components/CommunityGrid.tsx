
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Palette } from 'lucide-react';

const CommunityGrid = () => {
  const communities = [
    {
      id: 1,
      name: "Digital Renaissance",
      description: "A community of digital artists exploring classical art through modern NFTs",
      members: 1247,
      artworks: 3421,
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
      tag: "Classical"
    },
    {
      id: 2,
      name: "Cyber Punk Collective",
      description: "Futuristic art and cyberpunk aesthetics in the metaverse",
      members: 892,
      artworks: 2156,
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop",
      tag: "Cyberpunk"
    },
    {
      id: 3,
      name: "Abstract Minds",
      description: "Pushing boundaries with abstract and experimental digital art",
      members: 634,
      artworks: 1823,
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=400&fit=crop",
      tag: "Abstract"
    },
    {
      id: 4,
      name: "Nature's Canvas",
      description: "Digital interpretations of natural beauty and environmental themes",
      members: 756,
      artworks: 2089,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      tag: "Nature"
    },
    {
      id: 5,
      name: "Pixel Pioneers",
      description: "Retro pixel art and 8-bit inspired creations",
      members: 543,
      artworks: 1456,
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop",
      tag: "Pixel Art"
    },
    {
      id: 6,
      name: "AI Artisans",
      description: "Exploring the intersection of artificial intelligence and creative expression",
      members: 923,
      artworks: 2734,
      image: "https://images.unsplash.com/photo-1519669556878-63bdad8bb615?w=400&h=400&fit=crop",
      tag: "AI Art"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Discover <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Communities</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thriving art communities where creators collaborate, share, and govern together through decentralized ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {communities.map((community) => (
            <Card key={community.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-105 bg-white/50 backdrop-blur-sm">
              <div className="relative">
                <img 
                  src={community.image} 
                  alt={community.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-purple-700">
                    {community.tag}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-600 transition-colors">
                  {community.name}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {community.description}
                </p>
                
                <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{community.members.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center">
                    <Palette className="w-4 h-4 mr-1" />
                    <span>{community.artworks.toLocaleString()} artworks</span>
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Join Community
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="border-purple-200 hover:border-purple-400">
            View All Communities
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunityGrid;
