import { ethers } from 'ethers';
import { web3Service } from './web3Service';

// ERC-20 Token Factory Contract ABI
const TOKEN_FACTORY_ABI = [
  "function createToken(string memory name, string memory symbol, uint256 totalSupply, address owner) external returns (address)",
  "function getTokensCreatedBy(address creator) external view returns (address[] memory)",
  "event TokenCreated(address indexed tokenAddress, address indexed creator, string name, string symbol, uint256 totalSupply)"
];

// Standard ERC-20 ABI
const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "event Transfer(indexed address from, indexed address to, uint256 value)",
  "event Approval(indexed address owner, indexed address spender, uint256 value)"
];

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creator: string;
}

export interface CreateTokenParams {
  name: string;
  symbol: string;
  totalSupply: string;
  description?: string;
}

class TokenService {
  private factoryAddress: string;

  constructor() {
    // Sepolia testnet token factory address
    this.factoryAddress = '0x2604Fef32d056bB14035056A12d78EBd9706680F';
  }

  async createToken(params: CreateTokenParams): Promise<{ tokenAddress: string; transactionHash: string }> {
    try {
      const signer = await web3Service.getSigner();
      if (!signer) throw new Error('No signer available');

      const factory = new ethers.Contract(this.factoryAddress, TOKEN_FACTORY_ABI, signer);
      
      // Convert total supply to wei (18 decimals)
      const totalSupplyWei = ethers.utils.parseEther(params.totalSupply);
      
      const tx = await factory.createToken(
        params.name,
        params.symbol,
        totalSupplyWei,
        await signer.getAddress()
      );

      const receipt = await tx.wait();
      
      // Parse the TokenCreated event to get the token address
      const event = receipt.events?.find((e: any) => e.event === 'TokenCreated');
      const tokenAddress = event?.args?.tokenAddress;

      if (!tokenAddress) {
        throw new Error('Token address not found in transaction receipt');
      }

      return {
        tokenAddress,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      const provider = web3Service.getProvider();
      if (!provider) throw new Error('No provider available');

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
        creator: '' // We'll need to track this separately
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      const provider = web3Service.getProvider();
      if (!provider) throw new Error('No provider available');

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }

  async transferToken(tokenAddress: string, toAddress: string, amount: string): Promise<string> {
    try {
      const signer = await web3Service.getSigner();
      if (!signer) throw new Error('No signer available');

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await contract.decimals();
      const amountWei = ethers.utils.parseUnits(amount, decimals);
      
      const tx = await contract.transfer(toAddress, amountWei);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error transferring token:', error);
      throw error;
    }
  }

  async approveToken(tokenAddress: string, spenderAddress: string, amount: string): Promise<string> {
    try {
      const signer = await web3Service.getSigner();
      if (!signer) throw new Error('No signer available');

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await contract.decimals();
      const amountWei = ethers.utils.parseUnits(amount, decimals);
      
      const tx = await contract.approve(spenderAddress, amountWei);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error approving token:', error);
      throw error;
    }
  }

  async getTokensCreatedBy(creatorAddress: string): Promise<string[]> {
    try {
      const provider = web3Service.getProvider();
      if (!provider) throw new Error('No provider available');

      const factory = new ethers.Contract(this.factoryAddress, TOKEN_FACTORY_ABI, provider);
      const tokens = await factory.getTokensCreatedBy(creatorAddress);
      
      return tokens;
    } catch (error) {
      console.error('Error getting created tokens:', error);
      throw error;
    }
  }
}

export const tokenService = new TokenService();