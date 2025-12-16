
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { useContracts } from '@/hooks/useContracts';
import { supabase } from '@/integrations/supabase/client';
import { uploadToIPFS, NFTMetadata } from '@/utils/ipfsService';
import { web3Service } from '@/services/web3Service';
import { Coins, AlertTriangle, Upload, CheckCircle2 } from 'lucide-react';

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
  const { nftContract, currentNetwork, isContractDeployed, isSupportedNetwork } = useContracts();

  // Auto-fill contract address when network changes
  useEffect(() => {
    if (nftContract && nftContract !== '0x0000000000000000000000000000000000000000') {
      setContractAddress(nftContract);
    }
  }, [nftContract]);

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
      // First, upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      
      // Convert image URL to File object for IPFS upload
      const imageResponse = await fetch(submission.image_url);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], `${submission.title}.jpg`, { type: 'image/jpeg' });

      const nftMetadata: NFTMetadata = {
        title: submission.title,
        description: submission.description,
        creator: address,
        attributes: [
          { trait_type: 'Original Price', value: `${submission.price} ETH` },
          { trait_type: 'Minted By', value: address },
          { trait_type: 'Submission ID', value: submission.id }
        ],
        royalty_percentage: 5
      };

      const ipfsResult = await uploadToIPFS(nftMetadata, imageFile);
      
      if (!ipfsResult.success) {
        throw new Error(ipfsResult.error || 'IPFS upload failed');
      }

      console.log('IPFS upload successful:', ipfsResult);

      // Connect wallet and mint NFT on blockchain
      const walletAddress = await web3Service.connectWallet();
      if (!walletAddress) {
        throw new Error('Wallet bağlantısı başarısız');
      }

      console.log('Blockchain üzerinde NFT mintleniyor...');
      const { transactionHash, tokenId } = await web3Service.mintNFT(
        contractAddress,
        address,
        ipfsResult.metadataIpfsUrl
      );

      console.log('NFT blockchain üzerinde başarıyla mintlendi:', { transactionHash, tokenId });

      // Record the mint on our backend
      const { data, error } = await supabase.functions.invoke('mint-nft', {
        body: {
          submissionId: submission.id,
          contractAddress,
          recipientAddress: address,
          metadataUri: ipfsResult.metadataIpfsUrl,
          transactionHash,
          tokenId
        }
      });

      if (error) {
        console.error('Error recording mint:', error);
        throw new Error('Veritabanına kayıt başarısız');
      }

      alert(`NFT başarıyla mintlendi!\nToken ID: ${tokenId}\nTransaction: ${transactionHash}\nIPFS: ${ipfsResult.metadataIpfsHash}`);
      onMintComplete();
      onClose();
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert(`NFT minting işlemi başarısız oldu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
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
          {!isSupportedNetwork && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Desteklenmeyen ağ. Lütfen Sepolia, Polygon veya diğer desteklenen ağlardan birine geçin.
              </AlertDescription>
            </Alert>
          )}

          {isContractDeployed && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                {currentNetwork?.chainName || 'Unknown Network'} ağında NFT kontratı hazır.
              </AlertDescription>
            </Alert>
          )}

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
            {isContractDeployed && (
              <p className="text-xs text-green-600 mt-1">✓ Varsayılan kontrat adresi kullanılıyor</p>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Bağlı değil'}</p>
            <p>• Ağ: {currentNetwork?.chainName || 'Bağlı değil'}</p>
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
