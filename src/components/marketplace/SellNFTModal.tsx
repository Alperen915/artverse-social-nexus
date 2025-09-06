import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { marketplaceService } from '@/services/marketplaceService';
import { Store, AlertTriangle, TrendingUp } from 'lucide-react';

interface SellNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    nft_contract: string;
    nft_token_id: string;
  };
  onListComplete: () => void;
}

export const SellNFTModal = ({ isOpen, onClose, nft, onListComplete }: SellNFTModalProps) => {
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useWallet();
  const { user } = useAuth();

  const handleList = async () => {
    if (!isConnected || !address || !user) {
      alert('Lütfen wallet bağlantınızı kontrol edin');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      alert('Lütfen geçerli bir fiyat girin');
      return;
    }

    if (!nft.nft_contract || !nft.nft_token_id) {
      alert('NFT kontrat bilgileri eksik');
      return;
    }

    setLoading(true);
    try {
      console.log('Listing NFT on marketplace...');
      
      // List NFT through marketplace service
      const transactionHash = await marketplaceService.listNFT(
        nft.nft_contract,
        nft.nft_token_id,
        price
      );

      console.log('NFT listing successful:', transactionHash);

      // Record the listing on our backend
      const { data, error } = await supabase.functions.invoke('list-nft', {
        body: {
          submissionId: nft.id,
          mintId: `${nft.nft_contract}_${nft.nft_token_id}`,
          sellerAddress: address,
          price: parseFloat(price),
          transactionHash: transactionHash
        }
      });

      if (error) {
        console.error('Error recording listing:', error);
        throw new Error('Listeleme kaydı başarısız');
      }

      alert(`NFT başarıyla marketplace'e listelendi!\nFiyat: ${price} ETH\nTransaction: ${transactionHash}`);
      onListComplete();
      onClose();
    } catch (error) {
      console.error('Error listing NFT:', error);
      alert(`Listeleme işlemi başarısız oldu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-600" />
            NFT'yi Marketplace'te Sat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dikkat:</strong> NFT'nizi marketplace'te listelemek için blockchain üzerinde onay işlemi gereklidir.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>NFT Bilgileri</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex gap-3">
                <img 
                  src={nft.image_url} 
                  alt={nft.title}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium">{nft.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{nft.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Kontrat: {nft.nft_contract?.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    Token ID: {nft.nft_token_id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="price">Satış Fiyatı (ETH)</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum: 0.001 ETH
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Marketplace Bilgileri</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Platform komisyonu: %2.5</p>
              <p>• Gas ücreti sizden tahsil edilecek</p>
              <p>• Satış gerçekleştiğinde otomatik transfer</p>
              <p>• İstediğiniz zaman listelemeyi iptal edebilirsiniz</p>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Bağlı değil'}</p>
            <p>• Tahmini Gas: ~0.005 ETH</p>
            <p>• Marketplace: Bros Chain NFT Platform</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleList}
              disabled={loading || !isConnected || !price}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Listeleniyor...' : 'Marketplace\'te Listele'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};