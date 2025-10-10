import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TreasuryTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  from_address?: string;
  to_address?: string;
}

interface TreasuryDashboardProps {
  communityId: string;
}

export function TreasuryDashboard({ communityId }: TreasuryDashboardProps) {
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTreasuryData();
  }, [communityId]);

  const fetchTreasuryData = async () => {
    try {
      setLoading(true);

      // Fetch community balance
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('dao_treasury_balance')
        .eq('id', communityId)
        .single();

      if (communityError) throw communityError;
      setBalance(community?.dao_treasury_balance || 0);

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('treasury_transactions')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Hazine verileri yüklenemedi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const income = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expenses };
  };

  const getChartData = () => {
    const last30Days = transactions.slice(0, 30).reverse();
    let runningBalance = balance;
    
    return last30Days.map(tx => {
      const date = new Date(tx.created_at).toLocaleDateString('tr-TR', { 
        month: 'short', 
        day: 'numeric' 
      });
      runningBalance = tx.transaction_type === 'income' 
        ? runningBalance - Number(tx.amount)
        : runningBalance + Number(tx.amount);
      
      return {
        date,
        balance: Number(runningBalance.toFixed(2))
      };
    }).reverse();
  };

  const stats = calculateStats();

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bakiye</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance.toFixed(2)} BROS</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.income.toFixed(2)} BROS</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{stats.expenses.toFixed(2)} BROS</div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Bakiye Geçmişi</CardTitle>
          <CardDescription>Son 30 işlem</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Son İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    tx.transaction_type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <DollarSign className={`h-4 w-4 ${
                      tx.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{tx.description || tx.transaction_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className={`font-bold ${
                  tx.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.transaction_type === 'income' ? '+' : '-'}{Number(tx.amount).toFixed(2)} BROS
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
