import { useState, useEffect } from 'react';
import { SUPPORTED_NETWORKS } from '@/config/networks';

interface NetworkState {
  chainId: string | null;
  chainName: string;
  isSupported: boolean;
  isConnected: boolean;
}

export const useNetwork = () => {
  const [network, setNetwork] = useState<NetworkState>({
    chainId: null,
    chainName: 'Unknown',
    isSupported: false,
    isConnected: false,
  });

  const updateNetworkInfo = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const supportedNetwork = Object.values(SUPPORTED_NETWORKS).find(
        network => network.chainId === chainId
      );

      setNetwork({
        chainId,
        chainName: supportedNetwork?.chainName || 'Unsupported Network',
        isSupported: !!supportedNetwork,
        isConnected: true,
      });
    } catch (error) {
      console.error('Error getting network info:', error);
      setNetwork(prev => ({ ...prev, isConnected: false }));
    }
  };

  const switchNetwork = async (chainId: string) => {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        const network = Object.values(SUPPORTED_NETWORKS).find(
          net => net.chainId === chainId
        );
        
        if (network) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [network],
            });
          } catch (addError) {
            throw new Error('Failed to add network');
          }
        }
      } else {
        throw switchError;
      }
    }
  };

  useEffect(() => {
    updateNetworkInfo();

    if (window.ethereum) {
      const handleChainChanged = () => {
        updateNetworkInfo();
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    ...network,
    switchNetwork,
    refresh: updateNetworkInfo,
  };
};