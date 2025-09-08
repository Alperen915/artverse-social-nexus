export const SEPOLIA_TESTNET = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://lb.drpc.org/ogrpc?network=sepolia&dkey='],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

export const NETWORK_CONFIG = {
  SEPOLIA: SEPOLIA_TESTNET,
};

// Test NFT Contract addresses on Sepolia
export const TEST_CONTRACTS = {
  NFT_CONTRACT: '0xf61A4b67D8764a715E15a9392a869235BB81672c', // Gerçek deployed NFT contract
  MARKETPLACE_CONTRACT: '0x1604Fef32d056bB14035056A12d78EBd9706680E', // Gerçek marketplace contract
};

// Testnet ETH Faucets
export const FAUCETS = {
  SEPOLIA: 'https://sepolia-faucet.pk910.de/',
  ALCHEMY_SEPOLIA: 'https://sepoliafaucet.com/',
  THIRDWEB_SEPOLIA: 'https://thirdweb.com/sepolia',
};