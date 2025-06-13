
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Activity, ExternalLink } from 'lucide-react';

interface Transaction {
  id: string;
  tx_hash: string;
  from_address: string;
  to_address: string;
  value: number;
  gas_used: number;
  gas_price: number;
  transaction_type: string;
  status: string;
  created_at: string;
  metadata: any;
}

interface BlockchainTransactionsProps {
  galleryId?: string;
}

export const BlockchainTransactions = ({ galleryId }: BlockchainTransactionsProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, galleryId]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('blockchain_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mint':
        return 'bg-purple-100 text-purple-800';
      case 'sale':
        return 'bg-blue-100 text-blue-800';
      case 'transfer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEtherscanUrl = (txHash: string) => {
    return `https://etherscan.io/tx/${txHash}`;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">İşlemler yükleniyor...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Blockchain İşlemleri
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-6 text-gray-600">
            <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p>Henüz blockchain işlemi bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getTypeColor(tx.transaction_type)}>
                      {tx.transaction_type.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(tx.status)}>
                      {tx.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-mono text-xs">
                        {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)}
                      </span>
                    </p>
                    <p>
                      {tx.from_address.slice(0, 6)}...{tx.from_address.slice(-4)} → {' '}
                      {tx.to_address ? 
                        `${tx.to_address.slice(0, 6)}...${tx.to_address.slice(-4)}` : 
                        'Kontrat'
                      }
                    </p>
                    {tx.value > 0 && (
                      <p className="font-semibold">{tx.value} ETH</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString('tr-TR')}
                  </span>
                  <button
                    onClick={() => window.open(getEtherscanUrl(tx.tx_hash), '_blank')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
