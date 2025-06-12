
import { useState, useEffect } from 'react';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
  });

  const connectWallet = async () => {
    if (typeof window === 'undefined') {
      console.error('Window is undefined');
      return;
    }

    if (!window.ethereum) {
      alert('Please install MetaMask to connect your wallet');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));
    
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts && accounts.length > 0) {
        setWallet({
          address: accounts[0],
          isConnected: true,
          isConnecting: false,
        });
        console.log('Wallet connected:', accounts[0]);
      } else {
        setWallet(prev => ({ ...prev, isConnecting: false }));
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
    });
    console.log('Wallet disconnected');
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setWallet({
              address: accounts[0],
              isConnected: true,
              isConnecting: false,
            });
            console.log('Wallet already connected:', accounts[0]);
          }
        })
        .catch((error) => {
          console.error('Error checking wallet connection:', error);
        });

      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet({
            address: accounts[0],
            isConnected: true,
            isConnecting: false,
          });
        }
      };

      if (window.ethereum.on) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
  };
};
