import { ethers } from 'ethers';
import { web3Service } from './web3Service';

// Token Marketplace Contract ABI
const TOKEN_MARKETPLACE_ABI = [
  "function listToken(address tokenAddress, uint256 amount, uint256 pricePerToken) external",
  "function buyTokens(address tokenAddress, address seller, uint256 amount) external payable",
  "function cancelListing(address tokenAddress) external",
  "function updatePrice(address tokenAddress, uint256 newPricePerToken) external",
  "function getListing(address tokenAddress, address seller) external view returns (uint256 amount, uint256 pricePerToken, bool active)",
  "function getMarketplaceFee() external view returns (uint256)",
  "event TokenListed(indexed address tokenAddress, indexed address seller, uint256 amount, uint256 pricePerToken)",
  "event TokenSold(indexed address tokenAddress, indexed address seller, indexed address buyer, uint256 amount, uint256 totalPrice)",
  "event ListingCancelled(indexed address tokenAddress, indexed address seller)"
];

export interface TokenListing {
  tokenAddress: string;
  seller: string;
  amount: string;
  pricePerToken: string;
  totalPrice: string;
  active: boolean;
}

export interface TokenPurchaseResult {
  transactionHash: string;
  tokenAddress: string;
  seller: string;
  buyer: string;
  amount: string;
  totalPrice: string;
}

class TokenMarketplaceService {
  private marketplaceAddress: string;

  constructor() {
    // Use contract address from config
    this.marketplaceAddress = '0x3604Fef32d056bB14035056A12d78EBd9706680F'; // Will be updated with real contracts
  }

  async listToken(tokenAddress: string, amount: string, pricePerTokenInEth: string): Promise<string> {
    try {
      const signer = await web3Service.getSigner();
      if (!signer) throw new Error('No signer available');

      // First approve the marketplace to spend tokens
      const tokenContract = new ethers.Contract(tokenAddress, [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function decimals() external view returns (uint8)"
      ], signer);

      const decimals = await tokenContract.decimals();
      const amountWei = ethers.utils.parseUnits(amount, decimals);
      
      // Approve marketplace to spend tokens
      const approveTx = await tokenContract.approve(this.marketplaceAddress, amountWei);
      await approveTx.wait();

      // List the token
      const marketplace = new ethers.Contract(this.marketplaceAddress, TOKEN_MARKETPLACE_ABI, signer);
      const pricePerTokenWei = ethers.utils.parseEther(pricePerTokenInEth);
      
      const tx = await marketplace.listToken(tokenAddress, amountWei, pricePerTokenWei);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error listing token:', error);
      throw error;
    }
  }

  async buyTokens(tokenAddress: string, seller: string, amount: string, pricePerTokenInEth: string): Promise<TokenPurchaseResult> {
    try {
      const signer = await web3Service.getSigner();
      if (!signer) throw new Error('No signer available');

      const marketplace = new ethers.Contract(this.marketplaceAddress, TOKEN_MARKETPLACE_ABI, signer);
      
      // Calculate total price
      const amountBN = ethers.utils.parseUnits(amount, 18);
      const pricePerTokenBN = ethers.utils.parseEther(pricePerTokenInEth);
      const totalPrice = amountBN.mul(pricePerTokenBN).div(ethers.utils.parseEther('1'));
      
      const tx = await marketplace.buyTokens(tokenAddress, seller, amountBN, {
        value: totalPrice
      });
      
      const receipt = await tx.wait();
      const buyerAddress = await signer.getAddress();
      
      return {
        transactionHash: tx.hash,
        tokenAddress,
        seller,
        buyer: buyerAddress,
        amount,
        totalPrice: ethers.utils.formatEther(totalPrice)
      };
    } catch (error) {
      console.error('Error buying tokens:', error);
      throw error;
    }
  }

  async cancelListing(tokenAddress: string): Promise<string> {
    try {
      const signer = await web3Service.getSigner();
      if (!signer) throw new Error('No signer available');

      const marketplace = new ethers.Contract(this.marketplaceAddress, TOKEN_MARKETPLACE_ABI, signer);
      
      const tx = await marketplace.cancelListing(tokenAddress);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error cancelling listing:', error);
      throw error;
    }
  }

  async updatePrice(tokenAddress: string, newPricePerTokenInEth: string): Promise<string> {
    try {
      const signer = await web3Service.getSigner();
      if (!signer) throw new Error('No signer available');

      const marketplace = new ethers.Contract(this.marketplaceAddress, TOKEN_MARKETPLACE_ABI, signer);
      const newPriceWei = ethers.utils.parseEther(newPricePerTokenInEth);
      
      const tx = await marketplace.updatePrice(tokenAddress, newPriceWei);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error updating price:', error);
      throw error;
    }
  }

  async getListing(tokenAddress: string, seller: string): Promise<TokenListing | null> {
    try {
      const provider = web3Service.getProvider();
      if (!provider) throw new Error('No provider available');

      const marketplace = new ethers.Contract(this.marketplaceAddress, TOKEN_MARKETPLACE_ABI, provider);
      
      const [amount, pricePerToken, active] = await marketplace.getListing(tokenAddress, seller);
      
      if (!active) return null;
      
      const amountFormatted = ethers.utils.formatEther(amount);
      const pricePerTokenFormatted = ethers.utils.formatEther(pricePerToken);
      const totalPrice = (parseFloat(amountFormatted) * parseFloat(pricePerTokenFormatted)).toString();
      
      return {
        tokenAddress,
        seller,
        amount: amountFormatted,
        pricePerToken: pricePerTokenFormatted,
        totalPrice,
        active
      };
    } catch (error) {
      console.error('Error getting listing:', error);
      return null;
    }
  }

  async getMarketplaceFee(): Promise<number> {
    try {
      const provider = web3Service.getProvider();
      if (!provider) throw new Error('No provider available');

      const marketplace = new ethers.Contract(this.marketplaceAddress, TOKEN_MARKETPLACE_ABI, provider);
      const fee = await marketplace.getMarketplaceFee();
      
      return parseInt(fee.toString());
    } catch (error) {
      console.error('Error getting marketplace fee:', error);
      return 0;
    }
  }
}

export const tokenMarketplaceService = new TokenMarketplaceService();