import { ethers } from 'ethers';
import { web3Service } from './web3Service';
import { supabase } from '@/integrations/supabase/client';

// BROS Token contract addresses (update after deployment)
export const BROS_TOKEN_CONFIG = {
  SEPOLIA: '0x0000000000000000000000000000000000000000',
  BROS_TESTNET: '0x0000000000000000000000000000000000000000',
  BROS_MAINNET: '0x0000000000000000000000000000000000000000',
};

// ERC20 ABI for BROS token interactions
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

class BrosTokenService {
  /**
   * Get BROS token balance for an address
   */
  async getBrosBalance(address: string, chainId: string): Promise<string> {
    try {
      const tokenAddress = this.getTokenAddress(chainId);
      if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        return '0';
      }

      const provider = web3Service.getProvider();
      if (!provider) {
        throw new Error('Provider not available');
      }

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error fetching BROS balance:', error);
      return '0';
    }
  }

  /**
   * Transfer BROS tokens to another address
   */
  async transferBros(to: string, amount: string): Promise<string> {
    try {
      const signer = await web3Service.getSigner();
      const network = await signer.getChainId();
      const chainId = `0x${network.toString(16)}`;
      const tokenAddress = this.getTokenAddress(chainId);

      if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('BROS token not deployed on this network');
      }

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const tx = await contract.transfer(to, ethers.utils.parseEther(amount));
      await tx.wait();
      
      console.log('BROS transfer successful:', tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('Error transferring BROS:', error);
      throw error;
    }
  }

  /**
   * Claim BROS tokens from faucet
   */
  async claimFaucet(userAddress: string): Promise<{ txHash: string; amount: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('bros-faucet', {
        body: { address: userAddress }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error claiming from faucet:', error);
      throw error;
    }
  }

  /**
   * Check if user can claim from faucet (once per day)
   */
  async canClaimFaucet(walletAddress: string): Promise<boolean> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('faucet_claims')
        .select('id')
        .eq('wallet_address', walletAddress)
        .gte('claimed_at', oneDayAgo)
        .maybeSingle();

      if (error) throw error;
      return !data; // Can claim if no recent claim found
    } catch (error) {
      console.error('Error checking faucet eligibility:', error);
      return false;
    }
  }

  /**
   * Get token address for a specific chain
   */
  private getTokenAddress(chainId: string): string {
    const chainMap: Record<string, string> = {
      '0xaa36a7': BROS_TOKEN_CONFIG.SEPOLIA, // Sepolia
      '0xD9560': BROS_TOKEN_CONFIG.BROS_TESTNET, // Bros Testnet
      '0xF423F': BROS_TOKEN_CONFIG.BROS_MAINNET, // Bros Mainnet
    };
    return chainMap[chainId] || '';
  }

  /**
   * Approve BROS token spending
   */
  async approveBros(spender: string, amount: string): Promise<string> {
    try {
      const signer = await web3Service.getSigner();
      const network = await signer.getChainId();
      const chainId = `0x${network.toString(16)}`;
      const tokenAddress = this.getTokenAddress(chainId);

      if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('BROS token not deployed on this network');
      }

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const tx = await contract.approve(spender, ethers.utils.parseEther(amount));
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error approving BROS:', error);
      throw error;
    }
  }
}

export const brosTokenService = new BrosTokenService();
