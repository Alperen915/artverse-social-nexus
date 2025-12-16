import { useMemo } from 'react';
import { useWallet } from './useWallet';
import { CHAIN_CONTRACTS, ChainContracts, getContractsForChain } from '@/config/contracts';
import { SUPPORTED_NETWORKS } from '@/config/networks';

// Default to Sepolia testnet contracts
const DEFAULT_CHAIN_ID = '0xaa36a7';

export const useContracts = () => {
  const { chainId, isConnected } = useWallet();

  const contracts = useMemo((): ChainContracts | null => {
    const currentChainId = chainId || DEFAULT_CHAIN_ID;
    return getContractsForChain(currentChainId);
  }, [chainId]);

  const nftContract = useMemo(() => {
    return contracts?.NFT_CONTRACT || CHAIN_CONTRACTS[DEFAULT_CHAIN_ID]?.NFT_CONTRACT || '';
  }, [contracts]);

  const marketplaceContract = useMemo(() => {
    return contracts?.MARKETPLACE_CONTRACT || CHAIN_CONTRACTS[DEFAULT_CHAIN_ID]?.MARKETPLACE_CONTRACT || '';
  }, [contracts]);

  const tokenFactoryContract = useMemo(() => {
    return contracts?.TOKEN_FACTORY_CONTRACT || '';
  }, [contracts]);

  const tokenMarketplaceContract = useMemo(() => {
    return contracts?.TOKEN_MARKETPLACE_CONTRACT || '';
  }, [contracts]);

  const isContractDeployed = useMemo(() => {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    return nftContract !== zeroAddress && nftContract !== '';
  }, [nftContract]);

  const currentNetwork = useMemo(() => {
    if (!chainId) return null;
    return Object.values(SUPPORTED_NETWORKS).find(n => n.chainId === chainId) || null;
  }, [chainId]);

  const isSupportedNetwork = useMemo(() => {
    if (!chainId) return false;
    return Object.values(SUPPORTED_NETWORKS).some(n => n.chainId === chainId);
  }, [chainId]);

  return {
    contracts,
    nftContract,
    marketplaceContract,
    tokenFactoryContract,
    tokenMarketplaceContract,
    isContractDeployed,
    currentNetwork,
    isSupportedNetwork,
    chainId: chainId || DEFAULT_CHAIN_ID,
  };
};
