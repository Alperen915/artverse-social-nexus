
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Coins, AlertTriangle } from 'lucide-react';

interface NFTMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    price: number;
  };
  onMintComplete: () => void;
}

export const NFTMintModal = ({ isOpen, onClose, submission, onMintComplete }: NFTMintModalProps) => {
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useWallet();
  const { user } = useAuth();

  const handleMint = async () => {
    if (!isConnected || !address || !user) {
      alert('Lütfen wallet bağlantınızı kontrol edin');
      return;
    }

    if (!contractAddress) {
      alert('Lütfen NFT kontrat adresini girin');
      return;
    }

    setLoading(true);
    try {
      // Simulate NFT minting process
      const tokenId = Math.floor(Math.random() * 1000000).toString();
      const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      // Create metadata URI (simulated)
      const metadata = {
        name: submission.title,
        description: submission.description,
        image: submission.image_url,
        attributes: [
          { trait_type: 'Original Price', value: submission.price + ' ETH' },
          { trait_type: 'Minted By', value: address }
        ]
      };
      
      const metadataUri = `https://ipfs.io/ipfs/${Math.random().toString(36).substr(2, 46)}`;
      
      // Record the mint in database
      const { error } = await supabase
        .from('nft_mints')
        .insert({
          submission_id: submission.id,
          minter_address: address,
          contract_address: contractAddress,
          token_id: tokenId,
          transaction_hash: transactionHash,
          metadata_uri: metadataUri,
          gas_used: 150000,
          gas_price: 20000000000,
          status: 'confirmed'
        });

      if (error) {
        console.error('Error recording mint:', error);
        alert('NFT mint kaydı başarısız oldu');
      } else {
        // Update gallery submission with NFT contract info
        await supabase
          .from('gallery_submissions')
          .update({
            nft_contract: contractAddress,
            nft_token_id: tokenId
          })
          .eq('id', submission.id);

        alert(`NFT başarıyla mintlendi! Token ID: ${tokenId}`);
        onMintComplete();
        onClose();
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('NFT minting işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-purple-600" />
            NFT Olarak Mintleme
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dikkat:</strong> Bu işlem blockchain üzerinde gerçekleşir ve geri alınamaz. Gas ücretleri tahsil edilecektir.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Eser Bilgileri</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{submission.title}</p>
              <p className="text-sm text-gray-600">{submission.description}</p>
              <p className="text-xs text-gray-500 mt-1">Orijinal Fiyat: {submission.price} ETH</p>
            </div>
          </div>

          <div>
            <Label htmlFor="contract">NFT Kontrat Adresi</Label>
            <Input
              id="contract"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
            />
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Bağlı değil'}</p>
            <p>• Tahmini Gas: ~0.003 ETH</p>
            <p>• NFT standart: ERC-721</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleMint}
              disabled={loading || !isConnected || !contractAddress}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Mintleniyor...' : 'NFT Olarak Mintle'}
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
