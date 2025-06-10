
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Artverse
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-purple-600 transition-colors font-medium">
              Explore
            </a>
            <a href="#" className="text-foreground hover:text-purple-600 transition-colors font-medium">
              Communities
            </a>
            <a href="#" className="text-foreground hover:text-purple-600 transition-colors font-medium">
              Create
            </a>
            <a href="#" className="text-foreground hover:text-purple-600 transition-colors font-medium">
              Governance
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-purple-200 hover:border-purple-400">
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-foreground hover:text-purple-600 transition-colors">
                Explore
              </a>
              <a href="#" className="block px-3 py-2 text-foreground hover:text-purple-600 transition-colors">
                Communities
              </a>
              <a href="#" className="block px-3 py-2 text-foreground hover:text-purple-600 transition-colors">
                Create
              </a>
              <a href="#" className="block px-3 py-2 text-foreground hover:text-purple-600 transition-colors">
                Governance
              </a>
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
