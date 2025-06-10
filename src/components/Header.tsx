
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { AuthModal } from './auth/AuthModal';
import { CreateCommunityModal } from './modals/CreateCommunityModal';
import { LogOut, Plus, Wallet } from 'lucide-react';

const Header = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, signOut } = useAuth();
  const { address, connectWallet, disconnectWallet, isConnected } = useWallet();

  const handleCreateCommunity = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleWalletAction = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Artverse
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
                Communities
              </a>
              <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
                Gallery
              </a>
              <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
                Governance
              </a>
              <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
                Events
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Wallet Connection */}
              <Button
                variant="outline"
                onClick={handleWalletAction}
                className="hidden sm:flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                {isConnected 
                  ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : 'Connect Wallet'
                }
              </Button>

              {/* Create Community */}
              <Button
                onClick={handleCreateCommunity}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4" />
                Create Community
              </Button>

              {/* Auth Actions */}
              {user ? (
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CreateCommunityModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  );
};

export default Header;
