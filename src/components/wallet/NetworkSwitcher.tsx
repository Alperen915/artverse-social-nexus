import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEPOLIA_TESTNET, FAUCETS } from '@/config/networks';

export const NetworkSwitcher = () => {
  const { toast } = useToast();

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask bulunamadı",
        description: "Lütfen MetaMask yükleyin",
        variant: "destructive",
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_TESTNET.chainId }],
      });
      
      toast({
        title: "Network değiştirildi",
        description: "Sepolia Testnet aktif",
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_TESTNET],
          });
        } catch (addError) {
          console.error('Network eklenirken hata:', addError);
          toast({
            title: "Network eklenemedi",
            description: "Sepolia Testnet eklenirken hata oluştu",
            variant: "destructive",
          });
        }
      }
    }
  };

  const openFaucet = () => {
    window.open(FAUCETS.SEPOLIA, '_blank');
  };

  return (
    <div className="flex gap-2">
      <Button onClick={switchToSepolia} variant="outline">
        Sepolia Testnet
      </Button>
      <Button onClick={openFaucet} variant="secondary">
        Testnet ETH Al
      </Button>
    </div>
  );
};