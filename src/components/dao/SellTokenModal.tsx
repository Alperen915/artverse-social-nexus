import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { tokenMarketplaceService } from '@/services/tokenMarketplaceService';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';

interface SellTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  userBalance: string;
  onListingCreated?: () => void;
}

export const SellTokenModal = ({
  open,
  onOpenChange,
  tokenAddress,
  tokenSymbol,
  tokenName,
  userBalance,
  onListingCreated
}: SellTokenModalProps) => {
  const [amount, setAmount] = useState('');
  const [pricePerToken, setPricePerToken] = useState('');
  const [isListing, setIsListing] = useState(false);
  const { toast } = useToast();
  const { address } = useWallet();

  const handleListToken = async () => {
    if (!amount || !pricePerToken || !address) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun ve cüzdanınızı bağlayın",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    const priceNum = parseFloat(pricePerToken);
    const balanceNum = parseFloat(userBalance);

    if (amountNum <= 0 || priceNum <= 0) {
      toast({
        title: "Hata",
        description: "Miktar ve fiyat 0'dan büyük olmalıdır",
        variant: "destructive",
      });
      return;
    }

    if (amountNum > balanceNum) {
      toast({
        title: "Hata",
        description: "Yetersiz token bakiyesi",
        variant: "destructive",
      });
      return;
    }

    setIsListing(true);

    try {
      // List token on blockchain
      const txHash = await tokenMarketplaceService.listToken(
        tokenAddress,
        amount,
        pricePerToken
      );

      // Save listing to database
      const totalPrice = amountNum * priceNum;
      const { error } = await supabase
        .from('token_marketplace_listings')
        .insert({
          token_address: tokenAddress,
          seller: address,
          amount: amountNum,
          price_per_token: priceNum,
          total_price: totalPrice,
          transaction_hash: txHash,
          status: 'active'
        });

      if (error) {
        console.error('Database error:', error);
        throw new Error('Veritabanına kaydedilemedi');
      }

      toast({
        title: "Başarılı",
        description: `${tokenSymbol} tokenları başarıyla listelendi!`,
      });

      setAmount('');
      setPricePerToken('');
      onOpenChange(false);
      onListingCreated?.();
    } catch (error: any) {
      console.error('Error listing token:', error);
      toast({
        title: "Hata",
        description: error.message || "Token listelenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsListing(false);
    }
  };

  const totalPrice = amount && pricePerToken ? (parseFloat(amount) * parseFloat(pricePerToken)).toFixed(4) : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Token Sat - {tokenName} ({tokenSymbol})</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Mevcut Bakiye: {userBalance} {tokenSymbol}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Satılacak Miktar</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={userBalance}
              step="0.000001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Token Başına Fiyat (ETH)</Label>
            <Input
              id="price"
              type="number"
              placeholder="0.001"
              value={pricePerToken}
              onChange={(e) => setPricePerToken(e.target.value)}
              step="0.000001"
            />
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">Toplam Kazanç: {totalPrice} ETH</div>
            <div className="text-xs text-muted-foreground mt-1">
              Marketplace ücreti: %2.5
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button 
              onClick={handleListToken}
              disabled={isListing || !amount || !pricePerToken}
              className="flex-1"
            >
              {isListing ? "Listeleniyor..." : "Token Sat"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};