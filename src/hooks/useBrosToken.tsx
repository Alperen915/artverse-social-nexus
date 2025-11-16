import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brosTokenService } from '@/services/brosTokenService';
import { useWallet } from './useWallet';
import { toast } from 'sonner';

export const useBrosToken = () => {
  const { address, chainId } = useWallet();
  const queryClient = useQueryClient();

  // Fetch BROS balance
  const { data: balance, isLoading: isLoadingBalance, refetch } = useQuery({
    queryKey: ['bros-balance', address, chainId],
    queryFn: () => brosTokenService.getBrosBalance(address!, chainId!),
    enabled: !!address && !!chainId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Check faucet eligibility
  const { data: canClaim, refetch: refetchCanClaim } = useQuery({
    queryKey: ['faucet-eligibility', address],
    queryFn: () => brosTokenService.canClaimFaucet(address!),
    enabled: !!address,
  });

  // Transfer BROS tokens
  const transferMutation = useMutation({
    mutationFn: ({ to, amount }: { to: string; amount: string }) =>
      brosTokenService.transferBros(to, amount),
    onSuccess: (txHash) => {
      toast.success(`BROS transfer successful! TX: ${txHash.substring(0, 10)}...`);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(`Transfer failed: ${error.message}`);
    },
  });

  // Claim from faucet
  const claimFaucetMutation = useMutation({
    mutationFn: () => brosTokenService.claimFaucet(address!),
    onSuccess: (data) => {
      toast.success(`Claimed ${data.amount} BROS! TX: ${data.txHash.substring(0, 10)}...`);
      refetch();
      refetchCanClaim();
    },
    onError: (error: Error) => {
      toast.error(`Faucet claim failed: ${error.message}`);
    },
  });

  // Approve BROS spending
  const approveMutation = useMutation({
    mutationFn: ({ spender, amount }: { spender: string; amount: string }) =>
      brosTokenService.approveBros(spender, amount),
    onSuccess: () => {
      toast.success('BROS approval successful!');
    },
    onError: (error: Error) => {
      toast.error(`Approval failed: ${error.message}`);
    },
  });

  return {
    balance: balance || '0',
    isLoadingBalance,
    canClaim: canClaim ?? false,
    transfer: transferMutation.mutate,
    claimFaucet: claimFaucetMutation.mutate,
    approve: approveMutation.mutate,
    isLoading: transferMutation.isPending || claimFaucetMutation.isPending || approveMutation.isPending,
    refetchBalance: refetch,
  };
};
