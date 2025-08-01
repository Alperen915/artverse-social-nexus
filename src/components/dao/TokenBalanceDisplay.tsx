import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Wallet, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TokenBalance {
  id: string;
  token_symbol: string;
  balance: number;
  chain_name: string;
}

export const TokenBalanceDisplay = () => {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBalances = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_token_balances')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching token balances:', error);
      } else {
        setBalances(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateTokenEarn = async () => {
    if (!user) return;

    const earnAmount = Math.floor(Math.random() * 100 + 10);
    
    try {
      const { error } = await supabase
        .from('user_token_balances')
        .update({
          balance: balances[0]?.balance + earnAmount || earnAmount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('token_symbol', 'BROS');

      if (!error) {
        fetchBalances();
      }
    } catch (error) {
      console.error('Error earning tokens:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalances();
    }
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            Token bakiyenizi görmek için oturum açın
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Bakiye yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  const brosBalance = balances.find(b => b.token_symbol === 'BROS');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          Bros Chain Cüzdan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {brosBalance ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {brosBalance.balance.toLocaleString()} BROS
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {brosBalance.chain_name}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Aktif
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBalances}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Yenile
              </Button>
              <Button
                size="sm"
                onClick={() => toast({ title: "Bilgi", description: "Token kazanma sistemi geliştirilme aşamasında" })}
                disabled
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 opacity-50"
              >
                <Coins className="w-4 h-4 mr-1" />
                Token Kazan
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Bu veriler simüle edilmiştir. Gerçek Bros Chain entegrasyonu için geliştirme devam ediyor.
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <Wallet className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              Henüz token bakiyeniz yok
            </p>
            <Button
              size="sm"
              onClick={() => toast({ title: "Bilgi", description: "Token kazanma sistemi geliştirilme aşamasında" })}
              disabled
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 opacity-50"
            >
              <Coins className="w-4 h-4 mr-1" />
              İlk Tokenları Al
            </Button>
          </div>
        )}

        <div className="border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => window.open('https://bros-chain.example.com', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Bros Chain Explorer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};