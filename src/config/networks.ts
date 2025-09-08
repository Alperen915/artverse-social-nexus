export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

// dRPC endpoints for all major networks
export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  ETHEREUM: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://lb.drpc.org/ogrpc?network=ethereum&dkey='],
    blockExplorerUrls: ['https://etherscan.io/'],
  },
  SEPOLIA: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://lb.drpc.org/ogrpc?network=sepolia&dkey='],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
  POLYGON: {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://lb.drpc.org/ogrpc?network=polygon&dkey='],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  BSC: {
    chainId: '0x38',
    chainName: 'BSC',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://lb.drpc.org/ogrpc?network=bsc&dkey='],
    blockExplorerUrls: ['https://bscscan.com/'],
  },
  ARBITRUM: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://lb.drpc.org/ogrpc?network=arbitrum&dkey='],
    blockExplorerUrls: ['https://arbiscan.io/'],
  },
  OPTIMISM: {
    chainId: '0xa',
    chainName: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://lb.drpc.org/ogrpc?network=optimism&dkey='],
    blockExplorerUrls: ['https://optimistic.etherscan.io/'],
  },
  AVALANCHE: {
    chainId: '0xa86a',
    chainName: 'Avalanche',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://lb.drpc.org/ogrpc?network=avalanche&dkey='],
    blockExplorerUrls: ['https://snowtrace.io/'],
  },
};
// Backward compatibility
export const SEPOLIA_TESTNET = SUPPORTED_NETWORKS.SEPOLIA;
export const NETWORK_CONFIG = { SEPOLIA: SEPOLIA_TESTNET };

// Legacy - use CHAIN_CONTRACTS instead
export const TEST_CONTRACTS = {
  NFT_CONTRACT: '0xf61A4b67D8764a715E15a9392a869235BB81672c',
  MARKETPLACE_CONTRACT: '0x1604Fef32d056bB14035056A12d78EBd9706680E',
};