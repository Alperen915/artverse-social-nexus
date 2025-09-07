import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreateTokenModal } from './CreateTokenModal';
import { tokenService } from '@/services/tokenService';
import { Coins, Plus, ExternalLink, TrendingUp } from 'lucide-react';

interface DAOToken {
  id: string;
  token_name: string;
  token_symbol: string;
  total_supply: number;
  token_address: string;
  deployment_tx_hash: string;
  description?: string;
  network: string;
  status: string;
  created_at: string;
  creator_id: string;
}

interface DAOTokenManagerProps {
  communityId: string;
}

export function DAOTokenManager({ communityId }: DAOTokenManagerProps) {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<DAOToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<{ [address: string]: string }>({});

  useEffect(() => {
    fetchTokens();
  }, [communityId]);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('dao_tokens')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTokens(data || []);

      // Fetch token balances for user
      if (user && data) {
        const balances: { [address: string]: string } = {};
        for (const token of data) {
          try {
            if (token.status === 'deployed') {
              const balance = await tokenService.getTokenBalance(
                token.token_address,
                user.id // This should be wallet address, needs wallet integration
              );
              balances[token.token_address] = balance;
            }
          } catch (error) {
            console.error('Error fetching balance for', token.token_address, error);
          }
        }
        setTokenBalances(balances);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast.error('Token listesi yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOnEtherscan = (txHash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
  };

  const handleViewTokenOnEtherscan = (address: string) => {
    window.open(`https://sepolia.etherscan.io/token/${address}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">DAO Token'ları</h3>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Token Oluştur
          </Button>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Coins className="w-5 h-5" />
          DAO Token'ları
        </h3>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Token Oluştur
        </Button>
      </div>

      {tokens.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Bu DAO henüz token oluşturmamış
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              İlk Token'ı Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tokens.map((token) => (
            <Card key={token.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    {token.token_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{token.token_symbol}</Badge>
                    <Badge 
                      variant={token.status === 'deployed' ? 'default' : 'secondary'}
                    >
                      {token.status === 'deployed' ? 'Aktif' : 'Beklemede'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {token.description && (
                  <p className="text-sm text-muted-foreground">
                    {token.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Toplam Arz</p>
                    <p>{token.total_supply.toLocaleString()} {token.token_symbol}</p>
                  </div>
                  <div>
                    <p className="font-medium">Network</p>
                    <p>{token.network}</p>
                  </div>
                </div>

                {tokenBalances[token.token_address] && (
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm font-medium">Bakiyeniz</p>
                    <p className="text-lg">
                      {parseFloat(tokenBalances[token.token_address]).toLocaleString()} {token.token_symbol}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewTokenOnEtherscan(token.token_address)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Token Kontratı
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOnEtherscan(token.deployment_tx_hash)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Deployment TX
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Adres: {token.token_address}</p>
                  <p>Oluşturulma: {new Date(token.created_at).toLocaleString('tr-TR')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTokenModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        communityId={communityId}
        onTokenCreated={fetchTokens}
      />
    </div>
  );
}