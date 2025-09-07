import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { tokenService, TokenInfo } from '@/services/tokenService';
import { tokenMarketplaceService, TokenListing } from '@/services/tokenMarketplaceService';
import { Coins, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';

interface TokenWithListing extends TokenInfo {
  id: string;
  description?: string;
  creator_id: string;
  community_id: string;
  listing?: TokenListing;
  userBalance?: string;
}

export function TokenMarketplace() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<TokenWithListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyAmounts, setBuyAmounts] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      
      // Fetch tokens from database
      const { data: dbTokens, error } = await supabase
        .from('dao_tokens')
        .select('*')
        .eq('status', 'deployed');

      if (error) throw error;

      const tokensWithInfo: TokenWithListing[] = [];

      for (const dbToken of dbTokens || []) {
        try {
          // Get token info from blockchain
          const tokenInfo = await tokenService.getTokenInfo(dbToken.token_address);
          
          // Get listing info
          const listing = await tokenMarketplaceService.getListing(
            dbToken.token_address, 
            dbToken.creator_id
          );

          // Get user balance if logged in
          let userBalance;
          if (user) {
            try {
              userBalance = await tokenService.getTokenBalance(
                dbToken.token_address,
                user.id // This should be wallet address, we need to fix this
              );
            } catch (error) {
              console.error('Error getting user balance:', error);
            }
          }

          tokensWithInfo.push({
            ...tokenInfo,
            id: dbToken.id,
            description: dbToken.description,
            creator_id: dbToken.creator_id,
            community_id: dbToken.community_id,
            listing,
            userBalance
          });
        } catch (error) {
          console.error('Error fetching token info:', error);
        }
      }

      setTokens(tokensWithInfo);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast.error('Token listesi yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyTokens = async (token: TokenWithListing) => {
    if (!user || !token.listing) return;

    const amount = buyAmounts[token.id] || '1';
    
    if (parseFloat(amount) <= 0) {
      toast.error('Geçerli bir miktar girin');
      return;
    }

    if (parseFloat(amount) > parseFloat(token.listing.amount)) {
      toast.error('Yeterli token mevcut değil');
      return;
    }

    try {
      await tokenMarketplaceService.buyTokens(
        token.address,
        token.listing.seller,
        amount,
        token.listing.pricePerToken
      );

      toast.success('Token başarıyla satın alındı!');
      fetchTokens(); // Refresh the list
      setBuyAmounts(prev => ({ ...prev, [token.id]: '' }));
    } catch (error) {
      console.error('Error buying tokens:', error);
      toast.error('Token satın alınırken hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Token Pazaryeri</h2>
      </div>

      {tokens.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Henüz satışta token bulunmuyor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => (
            <Card key={token.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    {token.name}
                  </CardTitle>
                  <Badge variant="secondary">{token.symbol}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {token.description && (
                    <p className="mb-2">{token.description}</p>
                  )}
                  <div className="space-y-1">
                    <p>Toplam Arz: {parseFloat(token.totalSupply).toLocaleString()}</p>
                    <p>Decimals: {token.decimals}</p>
                  </div>
                </div>

                {token.userBalance && (
                  <div className="bg-muted p-2 rounded text-sm">
                    <p>Bakiyeniz: {parseFloat(token.userBalance).toLocaleString()} {token.symbol}</p>
                  </div>
                )}

                {token.listing ? (
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">Satışta</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p>Miktar: {parseFloat(token.listing.amount).toLocaleString()} {token.symbol}</p>
                      <p>Fiyat: {token.listing.pricePerToken} ETH / token</p>
                      <p className="font-medium">
                        Toplam: {token.listing.totalPrice} ETH
                      </p>
                    </div>

                    {user && (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Miktar"
                          value={buyAmounts[token.id] || ''}
                          onChange={(e) => setBuyAmounts(prev => ({ 
                            ...prev, 
                            [token.id]: e.target.value 
                          }))}
                          max={token.listing.amount}
                        />
                        <Button
                          onClick={() => handleBuyTokens(token)}
                          className="w-full"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Satın Al
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground border-t">
                    <p className="text-sm">Şu an satışta değil</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}