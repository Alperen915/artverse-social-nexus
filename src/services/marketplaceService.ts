import { ethers } from 'ethers';
import { web3Service } from './web3Service';

// ERC-721 Marketplace Contract ABI
const MARKETPLACE_ABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 price) external",
  "function buyNFT(address nftContract, uint256 tokenId) external payable",
  "function cancelListing(address nftContract, uint256 tokenId) external",
  "function updatePrice(address nftContract, uint256 tokenId, uint256 newPrice) external",
  "function getListing(address nftContract, uint256 tokenId) external view returns (address seller, uint256 price, bool active)",
  "function getMarketplaceFee() external view returns (uint256)",
  "event NFTListed(address indexed nftContract, uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event NFTSold(address indexed nftContract, uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)",
  "event ListingCancelled(address indexed nftContract, uint256 indexed tokenId, address indexed seller)"
];

// ERC-721 Token ABI for marketplace operations
const ERC721_ABI = [
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId) external"
];

export interface MarketplaceListing {
  nftContract: string;
  tokenId: string;
  seller: string;
  price: string;
  active: boolean;
}

export interface PurchaseResult {
  transactionHash: string;
  seller: string;
  buyer: string;
  price: string;
  gasUsed: string;
}

export class MarketplaceService {
  private marketplaceAddress: string;

  constructor(marketplaceAddress: string) {
    this.marketplaceAddress = marketplaceAddress;
  }

  async listNFT(
    nftContract: string,
    tokenId: string,
    priceInEth: string
  ): Promise<string> {
    try {
      const signer = await web3Service.getSigner();
      const marketplace = new ethers.Contract(this.marketplaceAddress, MARKETPLACE_ABI, signer);
      const nftContractInstance = new ethers.Contract(nftContract, ERC721_ABI, signer);

      const priceInWei = ethers.utils.parseEther(priceInEth);
      const userAddress = await signer.getAddress();

      // Check if user owns the NFT
      const owner = await nftContractInstance.ownerOf(tokenId);
      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('You do not own this NFT');
      }

      // Check and set approval if needed
      const approved = await nftContractInstance.getApproved(tokenId);
      const isApprovedForAll = await nftContractInstance.isApprovedForAll(userAddress, this.marketplaceAddress);

      if (approved.toLowerCase() !== this.marketplaceAddress.toLowerCase() && !isApprovedForAll) {
        console.log('Setting approval for marketplace...');
        const approvalTx = await nftContractInstance.approve(this.marketplaceAddress, tokenId);
        await approvalTx.wait();
        console.log('Approval set successfully');
      }

      // List the NFT
      console.log('Listing NFT on marketplace...');
      const listTx = await marketplace.listNFT(nftContract, tokenId, priceInWei);
      const receipt = await listTx.wait();

      console.log('NFT listed successfully:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    }
  }

  async buyNFT(
    nftContract: string,
    tokenId: string,
    priceInEth: string
  ): Promise<PurchaseResult> {
    try {
      const signer = await web3Service.getSigner();
      const marketplace = new ethers.Contract(this.marketplaceAddress, MARKETPLACE_ABI, signer);

      const priceInWei = ethers.utils.parseEther(priceInEth);
      const buyerAddress = await signer.getAddress();

      // Get current listing info
      const listing = await marketplace.getListing(nftContract, tokenId);
      if (!listing.active) {
        throw new Error('NFT is not listed for sale');
      }

      // Buy the NFT
      console.log('Purchasing NFT...');
      const buyTx = await marketplace.buyNFT(nftContract, tokenId, {
        value: priceInWei
      });

      const receipt = await buyTx.wait();
      console.log('NFT purchased successfully:', receipt.transactionHash);

      return {
        transactionHash: receipt.transactionHash,
        seller: listing.seller,
        buyer: buyerAddress,
        price: priceInEth,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error buying NFT:', error);
      throw error;
    }
  }

  async cancelListing(nftContract: string, tokenId: string): Promise<string> {
    try {
      const signer = await web3Service.getSigner();
      const marketplace = new ethers.Contract(this.marketplaceAddress, MARKETPLACE_ABI, signer);

      const cancelTx = await marketplace.cancelListing(nftContract, tokenId);
      const receipt = await cancelTx.wait();

      console.log('Listing cancelled successfully:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Error cancelling listing:', error);
      throw error;
    }
  }

  async updatePrice(
    nftContract: string,
    tokenId: string,
    newPriceInEth: string
  ): Promise<string> {
    try {
      const signer = await web3Service.getSigner();
      const marketplace = new ethers.Contract(this.marketplaceAddress, MARKETPLACE_ABI, signer);

      const newPriceInWei = ethers.utils.parseEther(newPriceInEth);
      const updateTx = await marketplace.updatePrice(nftContract, tokenId, newPriceInWei);
      const receipt = await updateTx.wait();

      console.log('Price updated successfully:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Error updating price:', error);
      throw error;
    }
  }

  async getListing(nftContract: string, tokenId: string): Promise<MarketplaceListing | null> {
    try {
      const provider = web3Service['provider'];
      if (!provider) {
        throw new Error('Provider not available');
      }

      const marketplace = new ethers.Contract(this.marketplaceAddress, MARKETPLACE_ABI, provider);
      const listing = await marketplace.getListing(nftContract, tokenId);

      if (!listing.active) {
        return null;
      }

      return {
        nftContract,
        tokenId,
        seller: listing.seller,
        price: ethers.utils.formatEther(listing.price),
        active: listing.active
      };
    } catch (error) {
      console.error('Error getting listing:', error);
      throw error;
    }
  }

  async getMarketplaceFee(): Promise<number> {
    try {
      const provider = web3Service['provider'];
      if (!provider) {
        throw new Error('Provider not available');
      }

      const marketplace = new ethers.Contract(this.marketplaceAddress, MARKETPLACE_ABI, provider);
      const fee = await marketplace.getMarketplaceFee();
      
      return fee.toNumber() / 100; // Convert basis points to percentage
    } catch (error) {
      console.error('Error getting marketplace fee:', error);
      return 2.5; // Default 2.5% fee
    }
  }
}

// Sepolia Testnet marketplace contract (gerçek deployed contract)
const MARKETPLACE_CONTRACT_ADDRESS = '0x1604Fef32d056bB14035056A12d78EBd9706680E';
export const marketplaceService = new MarketplaceService(MARKETPLACE_CONTRACT_ADDRESS);