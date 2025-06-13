
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { ShoppingCart, ExternalLink, Coins } from 'lucide-react';

interface NFTListing {
  id: string;
  price: number;
  marketplace: string;
  status: string;
  created_at: string;
  nft_mints: {
    contract_address: string;
    token_id: string;
    metadata_uri: string;
    gallery_submissions: {
      title: string;
      description: string;
      image_url: string;
      submitter_id: string;
    };
  };
}

interface NFTMarketplaceProps {
  galleryId: string;
}

export const NFTMarketplace = ({ galleryId }: NFTMarketplaceProps) => {
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { address, isConnected } = useWallet();

  useEffect(() => {
    fetchListings();
  }, [galleryId]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('nft_listings')
        .select(`
          *,
          nft_mints (
            contract_address,
            token_id,
            metadata_uri,
            gallery_submissions (
              title,
              description,
              image_url,
              submitter_id
            )
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching NFT listings:', error);
      } else {
        // Filter listings for the specific gallery
        const galleryListings = (data || []).filter(listing => {
          // This would need to be filtered by gallery in a real implementation
          return true;
        });
        setListings(galleryListings);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (listing: NFTListing) => {
    if (!isConnected || !address) {
      alert('Lütfen wallet bağlantınızı kontrol edin');
      return;
    }

    try {
      // Simulate NFT purchase
      const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      // Update listing status
      const { error: updateError } = await supabase
        .from('nft_listings')
        .update({ 
          status: 'sold',
          transaction_hash: transactionHash
        })
        .eq('id', listing.id);

      // Record blockchain transaction
      const { error: txError } = await supabase
        .from('blockchain_transactions')
        .insert({
          tx_hash: transactionHash,
          from_address: address,
          to_address: listing.nft_mints.gallery_submissions.submitter_id, // This would be seller address
          value: listing.price,
          transaction_type: 'sale',
          status: 'confirmed',
          metadata: {
            listing_id: listing.id,
            nft_contract: listing.nft_mints.contract_address,
            token_id: listing.nft_mints.token_id
          }
        });

      if (updateError || txError) {
        console.error('Error processing purchase:', updateError || txError);
        alert('Satın alma işlemi başarısız oldu');
      } else {
        alert(`NFT başarıyla satın alındı! Transaction: ${transactionHash.slice(0, 10)}...`);
        fetchListings();
      }
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      alert('Satın alma işlemi başarısız oldu');
    }
  };

  const getOpenseaUrl = (contractAddress: string, tokenId: string) => {
    return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">NFT'ler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">NFT Marketplace</h3>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Henüz NFT listesi bulunmuyor</p>
          <p className="text-sm text-gray-500 mt-1">Mintlenen eserler buraya listelenir</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100">
                <img
                  src={listing.nft_mints.gallery_submissions.image_url}
                  alt={listing.nft_mints.gallery_submissions.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">
                    {listing.nft_mints.gallery_submissions.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {listing.marketplace}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-3">
                <div className="text-xs text-gray-600">
                  <p>Kontrat: {listing.nft_mints.contract_address.slice(0, 8)}...</p>
                  <p>Token ID: {listing.nft_mints.token_id}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{listing.price} ETH</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Satışta
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePurchase(listing)}
                    disabled={!isConnected}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Satın Al
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(
                      getOpenseaUrl(listing.nft_mints.contract_address, listing.nft_mints.token_id), 
                      '_blank'
                    )}
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
