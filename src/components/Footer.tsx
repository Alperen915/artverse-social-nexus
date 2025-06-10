
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Artverse
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Empowering artists through decentralized communities, NFT galleries, and DAO governance. 
              Join the future of digital art creation and ownership.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:border-purple-400 hover:text-white">
                Discord
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:border-purple-400 hover:text-white">
                Twitter
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:border-purple-400 hover:text-white">
                GitHub
              </Button>
            </div>
          </div>

          {/* Communities */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Communities</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Explore</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Create</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Trending</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Featured</a></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Governance</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Tokenomics</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Documentation</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2024 Artverse. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
