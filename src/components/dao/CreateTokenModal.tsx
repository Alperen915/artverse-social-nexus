import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { tokenService } from '@/services/tokenService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Coins } from 'lucide-react';

interface CreateTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
  onTokenCreated?: () => void;
}

export function CreateTokenModal({ open, onOpenChange, communityId, onTokenCreated }: CreateTokenModalProps) {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    description: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateToken = async () => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    if (!formData.name || !formData.symbol || !formData.totalSupply) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    if (parseFloat(formData.totalSupply) <= 0) {
      toast.error('Total supply 0\'dan büyük olmalıdır');
      return;
    }

    // Check if user has a wallet address
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('id', user.id)
      .single();

    if (!profile?.wallet_address) {
      toast.error('Lütfen önce cüzdanınızı bağlayın');
      return;
    }

    setIsCreating(true);

    try {
      // Create token on blockchain
      const { tokenAddress, transactionHash } = await tokenService.createToken({
        name: formData.name,
        symbol: formData.symbol,
        totalSupply: formData.totalSupply,
        description: formData.description
      });

      // Save token info to database
      const { error } = await (supabase as any)
        .from('dao_tokens')
        .insert({
          community_id: communityId,
          creator_id: user.id,
          token_name: formData.name,
          token_symbol: formData.symbol,
          total_supply: parseFloat(formData.totalSupply),
          token_address: tokenAddress,
          deployment_tx_hash: transactionHash,
          description: formData.description,
          network: 'Sepolia Testnet'
        });

      if (error) throw error;

      toast.success('Token başarıyla oluşturuldu!');
      onOpenChange(false);
      onTokenCreated?.();
      
      // Reset form
      setFormData({
        name: '',
        symbol: '',
        totalSupply: '',
        description: ''
      });

    } catch (error) {
      console.error('Error creating token:', error);
      toast.error('Token oluşturulurken hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            ERC-20 Token Oluştur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="tokenName">Token Adı *</Label>
            <Input
              id="tokenName"
              placeholder="Örn: My DAO Token"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tokenSymbol">Token Sembolü *</Label>
            <Input
              id="tokenSymbol"
              placeholder="Örn: MDT"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>

          <div>
            <Label htmlFor="totalSupply">Toplam Arz *</Label>
            <Input
              id="totalSupply"
              type="number"
              placeholder="Örn: 1000000"
              value={formData.totalSupply}
              onChange={(e) => handleInputChange('totalSupply', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              placeholder="Token hakkında açıklama..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">Önemli Bilgiler:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Token Sepolia Testnet'te oluşturulacak</li>
              <li>18 decimal kullanılacak</li>
              <li>Tüm token'lar size gönderilecek</li>
              <li>Gas ücreti ödenecek</li>
            </ul>
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
              onClick={handleCreateToken}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Token Oluştur
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}