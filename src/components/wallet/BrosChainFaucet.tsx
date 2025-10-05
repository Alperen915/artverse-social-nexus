import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Droplet } from 'lucide-react';
import { useNetwork } from '@/hooks/useNetwork';

export const BrosChainFaucet = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { chainId } = useNetwork();

  const isBrosChainTestnet = chainId === '0x42524F53';

  const requestTokens = async () => {
    if (!walletAddress || !walletAddress.startsWith('0x')) {
      toast({
        title: 'Geçersiz Adres',
        description: 'Lütfen geçerli bir cüzdan adresi girin',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulated faucet request - bu gerçek bir faucet API'sine bağlanacak
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Test BROS Tokenleri Gönderildi! 🎉',
        description: `100 test BROS token ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} adresine gönderildi`,
      });
      
      setWalletAddress('');
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Token gönderimi başarısız oldu. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-primary" />
          <CardTitle>Bros Chain Testnet Faucet</CardTitle>
        </div>
        <CardDescription>
          Ücretsiz test BROS tokenleri alın (Her 24 saatte bir 100 BROS)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isBrosChainTestnet && (
          <div className="p-3 bg-warning/10 border border-warning rounded-md text-sm">
            ⚠️ Lütfen önce Bros Chain Testnet'e bağlanın
          </div>
        )}
        
        <div className="space-y-2">
          <Input
            placeholder="Cüzdan Adresi (0x...)"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            disabled={isLoading || !isBrosChainTestnet}
          />
        </div>

        <Button 
          onClick={requestTokens} 
          disabled={isLoading || !walletAddress || !isBrosChainTestnet}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            <>
              <Droplet className="mr-2 h-4 w-4" />
              Test BROS Token Al
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Her adres 24 saatte bir token alabilir</p>
          <p>• Test tokenleri sadece testnet'te geçerlidir</p>
          <p>• Mainnet tokenleri için token pazarını kullanın</p>
        </div>
      </CardContent>
    </Card>
  );
};
