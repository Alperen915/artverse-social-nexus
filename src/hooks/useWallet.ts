
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
    if (typeof window !== 'undefined' && window.ethereum) {
      setWallet(prev => ({ ...prev, isConnecting: true }));
      
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          setWallet({
            address: accounts[0],
            isConnected: true,
            isConnecting: false,
          });
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setWallet(prev => ({ ...prev, isConnecting: false }));
      }
    } else {
      alert('Please install MetaMask to connect your wallet');
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
    });
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWallet({
              address: accounts[0],
              isConnected: true,
              isConnecting: false,
            });
          }
        })
        .catch((error) => {
          console.error('Error checking wallet connection:', error);
        });
    }
  }, []);

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
  };
};
