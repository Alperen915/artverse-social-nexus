import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { tokenMarketplaceService } from '@/services/tokenMarketplaceService';
import { tokenService, TokenInfo } from '@/services/tokenService';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { SellTokenModal } from './SellTokenModal';

interface TokenListing {
  id: string;
  token_address: string;
  seller: string;
  amount: number;
  price_per_token: number;
  total_price: number;
  status: string;
  created_at: string;
}

interface TokenWithListing extends TokenInfo {
  listings: TokenListing[];
  userBalance?: string;
  userListing?: TokenListing;
  description?: string;
}

export const TokenMarketplace = () => {
  const [tokens, setTokens] = useState<TokenWithListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyAmounts, setBuyAmounts] = useState<Record<string, string>>({});
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenWithListing | null>(null);
  const { user } = useAuth();
  const { address } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      
      // Fetch active listings from database
      const { data: listings, error: listingsError } = await supabase
        .from('token_marketplace_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        return;
      }

      // Group listings by token address
      const listingsByToken = listings?.reduce((acc, listing) => {
        if (!acc[listing.token_address]) {
          acc[listing.token_address] = [];
        }
        acc[listing.token_address].push(listing);
        return acc;
      }, {} as Record<string, TokenListing[]>) || {};

      // Get unique token addresses
      const tokenAddresses = Object.keys(listingsByToken);
      
      if (tokenAddresses.length === 0) {
        setTokens([]);
        return;
      }

      // Fetch token info for each unique token
      const tokensWithInfo = await Promise.all(
        tokenAddresses.map(async (tokenAddress) => {
          try {
            // Try to get token info from DAO tokens first
            const { data: daoToken } = await supabase
              .from('dao_tokens')
              .select('*')
              .eq('token_address', tokenAddress)
              .single();

            let tokenInfo: TokenInfo;
            
            if (daoToken) {
              tokenInfo = await tokenService.getTokenInfo(tokenAddress);
            } else {
              // Fallback to default network
              tokenInfo = await tokenService.getTokenInfo(tokenAddress);
            }
            
            // Fetch user balance if logged in and wallet connected
            let userBalance = '0';
            let userListing: TokenListing | undefined;
            
            if (user && address) {
              try {
                userBalance = await tokenService.getTokenBalance(tokenAddress, user.id);
                // Check if user has an active listing for this token
                userListing = listingsByToken[tokenAddress]?.find(
                  listing => listing.seller.toLowerCase() === address.toLowerCase()
                );
              } catch (balanceError) {
                console.error('Error fetching balance:', balanceError);
              }
            }

            return {
              ...tokenInfo,
              userBalance,
              listings: listingsByToken[tokenAddress] || [],
              userListing
            };
          } catch (error) {
            console.error('Error fetching token info for', tokenAddress, error);
            return null;
          }
        })
      );

      const validTokens = tokensWithInfo.filter(Boolean) as TokenWithListing[];
      setTokens(validTokens);
    } catch (error) {
      console.error('Error in fetchTokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyTokens = async (token: TokenWithListing, listing: TokenListing) => {
    const amount = buyAmounts[`${token.address}-${listing.id}`];
    if (!amount || !address) {
      toast({
        title: "Hata",
        description: "Lütfen miktar girin ve cüzdanınızı bağlayın",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0 || amountNum > listing.amount) {
      toast({
        title: "Hata",
        description: "Geçersiz miktar",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await tokenMarketplaceService.buyTokens(
        token.address,
        listing.seller,
        amount,
        listing.price_per_token.toString()
      );

      // Update listing amount in database
      const newAmount = listing.amount - amountNum;
      const { error } = await supabase
        .from('token_marketplace_listings')
        .update({ 
          amount: newAmount,
          status: newAmount <= 0 ? 'sold' : 'active'
        })
        .eq('id', listing.id);

      if (error) {
        console.error('Database update error:', error);
      }

      // Record transaction
      await supabase
        .from('token_transactions')
        .insert({
          token_address: token.address,
          from_address: listing.seller,
          to_address: address,
          amount: amountNum,
          price_per_token: listing.price_per_token,
          total_price: amountNum * listing.price_per_token,
          transaction_type: 'purchase',
          transaction_hash: result.transactionHash
        });

      toast({
        title: "Başarılı",
        description: `${amountNum} ${token.symbol} token satın alındı!`,
      });
      
      // Refresh tokens to update balances
      await fetchTokens();
      
      // Clear the input
      setBuyAmounts(prev => ({ ...prev, [`${token.address}-${listing.id}`]: '' }));
    } catch (error: any) {
      console.error('Error buying tokens:', error);
      toast({
        title: "Hata",
        description: error.message || "Token satın alınırken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleSellToken = (token: TokenWithListing) => {
    setSelectedToken(token);
    setSellModalOpen(true);
  };

  const handleCancelListing = async (token: TokenWithListing) => {
    if (!token.userListing || !address) return;

    try {
      // Cancel listing on blockchain
      await tokenMarketplaceService.cancelListing(token.address);

      // Update listing status in database
      const { error } = await supabase
        .from('token_marketplace_listings')
        .update({ status: 'cancelled' })
        .eq('id', token.userListing.id);

      if (error) {
        console.error('Database update error:', error);
      }

      toast({
        title: "Başarılı",
        description: "Listing iptal edildi",
      });

      // Refresh tokens
      await fetchTokens();
    } catch (error: any) {
      console.error('Error cancelling listing:', error);
      toast({
        title: "Hata",
        description: error.message || "Listing iptal edilirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Token Marketplace</h1>
        <p className="text-muted-foreground">
          DAO tokenları alın ve satın
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Şu anda satışa sunulan token bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <Card key={token.address} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{token.name}</CardTitle>
                  <Badge variant="secondary">{token.symbol}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {token.description || 'DAO Token'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Supply</p>
                    <p className="font-medium">{parseFloat(token.totalSupply).toLocaleString()} {token.symbol}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Decimals</p>
                    <p className="font-medium">{token.decimals}</p>
                  </div>
                </div>

                {user && address && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Your Balance</p>
                    <p className="font-medium">{token.userBalance || '0'} {token.symbol}</p>
                  </div>
                )}

                {/* User's listing controls */}
                {user && address && (
                  <div className="flex gap-2">
                    {token.userListing ? (
                      <div className="flex-1 space-y-2">
                        <div className="text-xs text-muted-foreground">
                          Your listing: {token.userListing.amount} {token.symbol} @ {token.userListing.price_per_token} ETH
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCancelListing(token)}
                          className="w-full"
                        >
                          Cancel Listing
                        </Button>
                      </div>
                    ) : parseFloat(token.userBalance || '0') > 0 ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSellToken(token)}
                        className="flex-1"
                      >
                        Sell Tokens
                      </Button>
                    ) : null}
                  </div>
                )}

                {/* Available listings */}
                {token.listings && token.listings.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Available Listings:</h4>
                    {token.listings.map((listing) => (
                      <div key={listing.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Amount: {listing.amount} {token.symbol}</span>
                          <span>Price: {listing.price_per_token} ETH</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total: {listing.total_price} ETH
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                        </div>
                        
                        {user && address && listing.seller.toLowerCase() !== address.toLowerCase() && (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Amount"
                              value={buyAmounts[`${token.address}-${listing.id}`] || ''}
                              onChange={(e) => setBuyAmounts(prev => ({ 
                                ...prev, 
                                [`${token.address}-${listing.id}`]: e.target.value 
                              }))}
                              max={listing.amount}
                              className="text-sm"
                            />
                            <Button 
                              onClick={() => handleBuyTokens(token, listing)}
                              size="sm"
                            >
                              Buy
                            </Button>
                          </div>
                        )}
                        
                        {user && address && listing.seller.toLowerCase() === address.toLowerCase() && (
                          <Badge variant="outline" className="text-xs">
                            Your Listing
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(!token.listings || token.listings.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No listings available
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sell Token Modal */}
      {selectedToken && (
        <SellTokenModal
          open={sellModalOpen}
          onOpenChange={setSellModalOpen}
          tokenAddress={selectedToken.address}
          tokenSymbol={selectedToken.symbol}
          tokenName={selectedToken.name}
          userBalance={selectedToken.userBalance || '0'}
          onListingCreated={fetchTokens}
        />
      )}
    </div>
  );
};