import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '@/services/marketplaceService';
import { ShoppingCart, ExternalLink, Coins, AlertCircle, Wallet, ArrowLeft } from 'lucide-react';

interface PublicNFTListing {
  id: string;
  submission_id: string;
  price: number;
  seller_address: string;
  status: string;
  created_at: string;
  gallery_submissions: {
    title: string;
    description: string;
    image_url: string;
    submitter_id: string;
    nft_galleries: {
      title: string;
      community_id: string;
      communities: {
        name: string;
      };
    };
  };
  nft_mints: {
    contract_address: string;
    token_id: string;
    metadata_uri: string;
  };
}

export const PublicNFTMarketplace = () => {
  const [listings, setListings] = useState<PublicNFTListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { address, isConnected, connectWallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('public_nft_marketplace')
        .select(`
          *,
          gallery_submissions (
            title,
            description,
            image_url,
            submitter_id,
            nft_galleries (
              title,
              community_id,
              communities (
                name
              )
            )
          ),
          nft_mints (
            contract_address,
            token_id,
            metadata_uri
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public NFT listings:', error);
      } else {
        setListings(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (listing: PublicNFTListing) => {
    if (!isConnected || !address) {
      alert('Lütfen MetaMask wallet\'ınızı bağlayın');
      return;
    }

    if (!user) {
      alert('Lütfen önce giriş yapın');
      return;
    }

    try {
      console.log('Purchasing NFT from marketplace...');
      
      // Purchase NFT through marketplace service
      const purchaseResult = await marketplaceService.buyNFT(
        listing.nft_mints.contract_address,
        listing.nft_mints.token_id,
        listing.price.toString()
      );

      console.log('NFT purchase successful:', purchaseResult);

      // Record the purchase on our backend
      const { data, error } = await supabase.functions.invoke('purchase-nft', {
        body: {
          mintId: listing.nft_mints.contract_address + '_' + listing.nft_mints.token_id,
          submissionId: listing.submission_id,
          buyerAddress: purchaseResult.buyer,
          sellerAddress: purchaseResult.seller,
          transactionHash: purchaseResult.transactionHash,
          price: parseFloat(purchaseResult.price),
          gasUsed: purchaseResult.gasUsed
        }
      });

      if (error) {
        console.error('Error recording purchase:', error);
        throw new Error('Satın alma kaydı başarısız');
      }

      alert(`NFT başarıyla satın alındı!\nTransaction: ${purchaseResult.transactionHash}\nGas kullanıldı: ${purchaseResult.gasUsed}`);
      fetchListings();
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      alert(`Satın alma işlemi başarısız oldu: ${error.message}`);
    }
  };

  const handleListForSale = async (submission: any, mintId: string, price: string) => {
    if (!isConnected || !address) {
      alert('Lütfen MetaMask wallet\'ınızı bağlayın');
      return;
    }

    try {
      console.log('Listing NFT on marketplace...');
      
      // List NFT through marketplace service
      const transactionHash = await marketplaceService.listNFT(
        submission.nft_contract,
        submission.nft_token_id,
        price
      );

      console.log('NFT listing successful:', transactionHash);

      // Record the listing on our backend
      const { data, error } = await supabase.functions.invoke('list-nft', {
        body: {
          submissionId: submission.id,
          mintId: mintId,
          sellerAddress: address,
          price: parseFloat(price),
          transactionHash: transactionHash
        }
      });

      if (error) {
        console.error('Error recording listing:', error);
        throw new Error('Listeleme kaydı başarısız');
      }

      alert(`NFT başarıyla marketplace'e listelendi!\nTransaction: ${transactionHash}`);
      fetchListings();
    } catch (error) {
      console.error('Error listing NFT:', error);
      alert(`Listeleme işlemi başarısız oldu: ${error.message}`);
    }
  };

  const getOpenseaUrl = (contractAddress: string, tokenId: string) => {
    return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">NFT'ler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Herkese Açık NFT Marketplace</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfa
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">
          <Coins className="w-5 h-5 inline mr-2" />
          Marketplace Nasıl Çalışır?
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Topluluk galerilerinde oylanarak kabul edilen NFT'ler burada satılır</li>
          <li>• Satın aldığınız NFT'ler blockchain'de size transfer edilir</li>
          <li>• Tüm satışlar güvenli smart contract'lar ile gerçekleşir</li>
          <li>• Satış gelirleri galeriyi oluşturan topluluk üyelerine dağıtılır</li>
        </ul>
      </div>

      {!isConnected && (
        <Alert>
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            NFT satın almak için MetaMask wallet'ınızı bağlamanız gerekiyor.
            <Button 
              onClick={connectWallet} 
              variant="outline" 
              size="sm" 
              className="ml-3"
            >
              Wallet Bağla
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {listings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Henüz NFT satışta değil
          </h3>
          <p className="text-gray-600">
            Topluluk galerilerinden onaylanan NFT'ler burada görünecek
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={listing.gallery_submissions.image_url}
                  alt={listing.gallery_submissions.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              <CardHeader className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-base leading-tight">
                    {listing.gallery_submissions.title}
                  </CardTitle>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    {listing.gallery_submissions.nft_galleries.communities.name}
                  </Badge>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {listing.gallery_submissions.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-4">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Galeri: {listing.gallery_submissions.nft_galleries.title}</p>
                  <p>Kontrat: {listing.nft_mints.contract_address.slice(0, 8)}...</p>
                  <p>Token ID: {listing.nft_mints.token_id}</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-bold text-lg text-purple-600">
                    {listing.price} ETH
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    Satışta
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePurchase(listing)}
                    disabled={!isConnected || !user}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {!isConnected ? 'Wallet Bağla' : 'Satın Al'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(
                      getOpenseaUrl(listing.nft_mints.contract_address, listing.nft_mints.token_id), 
                      '_blank'
                    )}
                    className="px-3"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};