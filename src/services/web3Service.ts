import { ethers } from 'ethers';

// ERC-721 NFT Contract ABI (minimal required functions)
const NFT_ABI = [
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export class Web3Service {
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      // Sepolia Testnet için hazır
      console.log('Web3 provider initialized for Sepolia Testnet');
    }
  }

  async connectWallet(): Promise<string | null> {
    try {
      if (!this.provider) {
        throw new Error('MetaMask not detected');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.signer = this.provider.getSigner();
      const address = await this.signer.getAddress();
      
      console.log('Wallet connected:', address);
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async getSigner(): Promise<ethers.Signer> {
    if (!this.signer) {
      await this.connectWallet();
    }
    if (!this.signer) {
      throw new Error('No signer available');
    }
    return this.signer;
  }

  async getNetwork(): Promise<ethers.providers.Network | null> {
    try {
      if (!this.provider) return null;
      return await this.provider.getNetwork();
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  }

  async mintNFT(
    contractAddress: string,
    recipientAddress: string,
    tokenURI: string
  ): Promise<{ transactionHash: string; tokenId: string }> {
    try {
      const signer = await this.getSigner();
      const contract = new ethers.Contract(contractAddress, NFT_ABI, signer);

      console.log('Minting NFT to:', recipientAddress);
      console.log('Token URI:', tokenURI);

      // Estimate gas
      const gasEstimate = await contract.estimateGas.mint(recipientAddress, tokenURI);
      console.log('Gas estimate:', gasEstimate.toString());

      // Send transaction
      const transaction = await contract.mint(recipientAddress, tokenURI, {
        gasLimit: gasEstimate.mul(120).div(100), // Add 20% buffer
      });

      console.log('Transaction sent:', transaction.hash);

      // Wait for confirmation
      const receipt = await transaction.wait();
      console.log('Transaction confirmed:', receipt);

      // Extract token ID from events
      const transferEvent = receipt.events?.find((event: any) => event.event === 'Transfer');
      const tokenId = transferEvent?.args?.tokenId?.toString() || '0';

      return {
        transactionHash: receipt.transactionHash,
        tokenId
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  async getTokenInfo(contractAddress: string, tokenId: string) {
    try {
      if (!this.provider) {
        throw new Error('Provider not available');
      }

      const contract = new ethers.Contract(contractAddress, NFT_ABI, this.provider);
      
      const [owner, tokenURI] = await Promise.all([
        contract.ownerOf(tokenId),
        contract.tokenURI(tokenId)
      ]);

      return { owner, tokenURI };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }

  async waitForTransaction(txHash: string): Promise<ethers.providers.TransactionReceipt> {
    if (!this.provider) {
      throw new Error('Provider not available');
    }
    
    return await this.provider.waitForTransaction(txHash);
  }

  formatEther(wei: ethers.BigNumberish): string {
    return ethers.utils.formatEther(wei);
  }

  parseEther(ether: string): ethers.BigNumber {
    return ethers.utils.parseEther(ether);
  }
}

export const web3Service = new Web3Service();