import { ChainSelector } from './ChainSelector';
import { Button } from '@/components/ui/button';
import { useNetwork } from '@/hooks/useNetwork';

export const NetworkSwitcher = () => {
  const { isSupported } = useNetwork();

  const openFaucet = () => {
    // Multi-chain faucet links
    const faucetUrls = {
      'Sepolia Testnet': 'https://sepolia-faucet.pk910.de/',
      'Polygon': 'https://faucet.polygon.technology/',
      'BSC': 'https://testnet.bnbchain.org/faucet-smart',
    };
    
    // Open appropriate faucet or general faucet list
    window.open('https://faucetlink.to/', '_blank');
  };

  return (
    <div className="flex gap-2 items-center">
      <ChainSelector />
      {!isSupported && (
        <Button onClick={openFaucet} variant="secondary" size="sm">
          Test Token Al
        </Button>
      )}
    </div>
  );
};