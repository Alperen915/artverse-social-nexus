
import { useState, useEffect } from 'react';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  network: string | null;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    network: null,
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
      
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });
      
      if (accounts && accounts.length > 0) {
        setWallet({
          address: accounts[0],
          isConnected: true,
          isConnecting: false,
          chainId,
          network: getNetworkName(chainId),
        });
        console.log('Wallet connected:', accounts[0], 'Network:', chainId);
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
      chainId: null,
      network: null,
    });
    console.log('Wallet disconnected');
  };

  const getNetworkName = (chainId: string): string => {
    const networks: Record<string, string> = {
      '0x1': 'Ethereum',
      '0xaa36a7': 'Sepolia',
      '0x89': 'Polygon',
      '0x38': 'BSC',
      '0xa4b1': 'Arbitrum',
      '0xa': 'Optimism',
      '0xa86a': 'Avalanche',
      '0xD9560': 'Bros Testnet',
      '0xF423F': 'Bros Mainnet',
    };
    return networks[chainId] || 'Unknown';
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(async (accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setWallet({
              address: accounts[0],
              isConnected: true,
              isConnecting: false,
              chainId,
              network: getNetworkName(chainId),
            });
            console.log('Wallet already connected:', accounts[0], 'Network:', chainId);
          }
        })
        .catch((error) => {
          console.error('Error checking wallet connection:', error);
        });

      // Listen for account and chain changes
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setWallet({
            address: accounts[0],
            isConnected: true,
            isConnecting: false,
            chainId,
            network: getNetworkName(chainId),
          });
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWallet(prev => ({
          ...prev,
          chainId,
          network: getNetworkName(chainId),
        }));
      };

      if (window.ethereum.on) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
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
