
import { Button } from '@/components/ui/button';
import { ArrowRight, Palette, Users, Vote } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/50 backdrop-blur-sm border border-purple-200 rounded-full">
            <span className="text-sm font-medium text-purple-700">🎨 Web3 Art Communities</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Create & Govern</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Art Communities
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Join decentralized art communities where creators own their work, 
            govern together, and build the future of digital art through NFTs and DAOs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg h-auto"
            >
              Explore Communities
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-purple-200 hover:border-purple-400 px-8 py-4 text-lg h-auto"
            >
              Create Community
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">NFT Galleries</h3>
              <p className="text-muted-foreground text-center">Showcase and monetize your digital art in immersive virtual galleries.</p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Token-Gated Access</h3>
              <p className="text-muted-foreground text-center">Join exclusive communities based on NFT ownership and participation.</p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">DAO Governance</h3>
              <p className="text-muted-foreground text-center">Vote on proposals and shape the future of your art community together.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
